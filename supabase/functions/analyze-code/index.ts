import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { repositoryId, commitSha, assignmentId } = await req.json();
    
    console.log('Analyzing code:', { repositoryId, commitSha, assignmentId });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get repository details
    const { data: repo, error: repoError } = await supabaseClient
      .from('repositories')
      .select('*, students:student_id(github_username)')
      .eq('id', repositoryId)
      .single();

    if (repoError) throw repoError;

    // Get assignment requirements if provided
    let requirements = [];
    if (assignmentId) {
      const { data: assignment } = await supabaseClient
        .from('assignments')
        .select('requirements, rubric')
        .eq('id', assignmentId)
        .single();
      
      if (assignment) {
        requirements = assignment.requirements || [];
      }
    }

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabaseClient
      .from('analyses')
      .insert({
        repository_id: repositoryId,
        assignment_id: assignmentId,
        commit_sha: commitSha,
        status: 'processing'
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

    // Call Lovable AI for code analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `Analyze this GitHub repository for educational purposes:

Repository: ${repo.repo_url}
Commit SHA: ${commitSha}

${requirements.length > 0 ? `Assignment Requirements:\n${requirements.map((r: any, i: number) => `${i + 1}. ${r.description}`).join('\n')}` : 'Perform a general code quality analysis.'}

Please provide:
1. Requirements Met: Check each requirement and provide status (met/partially met/not met) with evidence
2. Topic Coverage: Identify programming topics demonstrated (OOP, APIs, Testing, Database, Auth, etc.) with percentage coverage
3. Code Quality Score: Rate the code quality (0-100) based on structure, organization, and best practices
4. Feedback: Provide constructive, encouraging feedback about what's working well
5. Suggestions: Offer 3-5 specific, actionable improvement suggestions

Return your analysis in JSON format with these exact keys:
{
  "requirementsMet": [{"requirement": "...", "status": "met/partially/not", "evidence": "..."}],
  "topicCoverage": {"OOP": 80, "APIs": 60, ...},
  "codeQualityScore": 85,
  "feedback": "Great work on...",
  "suggestions": ["Add error handling to...", ...]
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert coding mentor analyzing student code. Provide constructive, specific feedback." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (aiResponse.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to your workspace.");
      }
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysisResult = JSON.parse(aiData.choices[0].message.content);

    // Calculate overall grade
    const requirementsMet = analysisResult.requirementsMet || [];
    const metCount = requirementsMet.filter((r: any) => r.status === 'met').length;
    const overallGrade = requirements.length > 0 
      ? (metCount / requirements.length) * 100 
      : analysisResult.codeQualityScore;

    // Update analysis with results
    await supabaseClient
      .from('analyses')
      .update({
        status: 'completed',
        overall_grade: overallGrade,
        requirements_met: requirementsMet,
        topic_coverage: analysisResult.topicCoverage || {},
        feedback: analysisResult.feedback,
        suggestions: analysisResult.suggestions || [],
        code_quality_score: analysisResult.codeQualityScore,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', analysis.id);

    console.log('Analysis completed:', { analysisId: analysis.id, overallGrade });

    return new Response(JSON.stringify({ 
      success: true, 
      analysisId: analysis.id,
      overallGrade,
      feedback: analysisResult.feedback
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

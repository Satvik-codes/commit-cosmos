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
    const authHeader = req.headers.get('authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
      {
        global: {
          headers: { authorization: authHeader ?? '' },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Get user profile to check role
    const { data: profile } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const { type } = await req.json();

    if (type === 'student') {
      // Student dashboard data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get student's activities
      const { data: activities } = await supabaseClient
        .from('activities')
        .select('*')
        .eq('student_id', user.id)
        .gte('occurred_at', thirtyDaysAgo.toISOString())
        .order('occurred_at', { ascending: false });

      // Get student's repositories and latest analyses
      const { data: repositories } = await supabaseClient
        .from('repositories')
        .select(`
          *,
          analyses (
            *,
            assignments (title)
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      // Calculate streak
      const activityDates = activities?.map(a => new Date(a.occurred_at).toDateString()) || [];
      const uniqueDates = [...new Set(activityDates)];
      
      return new Response(JSON.stringify({
        activities: activities || [],
        repositories: repositories || [],
        stats: {
          totalCommits: activities?.filter(a => a.activity_type === 'commit').length || 0,
          activeRepositories: repositories?.length || 0,
          currentStreak: uniqueDates.length,
          recentAnalyses: repositories?.flatMap(r => r.analyses || []).slice(0, 3) || []
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'teacher' && profile?.role === 'teacher') {
      // Teacher dashboard data
      // Get teacher's batches
      const { data: batches } = await supabaseClient
        .from('batches')
        .select(`
          *,
          batch_students (
            student:student_id (
              id,
              full_name,
              github_username,
              repositories (
                id,
                repo_name,
                analyses (
                  overall_grade,
                  analyzed_at
                )
              ),
              activities (
                activity_type,
                occurred_at
              )
            )
          )
        `)
        .eq('teacher_id', user.id)
        .eq('is_active', true);

      // Calculate batch health metrics
      const batchMetrics = batches?.map(batch => {
        const students = batch.batch_students?.map((bs: any) => bs.student) || [];
        const activeStudents = students.filter((s: any) => {
          const recentActivity = s.activities?.some((a: any) => {
            const activityDate = new Date(a.occurred_at);
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            return activityDate >= threeDaysAgo;
          });
          return recentActivity;
        });

        const avgGrade = students.reduce((sum: number, s: any) => {
          const latestAnalysis = s.repositories?.[0]?.analyses?.[0];
          return sum + (latestAnalysis?.overall_grade || 0);
        }, 0) / (students.length || 1);

        return {
          batchId: batch.id,
          batchName: batch.name,
          totalStudents: students.length,
          activeStudents: activeStudents.length,
          averageGrade: avgGrade,
          needsAttention: students.length - activeStudents.length
        };
      }) || [];

      return new Response(JSON.stringify({
        batches: batches || [],
        metrics: batchMetrics,
        alerts: [] // TODO: Generate intelligent alerts
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid dashboard type');

  } catch (error) {
    console.error('Dashboard data error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: errorMessage === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

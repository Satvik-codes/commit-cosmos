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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { studentId, githubToken } = await req.json();

    if (!studentId || !githubToken) {
      throw new Error('Missing required parameters: studentId and githubToken');
    }

    console.log('Syncing GitHub data for student:', studentId);

    // Fetch user's GitHub data
    const githubHeaders = {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SPYGIT-App'
    };

    // Get user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: githubHeaders
    });

    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();

    // Get repositories
    const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: githubHeaders
    });

    const repos = await reposResponse.json();

    // Get recent commits across all repos
    const commitsData = [];
    for (const repo of repos.slice(0, 10)) { // Limit to 10 most recent repos
      try {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?per_page=10&author=${userData.login}`,
          { headers: githubHeaders }
        );
        
        if (commitsResponse.ok) {
          const commits = await commitsResponse.json();
          commitsData.push(...commits.map((commit: any) => ({
            repo: repo.name,
            sha: commit.sha,
            message: commit.commit.message,
            date: commit.commit.author.date,
            url: commit.html_url
          })));
        }
      } catch (error) {
        console.error(`Error fetching commits for ${repo.name}:`, error);
      }
    }

    // Get pull requests
    const prsResponse = await fetch(
      `https://api.github.com/search/issues?q=author:${userData.login}+type:pr&sort=updated&per_page=50`,
      { headers: githubHeaders }
    );

    const prsData = await prsResponse.json();

    // Update profile with GitHub data
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        github_username: userData.login,
        github_avatar_url: userData.avatar_url,
        github_repos_count: userData.public_repos,
        last_github_sync: new Date().toISOString()
      })
      .eq('id', studentId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw profileError;
    }

    // Store repositories
    for (const repo of repos) {
      const { error: repoError } = await supabaseClient
        .from('repositories')
        .upsert({
          student_id: studentId,
          github_repo_id: repo.id.toString(),
          name: repo.name,
          full_name: repo.full_name,
          private: repo.private,
          html_url: repo.html_url,
          description: repo.description,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          last_synced_at: new Date().toISOString()
        }, {
          onConflict: 'github_repo_id'
        });

      if (repoError) {
        console.error(`Error upserting repo ${repo.name}:`, repoError);
      }
    }

    // Store recent activities
    for (const commit of commitsData.slice(0, 50)) { // Store last 50 commits
      try {
        const { data: repo } = await supabaseClient
          .from('repositories')
          .select('id')
          .eq('student_id', studentId)
          .eq('name', commit.repo)
          .single();

        if (repo) {
          await supabaseClient
            .from('activities')
            .upsert({
              student_id: studentId,
              repository_id: repo.id,
              activity_type: 'commit',
              commit_sha: commit.sha,
              commit_message: commit.message,
              occurred_at: commit.date
            }, {
              onConflict: 'commit_sha'
            });
        }
      } catch (error) {
        console.error('Error storing commit activity:', error);
      }
    }

    console.log('GitHub sync completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      data: {
        username: userData.login,
        repos_count: repos.length,
        commits_synced: commitsData.length,
        prs_count: prsData.total_count
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('GitHub sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

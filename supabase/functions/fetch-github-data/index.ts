import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get user's GitHub token from the session
    const { data: userData } = await supabaseClient
      .from("users")
      .select("github_access_token")
      .eq("id", user.id)
      .single();

    if (!userData?.github_access_token) {
      throw new Error("GitHub token not found");
    }

    const githubToken = userData.github_access_token;

    // Fetch GitHub user data
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.statusText}`);
    }

    const githubUser = await userResponse.json();

    // Fetch repositories
    const reposResponse = await fetch(
      `https://api.github.com/user/repos?sort=updated&per_page=100`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const repos = await reposResponse.json();

    // Fetch recent commits across all repos
    const commitPromises = repos.slice(0, 10).map(async (repo: any) => {
      const commitsResponse = await fetch(
        `https://api.github.com/repos/${githubUser.login}/${repo.name}/commits?per_page=10`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      
      if (commitsResponse.ok) {
        const commits = await commitsResponse.json();
        return { repo: repo.name, commits };
      }
      return { repo: repo.name, commits: [] };
    });

    const commitsData = await Promise.all(commitPromises);

    // Fetch pull requests
    const prResponse = await fetch(
      `https://api.github.com/search/issues?q=author:${githubUser.login}+type:pr&sort=updated&per_page=50`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const pullRequests = await prResponse.json();

    // Update user profile with GitHub data
    await supabaseClient
      .from("users")
      .update({
        github_username: githubUser.login,
        github_avatar_url: githubUser.avatar_url,
        github_repos_count: githubUser.public_repos,
        last_github_sync: new Date().toISOString(),
      })
      .eq("id", user.id);

    // Upsert repositories
    for (const repo of repos) {
      await supabaseClient
        .from("repositories")
        .upsert({
          student_id: user.id,
          repo_name: repo.name,
          repo_url: repo.html_url,
          github_repo_id: repo.id,
          default_branch: repo.default_branch || "main",
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: "github_repo_id",
        });
    }

    // Store commit activities
    for (const repoData of commitsData) {
      const { data: repoRecord } = await supabaseClient
        .from("repositories")
        .select("id")
        .eq("student_id", user.id)
        .eq("repo_name", repoData.repo)
        .single();

      if (repoRecord) {
        for (const commit of repoData.commits) {
          await supabaseClient
            .from("activities")
            .upsert({
              student_id: user.id,
              repository_id: repoRecord.id,
              activity_type: "commit",
              commit_sha: commit.sha,
              commit_message: commit.commit.message,
              occurred_at: commit.commit.author.date,
              metadata: {
                author: commit.commit.author,
                stats: commit.stats || {},
              },
            }, {
              onConflict: "commit_sha",
            });
        }
      }
    }

    // Store PR activities
    for (const pr of pullRequests.items || []) {
      await supabaseClient
        .from("activities")
        .upsert({
          student_id: user.id,
          activity_type: "pull_request",
          github_event_id: pr.id.toString(),
          occurred_at: pr.updated_at,
          metadata: {
            title: pr.title,
            state: pr.state,
            url: pr.html_url,
          },
        }, {
          onConflict: "github_event_id",
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: githubUser,
          repos: repos.length,
          commits: commitsData.reduce((acc, r) => acc + r.commits.length, 0),
          pullRequests: pullRequests.total_count || 0,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

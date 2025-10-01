import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-github-event, x-hub-signature-256',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('x-hub-signature-256');
    const event = req.headers.get('x-github-event');
    const payload = await req.json();

    console.log('GitHub webhook received:', { event, repoId: payload.repository?.id });

    // Verify webhook signature (in production, you'd validate this)
    // const webhookSecret = Deno.env.get('GITHUB_WEBHOOK_SECRET');
    // ... signature verification code ...

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find repository in database
    const { data: repo } = await supabaseClient
      .from('repositories')
      .select('*')
      .eq('github_repo_id', payload.repository?.id)
      .single();

    if (!repo) {
      console.log('Repository not found in database');
      return new Response(JSON.stringify({ message: 'Repository not registered' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle different event types
    switch (event) {
      case 'push': {
        const commits = payload.commits || [];
        
        // Record activities for each commit
        for (const commit of commits) {
          await supabaseClient.from('activities').insert({
            student_id: repo.student_id,
            repository_id: repo.id,
            activity_type: 'commit',
            commit_sha: commit.id,
            commit_message: commit.message,
            occurred_at: commit.timestamp
          });
        }

        // Update repository last synced time
        await supabaseClient
          .from('repositories')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', repo.id);

        // Trigger code analysis for the latest commit if there's an assignment
        if (repo.assignment_id && commits.length > 0) {
          const latestCommit = commits[commits.length - 1];
          
          // Call analyze-code function
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-code`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              repositoryId: repo.id,
              commitSha: latestCommit.id,
              assignmentId: repo.assignment_id
            })
          });
        }

        console.log('Processed push event:', { commits: commits.length });
        break;
      }

      case 'pull_request': {
        await supabaseClient.from('activities').insert({
          student_id: repo.student_id,
          repository_id: repo.id,
          activity_type: 'pull_request',
          metadata: {
            action: payload.action,
            pr_number: payload.number,
            title: payload.pull_request?.title
          },
          occurred_at: new Date().toISOString()
        });

        console.log('Processed pull_request event');
        break;
      }

      case 'issues': {
        await supabaseClient.from('activities').insert({
          student_id: repo.student_id,
          repository_id: repo.id,
          activity_type: 'issue',
          metadata: {
            action: payload.action,
            issue_number: payload.issue?.number,
            title: payload.issue?.title
          },
          occurred_at: new Date().toISOString()
        });

        console.log('Processed issues event');
        break;
      }

      default:
        console.log('Unhandled event type:', event);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

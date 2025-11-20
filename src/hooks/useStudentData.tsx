import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStudentData = () => {
  return useQuery({
    queryKey: ["student-data"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user profile with GitHub data
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Get assignments for the student
      const { data: batchStudents } = await supabase
        .from("batch_students")
        .select("batch_id")
        .eq("student_id", user.id);

      const batchIds = batchStudents?.map(bs => bs.batch_id) || [];

      const { data: assignments } = await supabase
        .from("assignments")
        .select(`
          *,
          assignment_submissions!left (
            id,
            status,
            grade,
            submitted_at
          )
        `)
        .in("batch_id", batchIds)
        .eq("assignment_submissions.student_id", user.id);

      // Get activities (commits, PRs, etc.)
      const { data: activities } = await supabase
        .from("activities")
        .select("*")
        .eq("student_id", user.id)
        .order("occurred_at", { ascending: false })
        .limit(50);

      // Get repositories
      const { data: repositories } = await supabase
        .from("repositories")
        .select("*")
        .eq("student_id", user.id);

      return {
        profile,
        assignments: assignments || [],
        activities: activities || [],
        repositories: repositories || []
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

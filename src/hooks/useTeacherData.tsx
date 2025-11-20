import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTeacherData = () => {
  return useQuery({
    queryKey: ["teacher-data"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get teacher's batches
      const { data: batches, error: batchesError } = await supabase
        .from("batches")
        .select(`
          *,
          batch_students (
            id,
            student_id,
            users (
              id,
              full_name,
              email,
              github_username,
              avatar_url
            )
          )
        `)
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (batchesError) throw batchesError;

      // Get all assignments for teacher's batches
      const batchIds = batches?.map(b => b.id) || [];
      const { data: assignments } = await supabase
        .from("assignments")
        .select(`
          *,
          assignment_submissions (
            id,
            student_id,
            status,
            grade,
            submitted_at
          )
        `)
        .in("batch_id", batchIds)
        .order("created_at", { ascending: false });

      // Get student activities for all batches
      const studentIds = batches?.flatMap(b => 
        b.batch_students?.map((bs: any) => bs.student_id) || []
      ) || [];

      const { data: activities } = await supabase
        .from("activities")
        .select("*")
        .in("student_id", studentIds)
        .order("occurred_at", { ascending: false })
        .limit(100);

      return {
        batches: batches || [],
        assignments: assignments || [],
        activities: activities || []
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

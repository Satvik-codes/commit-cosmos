import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardData = (type: "student" | "teacher") => {
  return useQuery({
    queryKey: ["dashboard", type],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("dashboard-data", {
        body: { type },
      });

      if (error) throw error;
      return data;
    },
  });
};

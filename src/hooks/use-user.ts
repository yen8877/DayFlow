"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return data.user;
    },
  });
}

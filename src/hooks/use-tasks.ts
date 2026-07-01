"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import type { Task } from "@/types/database";

const hasSupabase = hasSupabaseConfig();

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    enabled: hasSupabase,
    queryFn: async (): Promise<Task[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("position", { ascending: true });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export function useTimeBlocks() {
  return useQuery({
    queryKey: ["time-blocks"],
    enabled: hasSupabase,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("time_blocks")
        .select("*")
        .order("starts_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

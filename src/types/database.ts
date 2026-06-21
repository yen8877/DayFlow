export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          position: number;
          scheduled_start: string | null;
          scheduled_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          position?: number;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: TaskStatus;
          position?: number;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      time_blocks: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          title: string;
          starts_at: string;
          ends_at: string;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          title: string;
          starts_at: string;
          ends_at: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string | null;
          title?: string;
          starts_at?: string;
          ends_at?: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      task_status: TaskStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TimeBlock = Database["public"]["Tables"]["time_blocks"]["Row"];

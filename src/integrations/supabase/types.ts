export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          additions: number | null
          commit_message: string | null
          commit_sha: string | null
          created_at: string
          deletions: number | null
          files_changed: number | null
          github_event_id: string | null
          id: string
          metadata: Json
          occurred_at: string
          repository_id: string | null
          student_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          additions?: number | null
          commit_message?: string | null
          commit_sha?: string | null
          created_at?: string
          deletions?: number | null
          files_changed?: number | null
          github_event_id?: string | null
          id?: string
          metadata?: Json
          occurred_at?: string
          repository_id?: string | null
          student_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          additions?: number | null
          commit_message?: string | null
          commit_sha?: string | null
          created_at?: string
          deletions?: number | null
          files_changed?: number | null
          github_event_id?: string | null
          id?: string
          metadata?: Json
          occurred_at?: string
          repository_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      analyses: {
        Row: {
          analyzed_at: string | null
          assignment_id: string | null
          code_quality_score: number | null
          commit_sha: string
          created_at: string
          error_message: string | null
          feedback: string | null
          id: string
          overall_grade: number | null
          repository_id: string
          requirements_met: Json
          status: Database["public"]["Enums"]["analysis_status"]
          suggestions: Json
          topic_coverage: Json
        }
        Insert: {
          analyzed_at?: string | null
          assignment_id?: string | null
          code_quality_score?: number | null
          commit_sha: string
          created_at?: string
          error_message?: string | null
          feedback?: string | null
          id?: string
          overall_grade?: number | null
          repository_id: string
          requirements_met?: Json
          status?: Database["public"]["Enums"]["analysis_status"]
          suggestions?: Json
          topic_coverage?: Json
        }
        Update: {
          analyzed_at?: string | null
          assignment_id?: string | null
          code_quality_score?: number | null
          commit_sha?: string
          created_at?: string
          error_message?: string | null
          feedback?: string | null
          id?: string
          overall_grade?: number | null
          repository_id?: string
          requirements_met?: Json
          status?: Database["public"]["Enums"]["analysis_status"]
          suggestions?: Json
          topic_coverage?: Json
        }
        Relationships: [
          {
            foreignKeyName: "analyses_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyses_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string | null
          feedback: string | null
          grade: number | null
          id: string
          repository_id: string | null
          status: string
          student_id: string
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string | null
          feedback?: string | null
          grade?: number | null
          id?: string
          repository_id?: string | null
          status?: string
          student_id: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string | null
          feedback?: string | null
          grade?: number | null
          id?: string
          repository_id?: string | null
          status?: string
          student_id?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          batch_id: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          requirements: Json
          rubric: Json | null
          status: Database["public"]["Enums"]["assignment_status"]
          title: string
          topics: string[]
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          requirements?: Json
          rubric?: Json | null
          status?: Database["public"]["Enums"]["assignment_status"]
          title: string
          topics?: string[]
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          requirements?: Json
          rubric?: Json | null
          status?: Database["public"]["Enums"]["assignment_status"]
          title?: string
          topics?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_students: {
        Row: {
          batch_id: string
          id: string
          joined_at: string
          student_id: string
        }
        Insert: {
          batch_id: string
          id?: string
          joined_at?: string
          student_id: string
        }
        Update: {
          batch_id?: string
          id?: string
          joined_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_students_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      repositories: {
        Row: {
          assignment_id: string | null
          created_at: string
          default_branch: string
          github_repo_id: number | null
          id: string
          is_active: boolean
          last_synced_at: string | null
          repo_name: string
          repo_url: string
          student_id: string
          updated_at: string
          webhook_id: number | null
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          default_branch?: string
          github_repo_id?: number | null
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          repo_name: string
          repo_url: string
          student_id: string
          updated_at?: string
          webhook_id?: number | null
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          default_branch?: string
          github_repo_id?: number | null
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          repo_name?: string
          repo_url?: string
          student_id?: string
          updated_at?: string
          webhook_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "repositories_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repositories_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          keywords: string[]
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          keywords?: string[]
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          keywords?: string[]
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          github_access_token: string | null
          github_avatar_url: string | null
          github_refresh_token: string | null
          github_repos_count: number | null
          github_username: string | null
          id: string
          last_github_sync: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          github_access_token?: string | null
          github_avatar_url?: string | null
          github_refresh_token?: string | null
          github_repos_count?: number | null
          github_username?: string | null
          id: string
          last_github_sync?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          github_access_token?: string | null
          github_avatar_url?: string | null
          github_refresh_token?: string | null
          github_repos_count?: number | null
          github_username?: string | null
          id?: string
          last_github_sync?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_type: "commit" | "pull_request" | "issue" | "create" | "push"
      analysis_status: "pending" | "processing" | "completed" | "failed"
      app_role: "teacher" | "student"
      assignment_status: "draft" | "active" | "completed" | "archived"
      user_role: "student" | "teacher" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: ["commit", "pull_request", "issue", "create", "push"],
      analysis_status: ["pending", "processing", "completed", "failed"],
      app_role: ["teacher", "student"],
      assignment_status: ["draft", "active", "completed", "archived"],
      user_role: ["student", "teacher", "admin"],
    },
  },
} as const

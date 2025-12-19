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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assessment_answers: {
        Row: {
          answer: string
          created_at: string
          id: string
          question_id: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question_id?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question_id?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          created_at: string
          id: string
          options: string[] | null
          order_index: number
          question: string
          related_careers: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          options?: string[] | null
          order_index?: number
          question: string
          related_careers?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          options?: string[] | null
          order_index?: number
          question?: string
          related_careers?: string[]
        }
        Relationships: []
      }
      career_recommendations: {
        Row: {
          algorithm_used: string
          career_id: string | null
          created_at: string
          id: string
          match_score: number
          session_id: string
          user_id: string | null
        }
        Insert: {
          algorithm_used?: string
          career_id?: string | null
          created_at?: string
          id?: string
          match_score: number
          session_id: string
          user_id?: string | null
        }
        Update: {
          algorithm_used?: string
          career_id?: string | null
          created_at?: string
          id?: string
          match_score?: number
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_recommendations_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      careers: {
        Row: {
          category: Database["public"]["Enums"]["career_category"]
          courses: string[]
          created_at: string
          description: string
          icon: string
          id: string
          roadmap: string[]
          skills: string[]
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["career_category"]
          courses?: string[]
          created_at?: string
          description: string
          icon?: string
          id?: string
          roadmap?: string[]
          skills?: string[]
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["career_category"]
          courses?: string[]
          created_at?: string
          description?: string
          icon?: string
          id?: string
          roadmap?: string[]
          skills?: string[]
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          education_level: string | null
          id: string
          interests: string[] | null
          name: string | null
          preferred_subjects: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          education_level?: string | null
          id?: string
          interests?: string[] | null
          name?: string | null
          preferred_subjects?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          education_level?: string | null
          id?: string
          interests?: string[] | null
          name?: string | null
          preferred_subjects?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      saved_careers: {
        Row: {
          career_id: string | null
          id: string
          saved_at: string
          user_id: string | null
        }
        Insert: {
          career_id?: string | null
          id?: string
          saved_at?: string
          user_id?: string | null
        }
        Update: {
          career_id?: string | null
          id?: string
          saved_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_careers_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      career_category:
        | "technology"
        | "healthcare"
        | "business"
        | "creative"
        | "science"
        | "education"
        | "trades"
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
      career_category: [
        "technology",
        "healthcare",
        "business",
        "creative",
        "science",
        "education",
        "trades",
      ],
    },
  },
} as const

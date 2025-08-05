export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      faq_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category_id: string | null
          created_at: string
          file_url: string | null
          id: string
          is_active: boolean | null
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category_id?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category_id?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string
          id: string
          is_validated: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_validated?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_validated?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sub_services: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          service_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          service_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      telekom_data: {
        Row: {
          company_name: string
          created_at: string
          created_by: string | null
          data_source: string | null
          file_url: string | null
          id: string
          latitude: number | null
          license_date: string | null
          license_number: string | null
          longitude: number | null
          region: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: string | null
          sub_service_id: string | null
          sub_service_type: string | null
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          created_by?: string | null
          data_source?: string | null
          file_url?: string | null
          id?: string
          latitude?: number | null
          license_date?: string | null
          license_number?: string | null
          longitude?: number | null
          region?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status?: string | null
          sub_service_id?: string | null
          sub_service_type?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          created_by?: string | null
          data_source?: string | null
          file_url?: string | null
          id?: string
          latitude?: number | null
          license_date?: string | null
          license_number?: string | null
          longitude?: number | null
          region?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: string | null
          sub_service_id?: string | null
          sub_service_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telekom_data_sub_service_id_fkey"
            columns: ["sub_service_id"]
            isOneToOne: false
            referencedRelation: "sub_services"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          assigned_to: string
          created_at: string
          id: string
          notes: string | null
          ticket_id: string
          unassigned_at: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          assigned_to: string
          created_at?: string
          id?: string
          notes?: string | null
          ticket_id: string
          unassigned_at?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          assigned_to?: string
          created_at?: string
          id?: string
          notes?: string | null
          ticket_id?: string
          unassigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_assignments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          is_admin_message: boolean
          is_read: boolean
          message: string
          ticket_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          is_admin_message?: boolean
          is_read?: boolean
          message: string
          ticket_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          is_admin_message?: boolean
          is_read?: boolean
          message?: string
          ticket_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_sla_metrics: {
        Row: {
          created_at: string
          first_response_time_minutes: number | null
          id: string
          resolution_sla_met: boolean | null
          resolution_time_minutes: number | null
          response_sla_met: boolean | null
          sla_target_resolution_minutes: number | null
          sla_target_response_minutes: number | null
          ticket_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_response_time_minutes?: number | null
          id?: string
          resolution_sla_met?: boolean | null
          resolution_time_minutes?: number | null
          response_sla_met?: boolean | null
          sla_target_resolution_minutes?: number | null
          sla_target_response_minutes?: number | null
          ticket_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_response_time_minutes?: number | null
          id?: string
          resolution_sla_met?: boolean | null
          resolution_time_minutes?: number | null
          response_sla_met?: boolean | null
          sla_target_resolution_minutes?: number | null
          sla_target_response_minutes?: number | null
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_sla_metrics_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          assignment_status:
            | Database["public"]["Enums"]["assignment_status"]
            | null
          category: Database["public"]["Enums"]["ticket_category"] | null
          created_at: string
          description: string
          due_date: string | null
          escalated_at: string | null
          escalation_level: number | null
          file_url: string | null
          first_response_at: string | null
          id: string
          internal_notes: string | null
          priority: string | null
          resolved_at: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          assignment_status?:
            | Database["public"]["Enums"]["assignment_status"]
            | null
          category?: Database["public"]["Enums"]["ticket_category"] | null
          created_at?: string
          description: string
          due_date?: string | null
          escalated_at?: string | null
          escalation_level?: number | null
          file_url?: string | null
          first_response_at?: string | null
          id?: string
          internal_notes?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          assignment_status?:
            | Database["public"]["Enums"]["assignment_status"]
            | null
          category?: Database["public"]["Enums"]["ticket_category"] | null
          created_at?: string
          description?: string
          due_date?: string | null
          escalated_at?: string | null
          escalation_level?: number | null
          file_url?: string | null
          first_response_at?: string | null
          id?: string
          internal_notes?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      escalate_overdue_tickets: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "internal_admin"
        | "pelaku_usaha"
        | "pengolah_data"
        | "internal_group"
        | "guest"
      assignment_status: "unassigned" | "assigned" | "in_review" | "escalated"
      service_type:
        | "jasa"
        | "jaringan"
        | "telekomunikasi_khusus"
        | "isr"
        | "tarif"
        | "sklo"
        | "lko"
      ticket_category:
        | "technical"
        | "billing"
        | "general"
        | "data_request"
        | "account"
        | "other"
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
      app_role: [
        "super_admin",
        "internal_admin",
        "pelaku_usaha",
        "pengolah_data",
        "internal_group",
        "guest",
      ],
      assignment_status: ["unassigned", "assigned", "in_review", "escalated"],
      service_type: [
        "jasa",
        "jaringan",
        "telekomunikasi_khusus",
        "isr",
        "tarif",
        "sklo",
        "lko",
      ],
      ticket_category: [
        "technical",
        "billing",
        "general",
        "data_request",
        "account",
        "other",
      ],
    },
  },
} as const

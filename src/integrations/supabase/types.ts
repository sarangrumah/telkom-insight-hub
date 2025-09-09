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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_integration_logs: {
        Row: {
          api_name: string
          created_at: string | null
          error_message: string | null
          id: string
          request_data: Json | null
          response_data: Json | null
          response_time_ms: number | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          api_name: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          response_time_ms?: number | null
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          api_name?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          response_time_ms?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      application_documents: {
        Row: {
          application_id: string
          document_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          application_id: string
          document_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          application_id?: string
          document_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "license_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_evaluations: {
        Row: {
          application_id: string
          comments: string | null
          decision: string | null
          evaluated_at: string
          evaluator_id: string
          evaluator_role: Database["public"]["Enums"]["user_role"]
          id: string
          status: string
        }
        Insert: {
          application_id: string
          comments?: string | null
          decision?: string | null
          evaluated_at?: string
          evaluator_id: string
          evaluator_role: Database["public"]["Enums"]["user_role"]
          id?: string
          status: string
        }
        Update: {
          application_id?: string
          comments?: string | null
          decision?: string | null
          evaluated_at?: string
          evaluator_id?: string
          evaluator_role?: Database["public"]["Enums"]["user_role"]
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_evaluations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "license_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_workflow: {
        Row: {
          application_id: string
          assigned_to: string | null
          created_at: string
          current_step: string
          id: string
          step_completed_at: string | null
          step_notes: string | null
          updated_at: string
          workflow_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          application_id: string
          assigned_to?: string | null
          created_at?: string
          current_step: string
          id?: string
          step_completed_at?: string | null
          step_notes?: string | null
          updated_at?: string
          workflow_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          application_id?: string
          assigned_to?: string | null
          created_at?: string
          current_step?: string
          id?: string
          step_completed_at?: string | null
          step_notes?: string | null
          updated_at?: string
          workflow_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "application_workflow_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "license_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      captcha_sessions: {
        Row: {
          answer: string
          created_at: string | null
          expires_at: string | null
          id: string
          session_token: string
          used: boolean | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_token: string
          used?: boolean | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_token?: string
          used?: boolean | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          business_field: string
          company_address: string
          company_name: string
          created_at: string
          email: string
          id: string
          nib: string | null
          phone: string
          status: Database["public"]["Enums"]["company_status"]
          updated_at: string
          verification_documents: Json | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          business_field: string
          company_address: string
          company_name: string
          created_at?: string
          email: string
          id?: string
          nib?: string | null
          phone: string
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string
          verification_documents?: Json | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          business_field?: string
          company_address?: string
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          nib?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string
          verification_documents?: Json | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
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
      fields: {
        Row: {
          code: string
          created_at: string
          field_type: string
          id: string
          is_active: boolean
          is_system_field: boolean
          module_id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          field_type?: string
          id?: string
          is_active?: boolean
          is_system_field?: boolean
          module_id: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          field_type?: string
          id?: string
          is_active?: boolean
          is_system_field?: boolean
          module_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fields_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      indonesian_regions: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          region_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          region_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          region_id?: string
          type?: string
        }
        Relationships: []
      }
      kabupaten: {
        Row: {
          code: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          province_id: string
          type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          province_id: string
          type: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          province_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kabupaten_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      license_applications: {
        Row: {
          applicant_id: string
          application_number: string
          approved_at: string | null
          approved_by: string | null
          assigned_evaluator: string | null
          company_id: string
          created_at: string
          form_data: Json | null
          id: string
          license_service_id: string
          notes: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          applicant_id: string
          application_number: string
          approved_at?: string | null
          approved_by?: string | null
          assigned_evaluator?: string | null
          company_id: string
          created_at?: string
          form_data?: Json | null
          id?: string
          license_service_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          application_number?: string
          approved_at?: string | null
          approved_by?: string | null
          assigned_evaluator?: string | null
          company_id?: string
          created_at?: string
          form_data?: Json | null
          id?: string
          license_service_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_applications_license_service_id_fkey"
            columns: ["license_service_id"]
            isOneToOne: false
            referencedRelation: "license_services"
            referencedColumns: ["id"]
          },
        ]
      }
      license_services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          license_type: Database["public"]["Enums"]["license_type"]
          name: string
          requirements: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          license_type: Database["public"]["Enums"]["license_type"]
          name: string
          requirements?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          license_type?: Database["public"]["Enums"]["license_type"]
          name?: string
          requirements?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string | null
          email: string
          id: string
          ip_address: unknown | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string | null
          email: string
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_module_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_module_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_module_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_parent_module_id_fkey"
            columns: ["parent_module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          permissions_config: Json
          target_role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          permissions_config?: Json
          target_role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          permissions_config?: Json
          target_role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_read: boolean
          can_update: boolean
          conditions: Json | null
          created_at: string
          created_by: string | null
          field_access: string | null
          field_id: string | null
          id: string
          module_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_read?: boolean
          can_update?: boolean
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          field_access?: string | null
          field_id?: string | null
          id?: string
          module_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_read?: boolean
          can_update?: boolean
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          field_access?: string | null
          field_id?: string | null
          id?: string
          module_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissions_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
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
      provinces: {
        Row: {
          code: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      record_permissions: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          permission_type: string
          record_id: string
          table_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          permission_type: string
          record_id: string
          table_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          permission_type?: string
          record_id?: string
          table_name?: string
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
      support_tickets: {
        Row: {
          assigned_to: string | null
          company_id: string
          created_at: string
          created_by: string
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          ticket_number: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          ticket_number: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          ticket_number?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
          kabupaten_id: string | null
          latitude: number | null
          license_date: string | null
          license_number: string | null
          longitude: number | null
          province_id: string | null
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
          kabupaten_id?: string | null
          latitude?: number | null
          license_date?: string | null
          license_number?: string | null
          longitude?: number | null
          province_id?: string | null
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
          kabupaten_id?: string | null
          latitude?: number | null
          license_date?: string | null
          license_number?: string | null
          longitude?: number | null
          province_id?: string | null
          region?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: string | null
          sub_service_id?: string | null
          sub_service_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telekom_data_kabupaten_id_fkey"
            columns: ["kabupaten_id"]
            isOneToOne: false
            referencedRelation: "kabupaten"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telekom_data_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
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
      ulo_applications: {
        Row: {
          created_at: string
          digital_signature: string | null
          id: string
          issued_at: string | null
          issued_by: string | null
          license_application_id: string
          qr_code_data: string | null
          sk_commitment_number: string | null
          sklo_number: string | null
          status: Database["public"]["Enums"]["application_status"]
          test_method: Database["public"]["Enums"]["test_method"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          digital_signature?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          license_application_id: string
          qr_code_data?: string | null
          sk_commitment_number?: string | null
          sklo_number?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          test_method: Database["public"]["Enums"]["test_method"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          digital_signature?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          license_application_id?: string
          qr_code_data?: string | null
          sk_commitment_number?: string | null
          sklo_number?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          test_method?: Database["public"]["Enums"]["test_method"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ulo_applications_license_application_id_fkey"
            columns: ["license_application_id"]
            isOneToOne: false
            referencedRelation: "license_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          company_id: string | null
          created_at: string
          full_name: string
          id: string
          is_company_admin: boolean | null
          phone: string | null
          position: string | null
          role: Database["public"]["Enums"]["user_role"]
          specialization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_company_admin?: boolean | null
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_company_admin?: boolean | null
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      check_record_permission: {
        Args: {
          _action: string
          _record_id: string
          _table_name: string
          _user_id: string
        }
        Returns: boolean
      }
      check_user_permission: {
        Args: {
          _action: string
          _field_code?: string
          _module_code: string
          _user_id: string
        }
        Returns: boolean
      }
      escalate_overdue_tickets: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_permissions: {
        Args: { _module_code?: string; _user_id: string }
        Returns: {
          can_create: boolean
          can_delete: boolean
          can_read: boolean
          can_update: boolean
          field_access: string
          field_code: string
          field_name: string
          module_code: string
          module_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
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
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "need_correction"
        | "approved"
        | "rejected"
        | "disposisi_ketua"
        | "evaluasi_evaluator"
        | "evaluasi_wakil_ketua"
        | "evaluasi_ketua"
        | "uji_laik_operasi"
        | "completed"
      assignment_status: "unassigned" | "assigned" | "in_review" | "escalated"
      company_status:
        | "pending_verification"
        | "verified"
        | "rejected"
        | "suspended"
      license_type:
        | "jasa_telekomunikasi"
        | "jaringan_telekomunikasi"
        | "penomoran_telekomunikasi"
      service_type:
        | "jasa"
        | "jaringan"
        | "telekomunikasi_khusus"
        | "isr"
        | "tarif"
        | "sklo"
        | "lko"
      test_method: "uji_petik" | "mandiri"
      ticket_category:
        | "technical"
        | "billing"
        | "general"
        | "data_request"
        | "account"
        | "other"
      user_role:
        | "pelaku_usaha"
        | "ketua_tim"
        | "evaluator"
        | "wakil_ketua"
        | "direktur"
        | "verifikator_nib"
        | "admin"
        | "superadmin"
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
      application_status: [
        "draft",
        "submitted",
        "under_review",
        "need_correction",
        "approved",
        "rejected",
        "disposisi_ketua",
        "evaluasi_evaluator",
        "evaluasi_wakil_ketua",
        "evaluasi_ketua",
        "uji_laik_operasi",
        "completed",
      ],
      assignment_status: ["unassigned", "assigned", "in_review", "escalated"],
      company_status: [
        "pending_verification",
        "verified",
        "rejected",
        "suspended",
      ],
      license_type: [
        "jasa_telekomunikasi",
        "jaringan_telekomunikasi",
        "penomoran_telekomunikasi",
      ],
      service_type: [
        "jasa",
        "jaringan",
        "telekomunikasi_khusus",
        "isr",
        "tarif",
        "sklo",
        "lko",
      ],
      test_method: ["uji_petik", "mandiri"],
      ticket_category: [
        "technical",
        "billing",
        "general",
        "data_request",
        "account",
        "other",
      ],
      user_role: [
        "pelaku_usaha",
        "ketua_tim",
        "evaluator",
        "wakil_ketua",
        "direktur",
        "verifikator_nib",
        "admin",
        "superadmin",
      ],
    },
  },
} as const

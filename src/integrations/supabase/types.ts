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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          id: string
          leader_id: string
          member_id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          tenant_id: string
          title: string
          updated_at: string
          visit_history: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          leader_id: string
          member_id: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          tenant_id: string
          title: string
          updated_at?: string
          visit_history?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          leader_id?: string
          member_id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
          visit_history?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attendee_email: string
          attendee_name: string
          attendee_phone: string
          event_id: string
          id: string
          payment_status:
            | Database["public"]["Enums"]["event_payment_status"]
            | null
          registered_at: string
        }
        Insert: {
          attendee_email: string
          attendee_name: string
          attendee_phone: string
          event_id: string
          id?: string
          payment_status?:
            | Database["public"]["Enums"]["event_payment_status"]
            | null
          registered_at?: string
        }
        Update: {
          attendee_email?: string
          attendee_name?: string
          attendee_phone?: string
          event_id?: string
          id?: string
          payment_status?:
            | Database["public"]["Enums"]["event_payment_status"]
            | null
          registered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner: string | null
          created_at: string
          current_attendees: number
          description: string
          id: string
          is_public: boolean
          location: string
          max_attendees: number | null
          price: number | null
          requires_payment: boolean
          scheduled_at: string
          speakers: string[] | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          banner?: string | null
          created_at?: string
          current_attendees?: number
          description: string
          id?: string
          is_public?: boolean
          location: string
          max_attendees?: number | null
          price?: number | null
          requires_payment?: boolean
          scheduled_at: string
          speakers?: string[] | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          banner?: string | null
          created_at?: string
          current_attendees?: number
          description?: string
          id?: string
          is_public?: boolean
          location?: string
          max_attendees?: number | null
          price?: number | null
          requires_payment?: boolean
          scheduled_at?: string
          speakers?: string[] | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leaders: {
        Row: {
          created_at: string
          email: string
          id: string
          is_available_for_appointments: boolean
          name: string
          permissions: string[] | null
          phone: string
          tenant_id: string
          type: Database["public"]["Enums"]["leader_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_available_for_appointments?: boolean
          name: string
          permissions?: string[] | null
          phone: string
          tenant_id: string
          type: Database["public"]["Enums"]["leader_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_available_for_appointments?: boolean
          name?: string
          permissions?: string[] | null
          phone?: string
          tenant_id?: string
          type?: Database["public"]["Enums"]["leader_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          groups: string[] | null
          id: string
          joined_at: string
          name: string
          phone: string
          status: Database["public"]["Enums"]["member_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          groups?: string[] | null
          id?: string
          joined_at?: string
          name: string
          phone: string
          status?: Database["public"]["Enums"]["member_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          groups?: string[] | null
          id?: string
          joined_at?: string
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["member_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          logo: string | null
          name: string
          phone: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo?: string | null
          name: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo?: string | null
          name?: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_status: "scheduled" | "completed" | "cancelled"
      event_payment_status: "pending" | "paid" | "refunded"
      leader_type:
        | "Pastor"
        | "Líder de Louvor"
        | "Líder de Jovens"
        | "Líder Infantil"
        | "Diácono"
        | "Presbítero"
      member_status: "active" | "inactive"
      user_role: "admin" | "leader" | "member"
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
      appointment_status: ["scheduled", "completed", "cancelled"],
      event_payment_status: ["pending", "paid", "refunded"],
      leader_type: [
        "Pastor",
        "Líder de Louvor",
        "Líder de Jovens",
        "Líder Infantil",
        "Diácono",
        "Presbítero",
      ],
      member_status: ["active", "inactive"],
      user_role: ["admin", "leader", "member"],
    },
  },
} as const

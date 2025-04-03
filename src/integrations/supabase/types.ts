export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          password: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          password: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          password?: string
          username?: string
        }
        Relationships: []
      }
      bill_items: {
        Row: {
          bill_id: string
          created_at: string
          id: string
          item_id: string
          item_type: string
          name: string
          price: number
          quantity: number
          total: number
        }
        Insert: {
          bill_id: string
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          name: string
          price: number
          quantity: number
          total: number
        }
        Update: {
          bill_id?: string
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          name?: string
          price?: number
          quantity?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          created_at: string
          customer_id: string
          discount: number
          discount_type: string
          discount_value: number
          id: string
          loyalty_points_earned: number
          loyalty_points_used: number
          payment_method: string
          subtotal: number
          total: number
        }
        Insert: {
          created_at?: string
          customer_id: string
          discount?: number
          discount_type?: string
          discount_value?: number
          id?: string
          loyalty_points_earned?: number
          loyalty_points_used?: number
          payment_method: string
          subtotal: number
          total: number
        }
        Update: {
          created_at?: string
          customer_id?: string
          discount?: number
          discount_type?: string
          discount_value?: number
          id?: string
          loyalty_points_earned?: number
          loyalty_points_used?: number
          payment_method?: string
          subtotal?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "bills_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_member: boolean
          loyalty_points: number
          membership_duration: string | null
          membership_expiry_date: string | null
          membership_hours_left: number | null
          membership_plan: string | null
          membership_start_date: string | null
          name: string
          phone: string
          total_play_time: number
          total_spent: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_member?: boolean
          loyalty_points?: number
          membership_duration?: string | null
          membership_expiry_date?: string | null
          membership_hours_left?: number | null
          membership_plan?: string | null
          membership_start_date?: string | null
          name: string
          phone: string
          total_play_time?: number
          total_spent?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_member?: boolean
          loyalty_points?: number
          membership_duration?: string | null
          membership_expiry_date?: string | null
          membership_hours_left?: number | null
          membership_plan?: string | null
          membership_start_date?: string | null
          name?: string
          phone?: string
          total_play_time?: number
          total_spent?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          duration: string | null
          id: string
          image: string | null
          membership_hours: number | null
          name: string
          offer_price: number | null
          original_price: number | null
          price: number
          stock: number
          student_price: number | null
        }
        Insert: {
          category: string
          created_at?: string
          duration?: string | null
          id?: string
          image?: string | null
          membership_hours?: number | null
          name: string
          offer_price?: number | null
          original_price?: number | null
          price: number
          stock: number
          student_price?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          duration?: string | null
          id?: string
          image?: string | null
          membership_hours?: number | null
          name?: string
          offer_price?: number | null
          original_price?: number | null
          price?: number
          stock?: number
          student_price?: number | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          customer_id: string
          duration: number | null
          end_time: string | null
          id: string
          start_time: string
          station_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time: string
          station_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          station_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          created_at: string
          hourly_rate: number
          id: string
          is_occupied: boolean
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          hourly_rate: number
          id?: string
          is_occupied?: boolean
          name: string
          type: string
        }
        Update: {
          created_at?: string
          hourly_rate?: number
          id?: string
          is_occupied?: boolean
          name?: string
          type?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

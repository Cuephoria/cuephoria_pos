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
      customer_users: {
        Row: {
          auth_id: string | null
          created_at: string | null
          customer_id: string | null
          email: string
          id: string
          pin: string | null
          referral_code: string | null
          reset_pin: string | null
          reset_pin_expiry: string | null
        }
        Insert: {
          auth_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          email: string
          id?: string
          pin?: string | null
          referral_code?: string | null
          reset_pin?: string | null
          reset_pin_expiry?: string | null
        }
        Update: {
          auth_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          email?: string
          id?: string
          pin?: string | null
          referral_code?: string | null
          reset_pin?: string | null
          reset_pin_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_users_customer_id_fkey"
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
          membership_seconds_left: number | null
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
          membership_seconds_left?: number | null
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
          membership_seconds_left?: number | null
          membership_start_date?: string | null
          name?: string
          phone?: string
          total_play_time?: number
          total_spent?: number
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          frequency: string
          id: string
          is_recurring: boolean
          name: string
          notes: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          frequency: string
          id: string
          is_recurring?: boolean
          name: string
          notes?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          frequency?: string
          id?: string
          is_recurring?: boolean
          name?: string
          notes?: string | null
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string | null
          customer_id: string
          description: string | null
          id: string
          points: number
          source: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          description?: string | null
          id?: string
          points: number
          source: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          points?: number
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
      promotions: {
        Row: {
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          start_date: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          start_date?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          start_date?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          points_awarded: number | null
          referred_email: string
          referrer_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points_awarded?: number | null
          referred_email: string
          referrer_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points_awarded?: number | null
          referred_email?: string
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemptions: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          points_spent: number
          redeemed_at: string | null
          redemption_code: string
          reward_id: string
          staff_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          points_spent: number
          redeemed_at?: string | null
          redemption_code: string
          reward_id: string
          staff_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          points_spent?: number
          redeemed_at?: string | null
          redemption_code?: string
          reward_id?: string
          staff_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          points_cost: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          points_cost: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          points_cost?: number
          updated_at?: string | null
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
      tournaments: {
        Row: {
          budget: number | null
          created_at: string
          date: string
          game_title: string | null
          game_type: string
          game_variant: string | null
          id: string
          matches: Json
          name: string
          players: Json
          runner_up_prize: number | null
          status: string
          updated_at: string | null
          winner: Json | null
          winner_prize: number | null
        }
        Insert: {
          budget?: number | null
          created_at?: string
          date: string
          game_title?: string | null
          game_type: string
          game_variant?: string | null
          id?: string
          matches?: Json
          name: string
          players?: Json
          runner_up_prize?: number | null
          status: string
          updated_at?: string | null
          winner?: Json | null
          winner_prize?: number | null
        }
        Update: {
          budget?: number | null
          created_at?: string
          date?: string
          game_title?: string | null
          game_type?: string
          game_variant?: string | null
          id?: string
          matches?: Json
          name?: string
          players?: Json
          runner_up_prize?: number | null
          status?: string
          updated_at?: string | null
          winner?: Json | null
          winner_prize?: number | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

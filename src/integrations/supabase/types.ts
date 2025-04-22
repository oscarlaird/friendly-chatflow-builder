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
      browser_events: {
        Row: {
          chat_id: string
          coderun_event_id: string | null
          created_at: string
          data: Json
          function_name: string | null
          id: string
          message_id: string
          uid: string
        }
        Insert: {
          chat_id: string
          coderun_event_id?: string | null
          created_at?: string
          data: Json
          function_name?: string | null
          id?: string
          message_id: string
          uid: string
        }
        Update: {
          chat_id?: string
          coderun_event_id?: string | null
          created_at?: string
          data?: Json
          function_name?: string | null
          id?: string
          message_id?: string
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "browser_events_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "browser_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      bu_requests: {
        Row: {
          id: string
          message_id: string
          request_data: Json | null
          response_data: Json | null
          sender: string | null
        }
        Insert: {
          id?: string
          message_id: string
          request_data?: Json | null
          response_data?: Json | null
          sender?: string | null
        }
        Update: {
          id?: string
          message_id?: string
          request_data?: Json | null
          response_data?: Json | null
          sender?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bu_requests_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          apps: string[] | null
          code_approved: boolean | null
          created_at: string | null
          id: string
          is_example: boolean | null
          model_cost: number
          requires_browser: boolean
          requires_code_rewrite: boolean | null
          response_id: string | null
          script: string | null
          steps: Json | null
          title: string
          uid: string
        }
        Insert: {
          apps?: string[] | null
          code_approved?: boolean | null
          created_at?: string | null
          id?: string
          is_example?: boolean | null
          model_cost?: number
          requires_browser?: boolean
          requires_code_rewrite?: boolean | null
          response_id?: string | null
          script?: string | null
          steps?: Json | null
          title: string
          uid: string
        }
        Update: {
          apps?: string[] | null
          code_approved?: boolean | null
          created_at?: string | null
          id?: string
          is_example?: boolean | null
          model_cost?: number
          requires_browser?: boolean
          requires_code_rewrite?: boolean | null
          response_id?: string | null
          script?: string | null
          steps?: Json | null
          title?: string
          uid?: string
        }
        Relationships: []
      }
      coderun_events: {
        Row: {
          chat_id: string
          created_at: string
          description: string | null
          function_name: string | null
          id: string
          input: Json | null
          message_id: string
          n_progress: number | null
          n_total: number | null
          output: Json | null
          progress_title: string | null
          requires_browser: boolean
          uid: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          description?: string | null
          function_name?: string | null
          id?: string
          input?: Json | null
          message_id: string
          n_progress?: number | null
          n_total?: number | null
          output?: Json | null
          progress_title?: string | null
          requires_browser?: boolean
          uid: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          description?: string | null
          function_name?: string | null
          id?: string
          input?: Json | null
          message_id?: string
          n_progress?: number | null
          n_total?: number | null
          output?: Json | null
          progress_title?: string | null
          requires_browser?: boolean
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "coderun_events_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coderun_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          content: string | null
          created_at: string
          id: number
          type: string | null
          uid: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
          type?: string | null
          uid?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
          type?: string | null
          uid?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          apps: string[] | null
          chat_id: string
          code_output: Json | null
          code_run_error: string | null
          code_run_state: Database["public"]["Enums"]["code_run_state"] | null
          content: string
          created_at: string | null
          from_template: boolean | null
          id: string
          model_cost: number | null
          response_id: string | null
          role: Database["public"]["Enums"]["role_type"]
          screenrecording_url: string | null
          script: string | null
          steps: Json | null
          text_is_currently_streaming: boolean | null
          type: Database["public"]["Enums"]["message_type"]
          uid: string
          update_counter: number
          user_inputs: Json | null
          window_has_spawned: boolean | null
        }
        Insert: {
          apps?: string[] | null
          chat_id: string
          code_output?: Json | null
          code_run_error?: string | null
          code_run_state?: Database["public"]["Enums"]["code_run_state"] | null
          content: string
          created_at?: string | null
          from_template?: boolean | null
          id?: string
          model_cost?: number | null
          response_id?: string | null
          role: Database["public"]["Enums"]["role_type"]
          screenrecording_url?: string | null
          script?: string | null
          steps?: Json | null
          text_is_currently_streaming?: boolean | null
          type: Database["public"]["Enums"]["message_type"]
          uid: string
          update_counter?: number
          user_inputs?: Json | null
          window_has_spawned?: boolean | null
        }
        Update: {
          apps?: string[] | null
          chat_id?: string
          code_output?: Json | null
          code_run_error?: string | null
          code_run_state?: Database["public"]["Enums"]["code_run_state"] | null
          content?: string
          created_at?: string | null
          from_template?: boolean | null
          id?: string
          model_cost?: number | null
          response_id?: string | null
          role?: Database["public"]["Enums"]["role_type"]
          screenrecording_url?: string | null
          script?: string | null
          steps?: Json | null
          text_is_currently_streaming?: boolean | null
          type?: Database["public"]["Enums"]["message_type"]
          uid?: string
          update_counter?: number
          user_inputs?: Json | null
          window_has_spawned?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      model_calls: {
        Row: {
          call_type: Database["public"]["Enums"]["model_use_type"]
          chat_id: string
          created_at: string
          id: string
          input_tokens: number
          message_id: string
          model_name: string
          output_tokens: number
          uid: string
        }
        Insert: {
          call_type: Database["public"]["Enums"]["model_use_type"]
          chat_id: string
          created_at?: string
          id?: string
          input_tokens: number
          message_id: string
          model_name: string
          output_tokens: number
          uid?: string
        }
        Update: {
          call_type?: Database["public"]["Enums"]["model_use_type"]
          chat_id?: string
          created_at?: string
          id?: string
          input_tokens?: number
          message_id?: string
          model_name?: string
          output_tokens?: number
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_calls_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_calls_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_calls_model_name_fkey"
            columns: ["model_name"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["name"]
          },
        ]
      }
      models: {
        Row: {
          input_cost_per_m: number
          name: string
          output_cost_per_m: number
          provider: Database["public"]["Enums"]["model_provider"]
        }
        Insert: {
          input_cost_per_m: number
          name: string
          output_cost_per_m: number
          provider: Database["public"]["Enums"]["model_provider"]
        }
        Update: {
          input_cost_per_m?: number
          name?: string
          output_cost_per_m?: number
          provider?: Database["public"]["Enums"]["model_provider"]
        }
        Relationships: []
      }
      oauth_sessions: {
        Row: {
          access_token: string | null
          auth_code: string | null
          created_at: string
          creds: Json | null
          error: string | null
          expires_at: string | null
          id: number
          provider: string | null
          refresh_token: string | null
          scopes: string[] | null
          status: string | null
          uid: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          auth_code?: string | null
          created_at?: string
          creds?: Json | null
          error?: string | null
          expires_at?: string | null
          id?: number
          provider?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          status?: string | null
          uid?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          auth_code?: string | null
          created_at?: string
          creds?: Json | null
          error?: string | null
          expires_at?: string | null
          id?: number
          provider?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          status?: string | null
          uid?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          apps: string[] | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          instructions: string | null
          requires_browser: boolean
          requires_code_rewrite: boolean | null
          script: string | null
          steps: Json | null
          title: string
        }
        Insert: {
          apps?: string[] | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          instructions?: string | null
          requires_browser?: boolean
          requires_code_rewrite?: boolean | null
          script?: string | null
          steps?: Json | null
          title: string
        }
        Update: {
          apps?: string[] | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          instructions?: string | null
          requires_browser?: boolean
          requires_code_rewrite?: boolean | null
          script?: string | null
          steps?: Json | null
          title?: string
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
      code_run_state:
        | "stopped"
        | "paused"
        | "running"
        | "aborted"
        | "finished"
        | "waiting_for_user"
        | "window_closed"
        | "crashed"
      external_apps: "google_sheets" | "gmail" | "outlook"
      message_type:
        | "text_message"
        | "code_run"
        | "screen_recording"
        | "connect_app"
      model_provider: "openai" | "anthropic"
      model_use_type: "conversation" | "code" | "browser_use"
      role_type: "user" | "assistant"
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
    Enums: {
      code_run_state: [
        "stopped",
        "paused",
        "running",
        "aborted",
        "finished",
        "waiting_for_user",
        "window_closed",
        "crashed",
      ],
      external_apps: ["google_sheets", "gmail", "outlook"],
      message_type: [
        "text_message",
        "code_run",
        "screen_recording",
        "connect_app",
      ],
      model_provider: ["openai", "anthropic"],
      model_use_type: ["conversation", "code", "browser_use"],
      role_type: ["user", "assistant"],
    },
  },
} as const

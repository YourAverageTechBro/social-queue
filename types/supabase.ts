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
      "instagram-accounts": {
        Row: {
          access_token: string
          created_at: string
          facebook_page_id: string
          id: string
          instagram_business_account_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          facebook_page_id: string
          id?: string
          instagram_business_account_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          facebook_page_id?: string
          id?: string
          instagram_business_account_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram-accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      "instagram-posts": {
        Row: {
          caption: string | null
          created_at: string
          id: string
          instagram_account_id: string
          instagram_media_id: string
          parent_social_media_post_id: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          instagram_account_id: string
          instagram_media_id: string
          parent_social_media_post_id: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          instagram_account_id?: string
          instagram_media_id?: string
          parent_social_media_post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram-posts_instagram_account_id_fkey"
            columns: ["instagram_account_id"]
            isOneToOne: false
            referencedRelation: "instagram-accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram-posts_parent-social-media-post-id_fkey"
            columns: ["parent_social_media_post_id"]
            isOneToOne: false
            referencedRelation: "social-media-posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram-posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      "pro-users": {
        Row: {
          created_at: string
          stripe_customer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          stripe_customer_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          stripe_customer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium-users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      "social-media-post-media-files": {
        Row: {
          created_at: string
          id: string
          media_file_path: string
          parent_social_media_post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_file_path: string
          parent_social_media_post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_file_path?: string
          parent_social_media_post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social-media-post-media-files_parent-social-media-post-id_fkey"
            columns: ["parent_social_media_post_id"]
            isOneToOne: false
            referencedRelation: "social-media-posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social-media-post-media-files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      "social-media-posts": {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social-media-posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      "tiktok-accounts": {
        Row: {
          access_token: string
          created_at: string
          id: string
          refresh_token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          id: string
          refresh_token: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tiktok-accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      "tiktok-posts": {
        Row: {
          caption: string | null
          created_at: string
          disable_comment: boolean
          disable_duet: boolean
          disable_stitch: boolean
          id: string
          parent_social_media_post_id: string
          privacy_level: string
          publicaly_available_post_id: string | null
          publish_id: string
          tiktok_account_id: string
          user_id: string
          video_cover_timestamp_ms: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          disable_comment: boolean
          disable_duet: boolean
          disable_stitch: boolean
          id?: string
          parent_social_media_post_id: string
          privacy_level: string
          publicaly_available_post_id?: string | null
          publish_id: string
          tiktok_account_id: string
          user_id: string
          video_cover_timestamp_ms: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          disable_comment?: boolean
          disable_duet?: boolean
          disable_stitch?: boolean
          id?: string
          parent_social_media_post_id?: string
          privacy_level?: string
          publicaly_available_post_id?: string | null
          publish_id?: string
          tiktok_account_id?: string
          user_id?: string
          video_cover_timestamp_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "tiktok-posts_parent_social_media_post_id_fkey"
            columns: ["parent_social_media_post_id"]
            isOneToOne: false
            referencedRelation: "social-media-posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok-posts_tiktok_account_id_fkey"
            columns: ["tiktok_account_id"]
            isOneToOne: false
            referencedRelation: "tiktok-accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok-posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      "youtube-channels": {
        Row: {
          channel_custom_url: string
          created_at: string
          credentials: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_custom_url: string
          created_at?: string
          credentials: Json
          id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_custom_url?: string
          created_at?: string
          credentials?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube-channels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      "youtube-posts": {
        Row: {
          created_at: string
          id: string
          parent_social_media_post_id: string
          title: string
          user_id: string
          youtube_channel_id: string
        }
        Insert: {
          created_at?: string
          id: string
          parent_social_media_post_id: string
          title: string
          user_id?: string
          youtube_channel_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_social_media_post_id?: string
          title?: string
          user_id?: string
          youtube_channel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube-posts_parent_social_media_post_id_fkey"
            columns: ["parent_social_media_post_id"]
            isOneToOne: false
            referencedRelation: "social-media-posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube-posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube-posts_youtube_channel_id_fkey"
            columns: ["youtube_channel_id"]
            isOneToOne: false
            referencedRelation: "youtube-channels"
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

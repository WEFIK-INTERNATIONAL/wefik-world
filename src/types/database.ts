export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          recovery_email: string | null;
          recovery_email_verified_at: string | null;
          role: 'customer' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          recovery_email?: string | null;
          recovery_email_verified_at?: string | null;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          recovery_email?: string | null;
          recovery_email_verified_at?: string | null;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          tagline: string;
          description: string;
          category_id: string;
          price_inr: number;
          price_usd: number;
          sale_price_inr: number | null;
          sale_price_usd: number | null;
          is_free: boolean;
          is_featured: boolean;
          is_bundle: boolean;
          bundle_product_ids: string[] | null;
          thumbnail_url: string;
          gallery_urls: string[];
          file_path: string;
          demo_url: string | null;
          version: string;
          changelog: Json | null;
          tech_stack: string[];
          rating_avg: number;
          rating_count: number;
          download_count: number;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          tagline: string;
          description: string;
          category_id: string;
          price_inr?: number;
          price_usd?: number;
          sale_price_inr?: number | null;
          sale_price_usd?: number | null;
          is_free?: boolean;
          is_featured?: boolean;
          is_bundle?: boolean;
          bundle_product_ids?: string[] | null;
          thumbnail_url: string;
          gallery_urls?: string[];
          file_path: string;
          demo_url?: string | null;
          version?: string;
          changelog?: Json | null;
          tech_stack?: string[];
          rating_avg?: number;
          rating_count?: number;
          download_count?: number;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          tagline?: string;
          description?: string;
          category_id?: string;
          price_inr?: number;
          price_usd?: number;
          sale_price_inr?: number | null;
          sale_price_usd?: number | null;
          is_free?: boolean;
          is_featured?: boolean;
          is_bundle?: boolean;
          bundle_product_ids?: string[] | null;
          thumbnail_url?: string;
          gallery_urls?: string[];
          file_path?: string;
          demo_url?: string | null;
          version?: string;
          changelog?: Json | null;
          tech_stack?: string[];
          rating_avg?: number;
          rating_count?: number;
          download_count?: number;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          status: string;
          subtotal_inr: number;
          discount_inr: number;
          tax_inr: number;
          total_amount_inr: number;
          subtotal: number;
          discount_amount: number;
          total_amount: number;
          currency: 'INR' | 'USD';
          coupon_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          status?: string;
          subtotal_inr?: number;
          discount_inr?: number;
          tax_inr?: number;
          total_amount_inr?: number;
          subtotal?: number;
          discount_amount?: number;
          total_amount?: number;
          currency?: 'INR' | 'USD';
          coupon_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_number?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          status?: string;
          subtotal_inr?: number;
          discount_inr?: number;
          tax_inr?: number;
          total_amount_inr?: number;
          subtotal?: number;
          discount_amount?: number;
          total_amount?: number;
          currency?: 'INR' | 'USD';
          coupon_code?: string | null;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          item_type: 'product' | 'membership_monthly' | 'membership_lifetime';
          price: number;
          price_inr: number;
          license_type: 'single' | 'unlimited';
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          item_type?: 'product' | 'membership_monthly' | 'membership_lifetime';
          price?: number;
          price_inr?: number;
          license_type?: 'single' | 'unlimited';
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          item_type?: 'product' | 'membership_monthly' | 'membership_lifetime';
          price?: number;
          price_inr?: number;
          license_type?: 'single' | 'unlimited';
          created_at?: string;
        };
      };
      licenses: {
        Row: {
          id: string;
          license_key: string;
          user_id: string;
          product_id: string;
          order_id: string | null;
          license_type: 'single' | 'unlimited';
          status: string;
          is_active: boolean;
          allowed_domains: string[];
          activated_domains: string[];
          activations_count: number;
          max_activations: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          license_key: string;
          user_id: string;
          product_id: string;
          order_id?: string | null;
          license_type?: 'single' | 'unlimited';
          status?: string;
          is_active?: boolean;
          allowed_domains?: string[];
          activated_domains?: string[];
          activations_count?: number;
          max_activations?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          license_key?: string;
          user_id?: string;
          product_id?: string;
          order_id?: string | null;
          license_type?: 'single' | 'unlimited';
          status?: string;
          is_active?: boolean;
          allowed_domains?: string[];
          activated_domains?: string[];
          activations_count?: number;
          max_activations?: number;
          created_at?: string;
        };
      };
      product_versions: {
        Row: {
          id: string;
          product_id: string;
          version: string;
          changelog: string | null;
          file_path: string;
          is_latest: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          version: string;
          changelog?: string | null;
          file_path: string;
          is_latest?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          version?: string;
          changelog?: string | null;
          file_path?: string;
          is_latest?: boolean;
          created_at?: string;
        };
      };
      blocked_email_domains: {
        Row: {
          domain: string;
          source: string;
          added_at: string;
        };
        Insert: {
          domain: string;
          source?: string;
          added_at?: string;
        };
        Update: {
          domain?: string;
          source?: string;
          added_at?: string;
        };
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          plan: 'monthly' | 'lifetime';
          status: 'active' | 'cancelled' | 'expired';
          razorpay_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan: 'monthly' | 'lifetime';
          status?: 'active' | 'cancelled' | 'expired';
          razorpay_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: 'monthly' | 'lifetime';
          status?: 'active' | 'cancelled' | 'expired';
          razorpay_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          rating: number;
          review_text: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          rating: number;
          review_text?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          rating?: number;
          review_text?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_percent: number;
          discount_fixed_inr: number | null;
          valid_from: string;
          valid_until: string;
          max_uses: number | null;
          uses_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_percent: number;
          discount_fixed_inr?: number | null;
          valid_from?: string;
          valid_until: string;
          max_uses?: number | null;
          uses_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_percent?: number;
          discount_fixed_inr?: number | null;
          valid_from?: string;
          valid_until?: string;
          max_uses?: number | null;
          uses_count?: number;
          created_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          subscribed_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          subscribed_at?: string;
        };
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      products_public: {
        Row: {
          id: string;
          title: string;
          slug: string;
          tagline: string;
          description: string;
          category_id: string;
          price_inr: number;
          price_usd: number;
          sale_price_inr: number | null;
          sale_price_usd: number | null;
          is_free: boolean;
          is_featured: boolean;
          is_bundle: boolean;
          thumbnail_url: string;
          gallery_urls: string[];
          demo_url: string | null;
          version: string;
          tech_stack: string[];
          rating_avg: number;
          rating_count: number;
          download_count: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: { user_id?: string };
        Returns: boolean;
      };
      increment_coupon_use: {
        Args: { coupon_id: string };
        Returns: void;
      };
      check_email_registered: {
        Args: { p_email: string };
        Returns: {
          registered: boolean;
          confirmed: boolean;
          has_password: boolean;
          oauth_providers: string[];
        }[];
      };
    };
  };
}

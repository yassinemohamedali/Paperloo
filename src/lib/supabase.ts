import { createClient } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          agency_name: string | null
          logo_url: string | null
          plan: 'starter' | 'agency' | 'scale'
          white_label_enabled: boolean
          weekly_digest_enabled: boolean
          review_interval_days: number
          onboarding_completed: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          agency_name?: string | null
          logo_url?: string | null
          plan?: 'starter' | 'agency' | 'scale'
          white_label_enabled?: boolean
          weekly_digest_enabled?: boolean
          review_interval_days?: number
          onboarding_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          agency_name?: string | null
          logo_url?: string | null
          plan?: 'starter' | 'agency' | 'scale'
          white_label_enabled?: boolean
          weekly_digest_enabled?: boolean
          review_interval_days?: number
          onboarding_completed?: boolean
          created_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          agency_id: string
          name: string
          url: string
          jurisdictions: string[]
          industry_type: string | null
          status: 'active' | 'pending' | 'needs-review'
          compliance_grade: string | null
          last_reviewed_at: string | null
          white_label_name: string | null
          white_label_logo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          name: string
          url: string
          jurisdictions?: string[]
          industry_type?: string | null
          status?: 'active' | 'pending' | 'needs-review'
          compliance_grade?: string | null
          last_reviewed_at?: string | null
          white_label_name?: string | null
          white_label_logo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          name?: string
          url?: string
          jurisdictions?: string[]
          industry_type?: string | null
          status?: 'active' | 'pending' | 'needs-review'
          compliance_grade?: string | null
          last_reviewed_at?: string | null
          white_label_name?: string | null
          white_label_logo?: string | null
          created_at?: string
        }
      }
      client_users: {
        Row: {
          id: string
          site_id: string
          email: string
          access_token: string
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          email: string
          access_token?: string
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          email?: string
          access_token?: string
          created_at?: string
        }
      }
      compliance_scores: {
        Row: {
          id: string
          site_id: string
          score: number
          grade: string
          breakdown: Json
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          score?: number
          grade?: string
          breakdown?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          score?: number
          grade?: string
          breakdown?: Json
          updated_at?: string
        }
      }
      questionnaire_responses: {
        Row: {
          id: string
          site_id: string
          answers: Json
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          answers?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          answers?: Json
          updated_at?: string
        }
      }
      custom_clauses: {
        Row: {
          id: string
          site_id: string
          document_type: string
          title: string
          content: string
          position: 'beginning' | 'end'
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          document_type: string
          title: string
          content: string
          position?: 'beginning' | 'end'
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          document_type?: string
          title?: string
          content?: string
          position?: 'beginning' | 'end'
          order_index?: number
          created_at?: string
        }
      }
      document_versions: {
        Row: {
          id: string
          document_id: string
          site_id: string
          content: string
          version: number
          changelog_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          site_id: string
          content: string
          version: number
          changelog_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          site_id?: string
          content?: string
          version?: number
          changelog_note?: string | null
          created_at?: string
        }
      }
      site_comments: {
        Row: {
          id: string
          site_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          content?: string
          created_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          site_id: string
          issued_at: string
          valid_until: string
          regulations_covered: string[]
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          issued_at?: string
          valid_until: string
          regulations_covered: string[]
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          issued_at?: string
          valid_until?: string
          regulations_covered?: string[]
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          agency_id: string
          site_id: string
          message: string
          type: 'regulation_update' | 'review_needed'
          resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          site_id: string
          message: string
          type?: 'regulation_update' | 'review_needed'
          resolved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          site_id?: string
          message?: string
          type?: 'regulation_update' | 'review_needed'
          resolved?: boolean
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          site_id: string
          type: 'privacy_policy' | 'terms_of_service' | 'cookie_policy' | 'eula' | 'acceptable_use' | 'disclaimer' | 'return_policy' | 'accessibility_statement'
          content: string
          version: number
          language: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          type: 'privacy_policy' | 'terms_of_service' | 'cookie_policy' | 'eula' | 'acceptable_use' | 'disclaimer' | 'return_policy' | 'accessibility_statement'
          content: string
          version?: number
          language?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          type?: 'privacy_policy' | 'terms_of_service' | 'cookie_policy' | 'eula' | 'acceptable_use' | 'disclaimer' | 'return_policy' | 'accessibility_statement'
          content?: string
          version?: number
          language?: string
          is_active?: boolean
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          agency_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'starter' | 'agency' | 'scale'
          status: string | null
          current_period_end: string | null
        }
        Insert: {
          id?: string
          agency_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'starter' | 'agency' | 'scale'
          status?: string | null
          current_period_end?: string | null
        }
        Update: {
          id?: string
          agency_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'starter' | 'agency' | 'scale'
          status?: string | null
          current_period_end?: string | null
        }
      }
      banner_configs: {
        Row: {
          id: string
          site_id: string
          position: string
          theme: string
          accept_text: string
          reject_text: string
          manage_text: string
          primary_color: string
          logo_url: string | null
          show_logo: boolean
          enable_auto_blocker: boolean
          enable_gcm_v2: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          position?: string
          theme?: string
          accept_text?: string
          reject_text?: string
          manage_text?: string
          primary_color?: string
          logo_url?: string | null
          show_logo?: boolean
          enable_auto_blocker?: boolean
          enable_gcm_v2?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          position?: string
          theme?: string
          accept_text?: string
          reject_text?: string
          manage_text?: string
          primary_color?: string
          logo_url?: string | null
          show_logo?: boolean
          enable_auto_blocker?: boolean
          enable_gcm_v2?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cookie_scans: {
        Row: {
          id: string
          site_id: string
          scanned_at: string
          cookies: Json
          status: string
        }
        Insert: {
          id?: string
          site_id: string
          scanned_at?: string
          cookies?: Json
          status?: string
        }
        Update: {
          id?: string
          site_id?: string
          scanned_at?: string
          cookies?: Json
          status?: string
        }
      }
      dsar_requests: {
        Row: {
          id: string
          site_id: string
          full_name: string
          email: string
          request_type: string
          message: string
          status: string
          submitted_at: string
        }
        Insert: {
          id?: string
          site_id: string
          full_name: string
          email: string
          request_type: string
          message: string
          status?: string
          submitted_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          full_name?: string
          email?: string
          request_type?: string
          message?: string
          status?: string
          submitted_at?: string
        }
      }
      regulations: {
        Row: {
          id: string
          name: string
          jurisdiction: string | null
          effective_date: string | null
          last_updated: string | null
          status: string
          summary: string | null
          affects_jurisdictions: string[] | null
        }
        Insert: {
          id?: string
          name: string
          jurisdiction?: string | null
          effective_date?: string | null
          last_updated?: string | null
          status?: string
          summary?: string | null
          affects_jurisdictions?: string[] | null
        }
        Update: {
          id?: string
          name?: string
          jurisdiction?: string | null
          effective_date?: string | null
          last_updated?: string | null
          status?: string
          summary?: string | null
          affects_jurisdictions?: string[] | null
        }
      }
    }
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

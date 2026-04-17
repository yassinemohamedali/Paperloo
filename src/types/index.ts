export type UserRole = 'agency_owner' | 'agency_member' | 'client';

export interface Agency {
  id: string;
  name: string;
  country: string;
  client_count_estimate: number;
  logo_url?: string;
  accent_color?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  agency_id: string;
  user_id: string;
  role: UserRole;
  email: string;
  created_at: string;
}

export interface Site {
  id: string;
  agency_id: string;
  name: string;
  url: string;
  jurisdictions: string[];
  industry_type: string;
  status: 'active' | 'pending' | 'needs-review';
  last_updated: string;
  created_at: string;
}

export interface QuestionnaireResponse {
  id: string;
  site_id: string;
  answers: Record<string, any>;
  updated_at: string;
}

export interface Document {
  id: string;
  site_id: string;
  type: 'privacy_policy' | 'terms_of_service' | 'cookie_policy';
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
}

export interface Alert {
  id: string;
  agency_id: string;
  site_id: string;
  message: string;
  type: 'regulation_update' | 'review_needed';
  is_read: boolean;
  created_at: string;
}

export interface Regulation {
  id: string;
  name: string;
  jurisdiction: string;
  last_updated: string;
  description: string;
}

export interface Subscription {
  id: string;
  agency_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: 'starter' | 'agency' | 'scale';
  status: string;
  current_period_end: string;
}

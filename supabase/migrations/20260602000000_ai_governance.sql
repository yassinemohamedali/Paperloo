-- Migration to bootstrap AI Governance, Action Boundary Rules, and HITL Approval tracking
-- Create uuid-ossp extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Agent Identities Table
CREATE TABLE IF NOT EXISTS public.agent_identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  verification_hash TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'suspended', 'deprecating')) DEFAULT 'active',
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and add policies
ALTER TABLE public.agent_identities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_identities: view own site agents" ON public.agent_identities
  FOR SELECT USING (
    site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()) OR 
    site_id IS NULL
  );

-- 2. Create Action Boundary Rules Table
CREATE TABLE IF NOT EXISTS public.action_boundary_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'db_mutation', 'email_dispatch', 'api_call', 'slack_notification'
  rule_name TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  enforcement_action TEXT CHECK (enforcement_action IN ('allow', 'hitl_approval', 'block')) DEFAULT 'hitl_approval',
  notification_channels TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.action_boundary_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "action_boundary_rules: admin own sites" ON public.action_boundary_rules
  FOR ALL USING (site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));

-- 3. Create HITL Approval Queue Table
CREATE TABLE IF NOT EXISTS public.hitl_approval_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agent_identities(id) ON DELETE RESTRICT,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  proposed_change_diff TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'denied', 'expired')) DEFAULT 'pending',
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  resolved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hitl_approval_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hitl_approval_queue: view and action by site agency" ON public.hitl_approval_queue
  FOR ALL USING (site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));

-- 4. Create Immutable Audit Logs for AI decisions and actions
CREATE TABLE IF NOT EXISTS public.immutable_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agent_identities(id) ON DELETE SET NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  state TEXT NOT NULL, -- e.g., 'intercepted', 'policy_allowed', 'policy_blocked', 'hitl_pending', 'hitl_approved', 'hitl_denied', 'executed'
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  model_name TEXT,
  compliance_mapping JSONB DEFAULT '{}', -- GRC frameworks alignment
  cryptographic_signature TEXT NOT NULL, -- Prevent external manual tampering post-hoc
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- We make audit logs read-only for normal operations to emphasize integrity
ALTER TABLE public.immutable_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "immutable_audit_logs: system insert" ON public.immutable_audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "immutable_audit_logs: view for site agency owners" ON public.immutable_audit_logs
  FOR SELECT USING (site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));

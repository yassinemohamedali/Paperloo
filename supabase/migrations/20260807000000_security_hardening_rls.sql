-- ====================================================================
-- PAPERLOO COMPLIANCE ENGINE - SECURITY & HARDENING SQL BLUEPRINT
-- ====================================================================
-- SEC-AUDIT-FIX: Enable Row Level Security (RLS) across all core schemas
-- SEC-AUDIT-FIX: Implement Zero-Trust IDOR policies based on auth.uid()
-- SEC-AUDIT-FIX: Setup tamper-proof append-only security_audit_logs table

-- 1. SECURITY AUDIT LOGS TABLE (Tamper-Proof)
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    action TEXT NOT NULL,
    user_id UUID DEFAULT auth.uid(),
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view their own audit logs, strictly no direct public edits
CREATE POLICY "Users can view own audit logs"
    ON public.security_audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Prevent any manual updates or deletions to audit logs
CREATE POLICY "No updates allowed to audit logs"
    ON public.security_audit_logs FOR UPDATE
    USING (false);

CREATE POLICY "No deletes allowed to audit logs"
    ON public.security_audit_logs FOR DELETE
    USING (false);

-- 2. ENABLE RLS & DEFINE POLICIES ON USER PROFILES
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. ENABLE RLS & DEFINE POLICIES ON SITES
ALTER TABLE IF EXISTS public.sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sites"
    ON public.sites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sites"
    ON public.sites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites"
    ON public.sites FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites"
    ON public.sites FOR DELETE
    USING (auth.uid() = user_id);

-- 4. ENABLE RLS & DEFINE POLICIES ON COMPLIANCE DOCUMENTS
ALTER TABLE IF EXISTS public.compliance_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
    ON public.compliance_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
    ON public.compliance_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
    ON public.compliance_documents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
    ON public.compliance_documents FOR DELETE
    USING (auth.uid() = user_id);

-- 5. TRIGGER FUNCTION FOR AUDIT LOGGING (Hardened with fixed search_path)
-- SEC-AUDIT-FIX: Hardened SECURITY DEFINER trigger function by pinning search_path = public, pg_temp to prevent privilege escalation via search_path hijacking
CREATE OR REPLACE FUNCTION public.log_security_audit_event()
RETURNS TRIGGER 
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.security_audit_logs (table_name, action, user_id, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to critical tables
DROP TRIGGER IF EXISTS audit_sites_trigger ON public.sites;
CREATE TRIGGER audit_sites_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.sites
    FOR EACH ROW EXECUTE FUNCTION public.log_security_audit_event();

DROP TRIGGER IF EXISTS audit_docs_trigger ON public.compliance_documents;
CREATE TRIGGER audit_docs_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.compliance_documents
    FOR EACH ROW EXECUTE FUNCTION public.log_security_audit_event();

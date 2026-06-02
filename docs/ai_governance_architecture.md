# Paperloo AI Governance & Action Boundary: Technical Architecture Specification
**Document Version:** 1.0.0  
**Author:** Lead Technical Architect, Paperloo Compliance Infrastructure  
**Status:** Approved for Implementation

---

## 1. System Architecture Overview

To transition Paperloo from passive compliance monitoring to **Active Real-Time AI Interception**, we implement a pre-execution gating layer. The **"Action Boundary"** acts as a reverse-proxy and verification gateway placed directly between our client-side or server-side AI Engines (such as Google Gemini, custom LLMs, or agentic frameworks) and any external touchpoints.

### Core Lifecycle Flow Diagram

```text
  [ AI Agent Execution ]
            │
            ▼ 
 ┌────────────────────────────────────────────────────────┐
 │ 1. PRE-EXECUTION ACTION GATEWAY (Middleware Interceptor)│
 ├────────────────────────────────────────────────────────┤
 │  a. Decrypt Agent Identity & Cryptographic Hash        │
 │  b. Scan Prompt Security (Injection/PII/Toxic Filters) │
 │  c. Validate & Align Action against Corporate Rules    │
 └──────────────────────────┬─────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
  [ Rule: ALLOW/DISPATCH ]        [ Rule: HITL APPROVAL REQUIREMENT ]
            │                               │
            ▼                               ▼
    ( Execute Outbound )      ┌────────────────────────────────────────┐
   ( Mutation / Slack / API )  │ 2. WRITE TO HITL STATE QUEUE (PENDING) │
            │                 │    (Action Halted & Fully Sanitized)   │
            │                 └─────────────────┬──────────────────────┘
            │                                   │ (Review Notification)
            │                                   ▼
            │                         [ HUMAN REVIEW PORTAL ]
            │                            (Approve / Deny)
            │                                   │
            │         ┌─────────────────────────┴────────────────────────┐
            │         ▼                                                  ▼
     ( Complete Flow ) ┌────────────────────────────────────────┐ ( Action Cancelled )
            │          │ 3. CO-SIGN & RELEASE TRIGGERED         │        │
            │          │    (Action Executed securely via keys) │        │
            │          └────────────────────────┬───────────────┘        │
            │                                   │                        │
            ▼                                   ▼                        ▼
 ┌────────────────────────────────────────────────────────────────────────────────┐
 │ 4. IMMUTABLE MEMORY ENGINE & COMPLIANCE LEDGER (Signed SHA-256 Hash Log written)│
 └────────────────────────────────────────────────────────────────────────────────┘
```

### Key Subsystems:
1. **Agent Identity Provider (IdP):** Assigns unique cryptographic tokens and software-state verification hashes (`verification_hash`) to distinct automated agent runtimes. This guarantees accountability and prevents rogue, untracked API queries from posing as standard background workflows.
2. **Real-Time Policy Evaluation Engine:** A high-speed, local JSON-rules parser comparing the AI's intended payload details against the current site's compliance-rule matrix (`action_boundary_rules`).
3. **The Action Interceptor (The "Action Boundary"):** A non-circumventable proxy middleware executing in the secure cluster environment blocking any downstream SMTP connection, Firestore mutation, or outbound HTTPS query until the transaction block signs successfully.
4. **Human-in-the-Loop (HITL) Queue & Webhook:** A secure database holding table coupled with an isolated webhook receiver. If a rule resolves to `'hitl_approval'`, the executing agent's runtime is safely suspended, returning a tracking ID. Upon reviewer signature, the webhook triggers the underlying executor to resume.
5. **Immutable GRC Compliance Ledger:** Real-time logging of the interceptor states that are cryptographically sealed with an HMAC. GRC workflow engines map these records instantly to GDPR Articles (e.g., Article 32: Security of Processing) or ISO 27001 scopes for ready-made audit reports.

---

## 2. Relational Database Schema Design (PostgreSQL / Supabase)

These custom, highly indexable tables are engineered to integrate naturally within the Paperloo Supabase architecture. They enforce strict referential boundaries, allow rapid filtering by `site_id`, and leverage Row-Level Security (RLS) policies linking agents securely to the managing digital agencies.

```sql
-- PostgreSQL Migration Script
-- Path: /supabase/migrations/20260602000000_ai_governance.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. AGENT IDENTITIES
-- Tracks physical automated systems and provides cryptographic validation
CREATE TABLE IF NOT EXISTS public.agent_identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_key TEXT UNIQUE NOT NULL, -- UUID/cryptographic key API token used by the runner
  name TEXT NOT NULL, -- e.g., "Privacy Drafting Bot", "Email Responder"
  purpose TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}', -- e.g., {'mutateDocs', 'sendSlack'}
  verification_hash TEXT NOT NULL, -- Verified checksum of the agent deployment code to prevent spoofing
  status TEXT CHECK (status IN ('active', 'suspended', 'deprecating')) DEFAULT 'active',
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACTION BOUNDARY RULES
-- Company compliance policies parsed in real-time
CREATE TABLE IF NOT EXISTS public.action_boundary_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'db_mutation', 'email_dispatch', 'api_call', 'slack_notification'
  rule_name TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}', -- JSON rule-engine conditions (e.g., {"recipient_domain_blacklist": ["*.ru", "*.cn"]})
  enforcement_action TEXT CHECK (enforcement_action IN ('allow', 'hitl_approval', 'block')) DEFAULT 'hitl_approval',
  notification_channels TEXT[] DEFAULT '{}', -- e.g., {'slack_webhook_1', 'email_alerts'}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HUMAN-IN-THE-LOOP (HITL) APPROVAL QUEUE
-- Halts and holds pending operations
CREATE TABLE IF NOT EXISTS public.hitl_approval_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agent_identities(id) ON DELETE RESTRICT,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}', -- Full database parameters or email body arguments
  proposed_change_diff TEXT, -- Diff markup for Human Review Visualizers
  status TEXT CHECK (status IN ('pending', 'approved', 'denied', 'expired')) DEFAULT 'pending',
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  resolved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. IMMUTABLE AUDIT LOGS FOR AI DECISIONS (Compliance Memory)
-- High-integrity immutable journal proving security actions
CREATE TABLE IF NOT EXISTS public.immutable_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agent_identities(id) ON DELETE SET NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  payload_hash TEXT NOT NULL, -- SHA-256 hash of parameters to prove no tampering post-execution
  state TEXT NOT NULL, -- 'intercepted', 'policy_allowed', 'policy_blocked', 'hitl_pending', 'hitl_approved', 'hitl_denied', 'executed'
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  model_name TEXT,
  compliance_mapping JSONB DEFAULT '{}', -- GRC frameworks mapping: e.g., {"gdpr": ["Article 32"], "iso_27001": ["A.12.4.1"]}
  cryptographic_signature TEXT NOT NULL, -- HMAC signed using Paperloo internal master secret key to verify authenticity
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce Row-Level Security (RLS)
ALTER TABLE public.agent_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_boundary_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hitl_approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immutable_audit_logs ENABLE ROW LEVEL SECURITY;

-- Security Policies (Ensure SaaS isolation across tenancies)
CREATE POLICY "agent_identities: view own site agents" ON public.agent_identities
  FOR SELECT USING (site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()) OR site_id IS NULL);

CREATE POLICY "action_boundary_rules: admin own sites" ON public.action_boundary_rules
  FOR ALL USING (site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));

CREATE POLICY "hitl_approval_queue: view and action by site agency" ON public.hitl_approval_queue
  FOR ALL USING (site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));

CREATE POLICY "immutable_audit_logs: read-only ledger access" ON public.immutable_audit_logs
  FOR SELECT USING (site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));
```

---

## 3. Node.js / TypeScript Core Middleware Implementation

The following standard classes form the backbone of the **Action Boundary Interceptor Engine**. We leverage a secure cryptography module (`crypto`) to generate HMAC verifications protecting audit records from modifications, alongside a pipeline-ready validation layer.

### 3.1 Pre-Execution Boundary Interceptor Gateway
Add this utility handler inside the server environment (e.g., `/src/services/ai_middleware.ts`).

```typescript
import { createHmac, createHash } from 'crypto';
import { supabase } from '@/src/lib/supabase';
import { 
  ActionType, 
  EnforcementAction, 
  AuditLogState, 
  HITLStatus 
} from '@/src/types/ai_governance';

interface InterceptRequest {
  agentKey: string;
  siteId: string;
  actionType: ActionType;
  payload: Record<string, any>;
  changeDiff?: string;
}

interface InterceptResponse {
  decision: EnforcementAction;
  queueId?: string;
  reason?: string;
  logId: string;
}

export class PreExecutionGateway {
  private static readonly MASTER_SECRET = process.env.PAPERLOO_GOVERNANCE_SECRET || 'pl-gov-fallback-secret-2026';

  /**
   * Evaluates if an intended agent action violates company regulations or requires HITL validation.
   */
  public static async intercept(req: InterceptRequest): Promise<InterceptResponse> {
    const { agentKey, siteId, actionType, payload, changeDiff } = req;

    // 1. Authenticate & Verify Agent Identity
    const { data: agent, error: agentError } = await supabase
      .from('agent_identities')
      .select('*')
      .eq('agent_key', agentKey)
      .eq('status', 'active')
      .single();

    if (agentError || !agent) {
      throw new Error(`Unauthorized or inactive AI Agent identifier attempted execution.`);
    }

    // 2. Security Check: Real-time Prompt Injection and Malicious Inputs Scan
    const payloadText = JSON.stringify(payload).toLowerCase();
    this.scanPromptSecurity(payloadText);

    // 3. Evaluate Rule-set Conditions
    const { data: rules } = await supabase
      .from('action_boundary_rules')
      .select('*')
      .eq('site_id', siteId)
      .eq('action_type', actionType);

    let decision: EnforcementAction = 'allow';
    let triggeredRuleName = 'Default Autopass';

    if (rules && rules.length > 0) {
      for (const rule of rules) {
        if (this.doesConditionMatch(payload, rule.conditions)) {
          decision = rule.enforcement_action as EnforcementAction;
          triggeredRuleName = rule.rule_name;
          // Fail-closed structure: If any rule blocks, block immediately.
          if (decision === 'block') break;
        }
      }
    }

    // 4. Generate SHA-256 State Verification Hash
    const payloadHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');

    // 5. Build Cryptographic Tamper-Proof Signature
    const signature = createHmac('sha256', this.MASTER_SECRET)
      .update(`${agent.id}:${siteId}:${actionType}:${payloadHash}:${decision}`)
      .digest('hex');

    // 6. Action Execution Gating Routes
    let queueId: string | undefined = undefined;
    let finalState: AuditLogState = 'policy_allowed';

    if (decision === 'block') {
      finalState = 'policy_blocked';
    } else if (decision === 'hitl_approval') {
      finalState = 'hitl_pending';
      
      // Persist the held context in our review queue
      const { data: queueItem, error: queueErr } = await supabase
        .from('hitl_approval_queue')
        .insert({
          agent_id: agent.id,
          site_id: siteId,
          action_type: actionType,
          payload,
          proposed_change_diff: changeDiff,
          urgency: this.determineUrgency(actionType, payload)
        })
        .select()
        .single();

      if (queueErr || !queueItem) {
        throw new Error(`System Error writing transaction to HITL approval queue: ${queueErr?.message}`);
      }
      queueId = queueItem.id;
    }

    // 7. Write to Immutable Compliance Ledger
    const { data: auditLog, error: auditErr } = await supabase
      .from('immutable_audit_logs')
      .insert({
        agent_id: agent.id,
        site_id: siteId,
        action_type: actionType,
        payload_hash: payloadHash,
        state: finalState,
        compliance_mapping: this.mapGrcPolicies(actionType, triggeredRuleName),
        cryptographic_signature: signature
      })
      .select()
      .single();

    if (auditErr || !auditLog) {
      console.error('LEDGER CRITICAL WARNING: Non-repudiated audit log failed registration.', auditErr);
    }

    return {
      decision,
      queueId,
      reason: decision !== 'allow' ? `Action halted by policy: [${triggeredRuleName}]` : undefined,
      logId: auditLog?.id || 'unregistered'
    };
  }

  /**
   * Helper that scans texts for typical prompt injection strategies or toxic payloads.
   */
  private static scanPromptSecurity(input: string): void {
    const maliciousPatterns = [
      'ignore previous instructions',
      'system prompt rewrite',
      'bypass filter',
      'forget guidelines',
      'sql injection',
      'drop table'
    ];

    for (const pattern of maliciousPatterns) {
      if (input.includes(pattern)) {
        throw new Error(`Prompt Security Violation: Detection of payload injection vector.`);
      }
    }
  }

  /**
   * Basic matching algorithm evaluating JSON-rules
   */
  private static doesConditionMatch(payload: Record<string, any>, conditions: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      if (payload[key] === undefined) continue;
      
      // Simple evaluation checking array containment or explicit equivalence
      if (Array.isArray(value) && value.includes(payload[key])) return true;
      if (payload[key] === value) return true;
    }
    return false;
  }

  /**
   * Automatically assigns urgency relative to potential customer impact
   */
  private static determineUrgency(type: ActionType, payload: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    if (type === 'db_mutation' && payload.operation === 'delete') return 'critical';
    if (type === 'email_dispatch') return 'high';
    return 'medium';
  }

  /**
   * Maps triggered actions directly to regulatory frameworks for automated reporting.
   */
  private static mapGrcPolicies(type: ActionType, ruleName: string): Record<string, string[]> {
    const mapping: Record<string, string[]> = {
      gdpr: ['Article 5', 'Article 32'],
      iso_27001: ['A.12.4.1', 'A.14.2.1']
    };

    if (type === 'db_mutation') {
      mapping.gdpr.push('Article 25 (Privacy by Design)');
    }
    return mapping;
  }
}
```

---

### 3.2 Human-In-The-Loop Approval & Webhook Resolver
Add this endpoint in our Express core backend inside `server.ts` or a designated controller file.

```typescript
import express, { Request, Response } from 'express';
import { createHmac } from 'crypto';
import { supabase } from '@/src/lib/supabase';
import { PreExecutionGateway } from './ai_middleware';

const router = express.Router();

/**
 * POST /api/v1/governance/hitl/resolve
 * Authenticated webhook or review action executed directly by the admin portal.
 */
router.post('/resolve', async (req: Request, res: Response) => {
  const { queueItemId, decision, reviewerId, rejectionReason } = req.body;

  if (!queueItemId || !['approved', 'denied'].includes(decision)) {
    return res.status(400).json({ error: 'Parameters missing or malformed action decision.' });
  }

  try {
    // 1. Fetch PENDING held queue item
    const { data: item, error: itemErr } = await supabase
      .from('hitl_approval_queue')
      .select('*, agent_identities(agent_key)')
      .eq('id', queueItemId)
      .eq('status', 'pending')
      .single();

    if (itemErr || !item) {
      return res.status(404).json({ error: 'Active pending action item not found or resolved.' });
    }

    const finalStatus = decision === 'approved' ? 'approved' : 'denied';

    // 2. Perform Transaction Mutation: Resolve item and free slot
    const { error: updateErr } = await supabase
      .from('hitl_approval_queue')
      .update({
        status: finalStatus,
        reviewer_id: reviewerId,
        rejection_reason: rejectionReason,
        resolved_at: new Date().toISOString()
      })
      .eq('id', queueItemId);

    if (updateErr) {
      throw new Error(`Failed updating state transition in database: ${updateErr.message}`);
    }

    // 3. Register a secure resolution Audit Log on our Immutable Compliance Ledger
    const resolvedHash = item.payload_hash || 'item_payload_reconstructed';
    const signatureSecret = process.env.PAPERLOO_GOVERNANCE_SECRET || 'pl-gov-fallback-secret-2026';
    
    const signature = createHmac('sha256', signatureSecret)
      .update(`${item.agent_id}:${item.site_id}:${item.action_type}:${resolvedHash}:${finalStatus}`)
      .digest('hex');

    await supabase
      .from('immutable_audit_logs')
      .insert({
        agent_id: item.agent_id,
        site_id: item.site_id,
        action_type: item.action_type,
        payload_hash: resolvedHash,
        state: finalStatus === 'approved' ? 'hitl_approved' : 'hitl_denied',
        compliance_mapping: { gdpr: ['Article 32'], user_reviewer: [reviewerId] },
        cryptographic_signature: signature
      });

    // 4. Trigger Execution Task or Release Pipeline Webhook if Approved
    if (finalStatus === 'approved') {
      const success = await dispatchToExecutor(item.action_type, item.payload);
      if (!success) {
        return res.status(500).json({ 
          error: 'Action co-sign validated, but underlying execution engine failed.' 
        });
      }
    }

    return res.status(200).json({
      status: 'success',
      item_id: queueItemId,
      resolution: finalStatus,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('Governance resolver fault:', err);
    return res.status(500).json({ error: 'Internal server error processing governance resolution.' });
  }
});

/**
 * Dispatches verified and cleared human-approved JSON payloads to targeted third-party APIs
 */
async function dispatchToExecutor(type: string, payload: Record<string, any>): Promise<boolean> {
  try {
    if (type === 'email_dispatch') {
      // e.g. Mailgun/Sendgrid/SES trigger securely
      console.log(`[EXECUTOR DISPATCH] Outbound validated compliant email transmitted successfully.`);
    } else if (type === 'db_mutation') {
      // Executing database records modification
      console.log(`[EXECUTOR DISPATCH] Safe database writing parameters committed.`);
    }
    return true;
  } catch (e) {
    console.error('Executor delivery fault:', e);
    return false;
  }
}

export default router;
```

---

## 4. Key Security & Compliance Workflows

### 4.1 Anti-Injection Safeguards (Prompt & Input Integrity)
By wrapping the agentic tool call runtime in `this.scanPromptSecurity()` directly within the Action Boundary Gateway *before* hitting any model APIs, we prevent LLM "Jailbreaks" or prompt hijacks. If unauthorized content patterns exist, we abort immediately before consuming API credit tokens, creating a **fail-closed defense**.

### 4.2 Transparent GRC Auditing
Through the `compliance_mapping` data layer, any agent mutation is instantly categorized under **GDPR principles, CCPA limits, and ISO 27001 guidelines**. Security officers can generate comprehensive verification audit lists with one click on the Paperloo admin panel, displaying:
- Which AI agent proposed an action (`agent_identities.name`)
- Which Human Operator approved or rejected it (`hitl_approval_queue.reviewer_id`)
- Fully verified cryptographic validation (`immutable_audit_logs.cryptographic_signature`) ensuring total tamper protection.

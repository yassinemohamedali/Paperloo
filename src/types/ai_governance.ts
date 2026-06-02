export type ActionType = 'db_mutation' | 'email_dispatch' | 'api_call' | 'slack_notification';
export type EnforcementAction = 'allow' | 'hitl_approval' | 'block';
export type HITLStatus = 'pending' | 'approved' | 'denied' | 'expired';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type AuditLogState = 
  | 'intercepted' 
  | 'policy_allowed' 
  | 'policy_blocked' 
  | 'hitl_pending' 
  | 'hitl_approved' 
  | 'hitl_denied' 
  | 'executed';

export interface AgentIdentity {
  id: string;
  agent_key: string;
  name: string;
  purpose: string;
  permissions: string[];
  verification_hash: string;
  status: 'active' | 'suspended' | 'deprecating';
  site_id?: string;
  created_at: string;
}

export interface ActionBoundaryRule {
  id: string;
  site_id: string;
  action_type: ActionType;
  rule_name: string;
  conditions: Record<string, any>;
  enforcement_action: EnforcementAction;
  notification_channels: string[];
  created_at: string;
}

export interface HITLApprovalItem {
  id: string;
  agent_id: string;
  site_id: string;
  action_type: ActionType;
  payload: Record<string, any>;
  proposed_change_diff?: string;
  status: HITLStatus;
  urgency: UrgencyLevel;
  reviewer_id?: string;
  rejection_reason?: string;
  resolved_at?: string;
  expires_at: string;
  created_at: string;
}

export interface ImmutableAuditLog {
  id: string;
  agent_id?: string;
  site_id: string;
  action_type: ActionType;
  payload_hash: string;
  state: AuditLogState;
  prompt_tokens?: number;
  completion_tokens?: number;
  model_name?: string;
  compliance_mapping: Record<string, string[]>;
  cryptographic_signature: string;
  created_at: string;
}

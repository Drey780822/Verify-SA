export type UserRole =
  | 'super_admin'
  | 'organization_admin'
  | 'hr_manager'
  | 'recruiter'
  | 'viewer';

export type VerificationStatus =
  | 'pending'
  | 'processing'
  | 'complete'
  | 'failed'
  | 'flagged';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type StrictnessLevel = 'lenient' | 'standard' | 'strict';

export type ApprovalWorkflow = 'auto_approve' | 'manual_review' | 'dual_approval';

export type AuditAction =
  | 'verification_created'
  | 'verification_completed'
  | 'verification_failed'
  | 'verification_flagged'
  | 'member_invited'
  | 'member_joined'
  | 'member_role_changed'
  | 'member_removed'
  | 'settings_updated'
  | 'rules_updated'
  | 'report_generated'
  | 'login'
  | 'logout';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  verification_strictness: StrictnessLevel;
  approval_workflow: ApprovalWorkflow;
  settings: Record<string, unknown>;
  verification_limit: number;
  verifications_used: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  active_organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  invited_by: string | null;
  joined_at: string;
  profile?: Profile;
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: UserRole;
  invited_by: string;
  token: string;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
}

export interface ExtractedDocumentData {
  fullName?: string;
  idNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  citizenship?: string;
  issueDate?: string;
  institutionName?: string;
  documentType: string;
  ocrConfidence?: number;
}

export interface FraudIndicator {
  id: string;
  type: 'positive' | 'negative' | 'warning';
  text: string;
}

export interface RuleCheckResult {
  id: string;
  rule: string;
  status: 'pass' | 'fail' | 'warning';
  detail: string;
}

export interface AIFindings {
  summary: string;
  indicators: FraudIndicator[];
  recommendation: string;
  modelUsed: string;
  analysisTime: string;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  detail: string;
}

export interface Verification {
  id: string;
  organization_id: string;
  created_by: string;
  document_name: string;
  document_type: string;
  status: VerificationStatus;
  trust_score: number | null;
  risk_level: RiskLevel | null;
  extracted_data: ExtractedDocumentData;
  rule_checks: RuleCheckResult[];
  ai_findings: AIFindings;
  audit_trail: AuditTrailEntry[];
  recommendation: string | null;
  model_used: string | null;
  analysis_time_ms: number | null;
  ocr_confidence: number | null;
  created_at: string;
  updated_at: string;
  creator?: Profile;
}

export interface VerificationRule {
  id: string;
  organization_id: string;
  rule_name: string;
  rule_key: string;
  rule_type: string;
  enabled: boolean;
  strictness_weight: number;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  profile?: Profile;
}

export interface AnalyticsKPI {
  label: string;
  value: string;
  subValue: string;
  trend: number;
  trendLabel: string;
}

export interface AnalyticsData {
  kpis: AnalyticsKPI[];
  volumeData: { date: string; count: number }[];
  riskDistribution: { name: string; value: number; color: string }[];
  documentTypes: { type: string; count: number }[];
  recentActivity: AuditLog[];
  fraudPatterns: { pattern: string; count: number; severity: RiskLevel; lastSeen: string }[];
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  organization_admin: 'Organization Admin',
  hr_manager: 'HR Manager',
  recruiter: 'Recruiter',
  viewer: 'Viewer',
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  organization_admin: [
    'org:manage',
    'team:manage',
    'verifications:create',
    'verifications:view',
    'verifications:approve',
    'rules:manage',
    'analytics:view',
    'audit:view',
    'reports:generate',
  ],
  hr_manager: [
    'verifications:create',
    'verifications:view',
    'verifications:approve',
    'analytics:view',
    'audit:view',
    'reports:generate',
  ],
  recruiter: ['verifications:create', 'verifications:view', 'reports:generate'],
  viewer: ['verifications:view', 'analytics:view', 'audit:view'],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes('*') || perms.includes(permission);
}

export function canManageTeam(role: UserRole): boolean {
  return hasPermission(role, 'team:manage') || role === 'organization_admin';
}

export function canCreateVerification(role: UserRole): boolean {
  return hasPermission(role, 'verifications:create');
}

export function canManageOrg(role: UserRole): boolean {
  return hasPermission(role, 'org:manage') || role === 'organization_admin';
}

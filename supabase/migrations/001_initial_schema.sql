-- VerifySA Multi-Tenant B2B SaaS Schema
-- Run this migration in your Supabase SQL editor or via supabase db push

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'super_admin',
  'organization_admin',
  'hr_manager',
  'recruiter',
  'viewer'
);

CREATE TYPE verification_status AS ENUM (
  'pending',
  'processing',
  'complete',
  'failed',
  'flagged'
);

CREATE TYPE risk_level AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH'
);

CREATE TYPE strictness_level AS ENUM (
  'lenient',
  'standard',
  'strict'
);

CREATE TYPE approval_workflow AS ENUM (
  'auto_approve',
  'manual_review',
  'dual_approval'
);

CREATE TYPE audit_action AS ENUM (
  'verification_created',
  'verification_completed',
  'verification_failed',
  'verification_flagged',
  'member_invited',
  'member_joined',
  'member_role_changed',
  'member_removed',
  'settings_updated',
  'rules_updated',
  'report_generated',
  'login',
  'logout'
);

CREATE TYPE invitation_status AS ENUM (
  'pending',
  'accepted',
  'expired',
  'revoked'
);

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'starter',
  verification_strictness strictness_level NOT NULL DEFAULT 'standard',
  approval_workflow approval_workflow NOT NULL DEFAULT 'manual_review',
  settings JSONB NOT NULL DEFAULT '{}',
  verification_limit INTEGER NOT NULL DEFAULT 500,
  verifications_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  active_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  trust_score INTEGER,
  risk_level risk_level,
  extracted_data JSONB NOT NULL DEFAULT '{}',
  rule_checks JSONB NOT NULL DEFAULT '[]',
  ai_findings JSONB NOT NULL DEFAULT '{}',
  audit_trail JSONB NOT NULL DEFAULT '[]',
  recommendation TEXT,
  model_used TEXT,
  analysis_time_ms INTEGER,
  ocr_confidence NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE verification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_key TEXT NOT NULL,
  rule_type TEXT NOT NULL DEFAULT 'validation',
  enabled BOOLEAN NOT NULL DEFAULT true,
  strictness_weight INTEGER NOT NULL DEFAULT 10,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, rule_key)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_verifications_org ON verifications(organization_id);
CREATE INDEX idx_verifications_created_by ON verifications(created_by);
CREATE INDEX idx_verifications_status ON verifications(status);
CREATE INDEX idx_verifications_created_at ON verifications(created_at DESC);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_org_role(org_id UUID, required_roles user_role[])
RETURNS BOOLEAN AS $$
  SELECT is_super_admin() OR EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = ANY(required_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION can_manage_org(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT has_org_role(org_id, ARRAY['organization_admin', 'super_admin']::user_role[]);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION can_verify(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT has_org_role(org_id, ARRAY['organization_admin', 'hr_manager', 'recruiter', 'super_admin']::user_role[]);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION can_view_org(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT has_org_role(org_id, ARRAY['organization_admin', 'hr_manager', 'recruiter', 'viewer', 'super_admin']::user_role[]);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER verifications_updated_at
  BEFORE UPDATE ON verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER verification_rules_updated_at
  BEFORE UPDATE ON verification_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
BEGIN

  -- ✅ FIX: schema-qualified
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  );

  -- Create default organization
  org_slug := lower(regexp_replace(
    COALESCE(
      NEW.raw_user_meta_data->>'organization_name',
      split_part(NEW.email, '@', 1)
    ),
    '[^a-zA-Z0-9]', '-', 'g'
  )) || '-' || substr(NEW.id::text, 1, 8);

  -- ✅ FIX: schema-qualified
  INSERT INTO public.organizations (name, slug)
  VALUES (
    COALESCE(
      NEW.raw_user_meta_data->>'organization_name',
      split_part(NEW.email, '@', 1) || ' Organization'
    ),
    org_slug
  )
  RETURNING id INTO new_org_id;

  -- ✅ FIX
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'organization_admin');

  -- ✅ FIX
  UPDATE public.profiles
  SET active_organization_id = new_org_id
  WHERE id = NEW.id;

  -- Seed default verification rules
  INSERT INTO public.verification_rules (
    organization_id, rule_name, rule_key, rule_type, enabled, strictness_weight
  ) VALUES
    (new_org_id, 'Full name present', 'rule-name', 'validation', true, 15),
    (new_org_id, '13-digit SA ID format', 'rule-id-format', 'validation', true, 25),
    (new_org_id, 'Luhn checksum validation', 'rule-luhn', 'validation', true, 20),
    (new_org_id, 'DOB matches ID pattern', 'rule-dob', 'validation', true, 5),
    (new_org_id, 'Gender digit consistency', 'rule-gender', 'validation', true, 5),
    (new_org_id, 'Citizenship digit validation', 'rule-citizenship', 'validation', true, 10),
    (new_org_id, 'Institution name present', 'rule-institution', 'validation', true, 10);

  RETURN NEW;
END;
$function$;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizations
CREATE POLICY "Super admins see all orgs" ON organizations
  FOR SELECT USING (is_super_admin());

CREATE POLICY "Members see their orgs" ON organizations
  FOR SELECT USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "Org admins update their org" ON organizations
  FOR UPDATE USING (can_manage_org(id));

CREATE POLICY "Super admins insert orgs" ON organizations
  FOR INSERT WITH CHECK (is_super_admin());

-- Profiles
CREATE POLICY "Users see own profile" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_super_admin());

CREATE POLICY "Users see org member profiles" ON profiles
  FOR SELECT USING (
    id IN (
      SELECT om.user_id FROM organization_members om
      WHERE om.organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Organization members
CREATE POLICY "Members see org members" ON organization_members
  FOR SELECT USING (can_view_org(organization_id));

CREATE POLICY "Admins manage members" ON organization_members
  FOR ALL USING (can_manage_org(organization_id));

-- Invitations
CREATE POLICY "Admins manage invitations" ON invitations
  FOR ALL USING (can_manage_org(organization_id));

CREATE POLICY "Invitees see own invitations" ON invitations
  FOR SELECT USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Verifications
CREATE POLICY "Members view org verifications" ON verifications
  FOR SELECT USING (can_view_org(organization_id));

CREATE POLICY "Verifiers create verifications" ON verifications
  FOR INSERT WITH CHECK (can_verify(organization_id) AND created_by = auth.uid());

CREATE POLICY "Verifiers update verifications" ON verifications
  FOR UPDATE USING (can_verify(organization_id));

-- Verification rules
CREATE POLICY "Members view org rules" ON verification_rules
  FOR SELECT USING (can_view_org(organization_id));

CREATE POLICY "Admins manage rules" ON verification_rules
  FOR ALL USING (can_manage_org(organization_id));

-- Audit logs
CREATE POLICY "Members view org audit logs" ON audit_logs
  FOR SELECT USING (can_view_org(organization_id));

CREATE POLICY "System inserts audit logs" ON audit_logs
  FOR INSERT WITH CHECK (
    can_view_org(organization_id) OR is_super_admin()
  );

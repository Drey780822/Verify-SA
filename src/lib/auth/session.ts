import { createClient } from '@/lib/supabase/server';
import type { Profile, Organization, OrganizationMember, UserRole } from '@/types/database';

export interface SessionContext {
  user: { id: string; email: string };
  profile: Profile;
  organization: Organization;
  membership: OrganizationMember;
  role: UserRole;
}

export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  const orgId = profile.active_organization_id;
  if (!orgId) return null;

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();

  if (!organization) return null;

  const { data: membership } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single();

  if (!membership) return null;

  const role: UserRole = profile.is_super_admin ? 'super_admin' : membership.role;

  return {
    user: { id: user.id, email: user.email! },
    profile,
    organization,
    membership,
    role,
  };
}

export async function requireSession(): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) throw new Error('Unauthorized');
  return ctx;
}

export async function requirePermission(permission: string): Promise<SessionContext> {
  const ctx = await requireSession();
  const { hasPermission } = await import('@/types/database');
  if (!hasPermission(ctx.role, permission)) {
    throw new Error('Forbidden');
  }
  return ctx;
}

import { createClient } from '@/lib/supabase/server';
import type { AuditAction } from '@/types/database';

export async function logAuditEvent(params: {
  organizationId: string;
  userId: string | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();

  await supabase.from('audit_logs').insert({
    organization_id: params.organizationId,
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType ?? null,
    entity_id: params.entityId ?? null,
    metadata: params.metadata ?? {},
  });
}

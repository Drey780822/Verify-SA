'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Settings, Shield, Mail, UserPlus, Trash2, Loader2,
  SlidersHorizontal, CheckCircle2, X, Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/lib/hooks/useSession';
import { ROLE_LABELS, canManageOrg, type UserRole, type OrganizationMember, type Invitation, type VerificationRule, type StrictnessLevel, type ApprovalWorkflow } from '@/types/database';

const ASSIGNABLE_ROLES: UserRole[] = ['organization_admin', 'hr_manager', 'recruiter', 'viewer'];

export default function OrganizationAdminContent() {
  const { session } = useSession();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [rules, setRules] = useState<VerificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'team' | 'settings' | 'rules' | 'usage'>('team');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('recruiter');
  const [inviting, setInviting] = useState(false);

  const [strictness, setStrictness] = useState<StrictnessLevel>('standard');
  const [workflow, setWorkflow] = useState<ApprovalWorkflow>('manual_review');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [teamRes, rulesRes] = await Promise.all([
        fetch('/api/team'),
        fetch('/api/verification-rules'),
      ]);
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setMembers(teamData.members ?? []);
        setInvitations(teamData.invitations ?? []);
      }
      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData.rules ?? []);
      }
    } catch {
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      setStrictness(session.organization.verification_strictness);
      setWorkflow(session.organization.approval_workflow);
      fetchData();
    }
  }, [session, fetchData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: UserRole) => {
    try {
      const res = await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      toast.success('Role updated');
      fetchData();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/team?memberId=${memberId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove member');
      toast.success('Member removed');
      fetchData();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/team?invitationId=${invitationId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke invitation');
      toast.success('Invitation revoked');
      fetchData();
    } catch {
      toast.error('Failed to revoke invitation');
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_strictness: strictness,
          approval_workflow: workflow,
        }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      toast.success('Organization settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, enabled } : r));
    setRules(updated);
    try {
      await fetch('/api/verification-rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: updated }),
      });
    } catch {
      toast.error('Failed to update rule');
      fetchData();
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const canManage = canManageOrg(session.role);
  const usagePercent = Math.round(
    (session.organization.verifications_used / session.organization.verification_limit) * 100
  );

  const tabs = [
    { id: 'team' as const, label: 'Team Members', icon: <Users size={16} /> },
    { id: 'settings' as const, label: 'Verification Settings', icon: <Settings size={16} /> },
    { id: 'rules' as const, label: 'Verification Rules', icon: <Shield size={16} /> },
    { id: 'usage' as const, label: 'Usage & Billing', icon: <SlidersHorizontal size={16} /> },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Organization Admin</h1>
        <p className="text-muted-foreground mt-1">
          Manage {session.organization.name} — team, settings, and verification configuration
        </p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <>
          {activeTab === 'team' && (
            <div className="space-y-6">
              {canManage && (
                <div className="card-elevated p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <UserPlus size={18} />
                    Invite Team Member
                  </h3>
                  <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.co.za"
                        className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as UserRole)}
                      className="bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {ASSIGNABLE_ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                    <button type="submit" disabled={inviting} className="btn-primary px-6">
                      {inviting ? <Loader2 size={16} className="animate-spin" /> : 'Send Invite'}
                    </button>
                  </form>
                </div>
              )}

              <div className="card-elevated overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Active Members ({members.length})</h3>
                </div>
                <div className="divide-y divide-border">
                  {members.map((member) => (
                    <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {(member.profile?.full_name ?? member.profile?.email ?? '?')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {member.profile?.full_name ?? 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.profile?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {canManage && member.user_id !== session.user.id ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                            className="bg-muted border border-border rounded-lg px-2 py-1 text-xs"
                          >
                            {ASSIGNABLE_ROLES.map((r) => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {ROLE_LABELS[member.role]}
                          </span>
                        )}
                        {canManage && member.user_id !== session.user.id && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-muted-foreground hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {invitations.length > 0 && (
                <div className="card-elevated overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Pending Invitations ({invitations.length})</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="px-6 py-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{inv.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {ROLE_LABELS[inv.role]} · Expires {new Date(inv.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                        {canManage && (
                          <button
                            onClick={() => handleRevokeInvite(inv.id)}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                          >
                            <X size={12} /> Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && canManage && (
            <div className="card-elevated p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Verification Strictness</label>
                <div className="flex gap-3">
                  {(['lenient', 'standard', 'strict'] as StrictnessLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setStrictness(level)}
                      className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                        strictness === level
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-border/80'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Controls how aggressively the AI flags inconsistencies during verification.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Approval Workflow</label>
                <div className="space-y-2">
                  {([
                    { value: 'auto_approve' as ApprovalWorkflow, label: 'Auto Approve', desc: 'Low-risk documents approved automatically' },
                    { value: 'manual_review' as ApprovalWorkflow, label: 'Manual Review', desc: 'All flagged documents require human review' },
                    { value: 'dual_approval' as ApprovalWorkflow, label: 'Dual Approval', desc: 'High-risk documents need two approvers' },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setWorkflow(opt.value)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        workflow === opt.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-border/80'
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSaveSettings} disabled={saving} className="btn-primary">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Settings</>}
              </button>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="card-elevated overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Verification Rules</h3>
                <p className="text-xs text-muted-foreground mt-1">Toggle rules and adjust strictness weights</p>
              </div>
              <div className="divide-y divide-border">
                {rules.map((rule) => (
                  <div key={rule.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{rule.rule_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Weight: {rule.strictness_weight} · Type: {rule.rule_type}
                      </p>
                    </div>
                    <button
                      onClick={() => canManage && handleToggleRule(rule.id, !rule.enabled)}
                      disabled={!canManage}
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        rule.enabled ? 'bg-primary' : 'bg-muted'
                      } ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          rule.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-elevated p-6">
                <h3 className="font-semibold text-foreground mb-4">Verification Usage</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Used</span>
                    <span className="font-mono-data text-foreground">
                      {session.organization.verifications_used} / {session.organization.verification_limit}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{usagePercent}% of plan limit used</p>
                </div>
              </div>

              <div className="card-elevated p-6">
                <h3 className="font-semibold text-foreground mb-4">Plan Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="text-foreground font-medium capitalize">{session.organization.plan}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Strictness</span>
                    <span className="text-foreground capitalize">{session.organization.verification_strictness}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Workflow</span>
                    <span className="text-foreground capitalize">{session.organization.approval_workflow.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team Size</span>
                    <span className="text-foreground">{members.length} members</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

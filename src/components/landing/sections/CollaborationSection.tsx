'use client';

import { motion } from 'framer-motion';
import {
  UserPlus, Settings, GitBranch, Shield, Mail, CheckCircle2,
} from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import RevealOnScroll from '../shared/RevealOnScroll';

const teamMembers = [
  { name: 'Nomvula Mahlangu', role: 'Organization Admin', initials: 'NM', color: 'from-primary to-accent' },
  { name: 'Thandi Zulu', role: 'HR Manager', initials: 'TZ', color: 'from-emerald-500 to-emerald-600' },
  { name: 'Sipho Dlamini', role: 'Recruiter', initials: 'SD', color: 'from-amber-500 to-amber-600' },
  { name: 'Lerato Nkosi', role: 'Viewer', initials: 'LN', color: 'from-violet-500 to-violet-600' },
];

const settings = [
  { label: 'Verification Strictness', value: 'Standard', icon: <Shield size={14} /> },
  { label: 'Approval Workflow', value: 'Manual Review', icon: <GitBranch size={14} /> },
  { label: 'Active Rules', value: '7 of 7 enabled', icon: <CheckCircle2 size={14} /> },
];

export default function CollaborationSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Team Collaboration"
          title="Organization Controls Built for Teams"
          description="Invite members, assign roles, configure workflows, and manage verification rules — all from one admin dashboard."
        />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Team management UI */}
          <RevealOnScroll direction="right">
            <div className="glass-panel-strong rounded-2xl overflow-hidden glow-violet">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Team Members</p>
                  <p className="text-xs text-muted-foreground">TalentForce SA · 4 members</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                  <UserPlus size={12} /> Invite
                </button>
              </div>
              <div className="divide-y divide-border">
                {teamMembers.map((member) => (
                  <div key={member.name} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center`}>
                        <span className="text-[10px] font-bold text-white">{member.initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{member.role.split(' ').pop()}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-muted-foreground" />
                  <input
                    readOnly
                    value="colleague@company.co.za"
                    className="flex-1 bg-transparent text-xs text-muted-foreground outline-none"
                  />
                  <span className="text-[10px] text-primary font-semibold">Send Invite</span>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Settings UI */}
          <RevealOnScroll direction="left">
            <div className="glass-panel-strong rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <Settings size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">Organization Settings</p>
              </div>
              <div className="p-6 space-y-6">
                {settings.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{s.icon}</span>
                      <span className="text-sm text-foreground">{s.label}</span>
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-lg">{s.value}</span>
                  </div>
                ))}

                <div>
                  <p className="text-sm text-foreground mb-3">Verification Rules</p>
                  <div className="space-y-2">
                    {['Full name present', '13-digit SA ID format', 'Luhn checksum validation', 'DOB matches ID pattern'].map((rule) => (
                      <div key={rule} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                        <span className="text-xs text-muted-foreground">{rule}</span>
                        <motion.div
                          className="w-8 h-5 rounded-full bg-primary relative"
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white" />
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Verification Usage</span>
                    <span className="font-mono-data text-foreground">342 / 500</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      whileInView={{ width: '68.4%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

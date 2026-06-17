'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { useSession } from '@/lib/hooks/useSession';
import { createClient } from '@/lib/supabase/client';
import { ROLE_LABELS } from '@/types/database';
import {
  UploadCloud, ShieldCheck, BarChart2, History, Settings,
  ChevronLeft, ChevronRight, Bell, Users, Building2, HelpCircle,
  LogOut, Loader2,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Verification',
    items: [
      { id: 'nav-upload', label: 'Document Upload', href: '/dashboard', icon: <UploadCloud size={18} /> },
      { id: 'nav-results', label: 'Results Dashboard', href: '/verification-results-dashboard', icon: <ShieldCheck size={18} /> },
      { id: 'nav-history', label: 'Verification History', href: '/verification-history', icon: <History size={18} /> },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { id: 'nav-analytics', label: 'Analytics', href: '/analytics-dashboard', icon: <BarChart2 size={18} /> },
    ],
  },
  {
    title: 'Organisation',
    items: [
      { id: 'nav-team', label: 'Team & Settings', href: '/organization', icon: <Users size={18} /> },
      { id: 'nav-org', label: 'Organisation', href: '/organization', icon: <Building2 size={18} /> },
    ],
  },
];

interface SidebarProps {
  activePath: string;
}

export default function Sidebar({ activePath }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { session, loading } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const initials = session?.profile.full_name
    ? session.profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : session?.user.email?.[0]?.toUpperCase() ?? '?';

  return (
    <aside
      className="relative flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out flex-shrink-0"
      style={{ width: collapsed ? 64 : 240 }}
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border h-16">
        <div className="flex-shrink-0">
          <AppLogo size={32} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-base font-bold text-foreground tracking-tight whitespace-nowrap">VerifySA</span>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">AI Verification Platform</p>
          </div>
        )}
      </div>

      {!collapsed && session && (
        <div className="mx-3 mt-3 mb-1 bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-primary">
              {session.organization.name[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{session.organization.name}</p>
            <p className="text-[10px] text-muted-foreground capitalize">
              {session.organization.plan} Plan
            </p>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2">
        {navGroups.map((group) => (
          <div key={`group-${group.title}`} className="mb-4">
            {!collapsed && (
              <p className="section-label px-2 py-1.5 mb-1">{group.title}</p>
            )}
            {group.items.map((item) => {
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-lg mb-0.5 transition-all duration-150 text-sm font-medium group relative ${
                    isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-2 space-y-1">
        <button className="btn-ghost w-full justify-start text-sm">
          <Bell size={16} />
          {!collapsed && <span>Notifications</span>}
        </button>
        <Link href="/organization" className="btn-ghost w-full justify-start text-sm">
          <Settings size={16} />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button className="btn-ghost w-full justify-start text-sm">
          <HelpCircle size={16} />
          {!collapsed && <span>Help & Docs</span>}
        </button>
        <div className="border-t border-border pt-2 mt-1">
          {loading ? (
            <div className="flex justify-center py-2">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            </div>
          ) : session ? (
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-bold text-white">{initials}</span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {session.profile.full_name ?? session.user.email}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{ROLE_LABELS[session.role]}</p>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Sign out"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-150 z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

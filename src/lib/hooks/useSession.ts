'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Profile, Organization, UserRole } from '@/types/database';

export interface SessionData {
  authenticated: boolean;
  user: { id: string; email: string };
  profile: Profile;
  organization: Organization;
  role: UserRole;
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/session');
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { session, loading, refresh };
}

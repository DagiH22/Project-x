'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { authApi } from '@/features/auth/api/auth.api';
import { PageLoader } from '@/components/feedback/page-loader';
import { useState, useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use a dedicated, lightweight query observer instead of the full useAuth hook
  // to avoid creating mutation instances that cause unnecessary re-renders.
  const { isLoading } = useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

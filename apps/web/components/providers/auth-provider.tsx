'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { PageLoader } from '@/components/feedback/page-loader';
import { useEffect, useState } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isUserLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isUserLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

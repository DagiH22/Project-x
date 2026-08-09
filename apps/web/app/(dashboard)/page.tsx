'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/empty-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, logout, isLoggingOut, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out');
      // Note: the middleware or AuthProvider might redirect automatically,
      // but if not, we can let the page handle it.
      // Usually, after query cache is cleared, AuthProvider triggers a re-render
      // and middleware will catch the missing cookie on next navigation.
      // We can also forcefully reload to ensure cookie is cleared from middleware context:
      window.location.href = '/login';
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.email || 'User'}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        {/* Placeholder cards */}
      </div>

      <EmptyState 
        title="No activity yet" 
        description="When you start using the application, your activity will appear here."
      />
    </div>
  );
}

import { EmptyState } from '@/components/feedback/empty-state';

export default function DashboardPage() {
  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back.
        </p>
      </div>

      <div className="mt-8">
        <EmptyState 
          title="Your workspace is ready" 
          description="Data will appear here once your support system starts processing conversations."
        />
      </div>
    </div>
  );
}

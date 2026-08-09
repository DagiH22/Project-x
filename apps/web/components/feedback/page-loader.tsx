import { LoadingSpinner } from './loading-spinner';

export function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm">
      <LoadingSpinner size={48} className="text-primary" />
    </div>
  );
}

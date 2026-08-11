'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Ticket,
  BookOpen,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/components/ui/button';

const NAVIGATION = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Conversations', href: '#', icon: MessageSquare, disabled: true },
  { name: 'Tickets', href: '#', icon: Ticket, disabled: true },
  { name: 'Knowledge Base', href: '#', icon: BookOpen, disabled: true },
  { name: 'Tools', href: '#', icon: Wrench, disabled: true },
  { name: 'Analytics', href: '#', icon: BarChart3, disabled: true },
  { name: 'Settings', href: '#', icon: Settings, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="flex h-full w-full flex-col bg-muted/20">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-primary rounded-md w-8 h-8 flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-semibold">A</span>
          </div>
          AgentDesk
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2 px-4">
        <nav className="grid gap-1">
          {NAVIGATION.map((item) => {
            const isActive = pathname === item.href;
            
            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/60 cursor-not-allowed opacity-75"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden mr-2">
            <p className="truncate text-sm font-medium">{user?.email || 'Loading...'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role || 'User'}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logout()} 
            disabled={isLoggingOut}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

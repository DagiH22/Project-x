'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  
  // Basic title mapping logic for the header based on the active path
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.includes('/conversations')) return 'Conversations';
    if (pathname.includes('/tickets')) return 'Tickets';
    if (pathname.includes('/knowledge-base')) return 'Knowledge Base';
    if (pathname.includes('/tools')) return 'Tools';
    if (pathname.includes('/analytics')) return 'Analytics';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger render={
            <Button variant="outline" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          } />
          <SheetContent side="left" className="p-0 w-72">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold md:hidden">{getPageTitle()}</h1>
        <div className="hidden md:block" /> {/* Spacer */}
        <div className="flex items-center gap-4">
          {/* Future slot for notifications, global search, etc. */}
        </div>
      </div>
    </header>
  );
}

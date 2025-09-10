"use client";

import { usePathname } from 'next/navigation';
import NavigationDock from './NavigationDock';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Don't show dock on public pages (home, auth)
  const isPublicPage = pathname === '/' || pathname?.startsWith('/auth');
  
  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <NavigationDock />
      
      {/* Main content with padding for dock */}
      <main className="md:ml-16 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
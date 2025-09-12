"use client";

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a singleton query client for the application
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface AppLayoutProps {
  children: React.ReactNode;
  isPublicPage?: boolean;
  providers?: React.ComponentType<{ children: React.ReactNode }>[];
  navigationDock?: React.ComponentType;
  topbar?: React.ComponentType;
  commandPalette?: React.ComponentType;
}

export function AppLayout({ 
  children, 
  isPublicPage = false,
  providers = [],
  navigationDock: NavigationDock,
  topbar: Topbar,
  commandPalette: CommandPalette,
}: AppLayoutProps) {
  
  if (isPublicPage) {
    return (
      <SessionProvider refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
          {providers.reduce(
            (acc, Provider) => <Provider>{acc}</Provider>,
            children
          )}
        </QueryClientProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider refetchInterval={0}>
      <QueryClientProvider client={queryClient}>
        {providers.reduce(
          (acc, Provider) => <Provider>{acc}</Provider>,
          <div className="min-h-screen">
            {Topbar && <Topbar />}
            {NavigationDock && <NavigationDock />}
            {CommandPalette && <CommandPalette />}
            
            {/* Main content with padding for dock and topbar */}
            <main className="md:ml-16 pb-16 md:pb-0 pt-14">
              {children}
            </main>
          </div>
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}
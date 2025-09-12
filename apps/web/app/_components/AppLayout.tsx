"use client";

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrefsProvider } from '../providers/prefs';
import { CommandPalette, NavigationDock, type NavigationItem } from '@ria/web-ui';
import { useUIState, useAppState } from '@ria/client';
import { ROUTES } from '@ria/utils';
import { search } from '../features/search';
import { centers } from '../features/registry';

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

const Topbar = dynamic(() => import('../../components/Topbar'), {
  ssr: false,
  loading: () => <div className="fixed top-0 left-0 w-full h-14 bg-white border-b animate-pulse" />
});

const iconMap: Record<string, string> = {
  portal: '🏠',
  messaging: '💬', 
  tasks: '✅',
  library: '📚',
  insights: '📊',
  finance: '💰',
  product: '🛠️',
  campaigns: '📢',
  people: '👥',
  admin: '⚙️',
  settings: '🔧'
};

const generateNavigationItems = (): NavigationItem[] => {
  const items: NavigationItem[] = [
    { name: 'Portal', href: ROUTES.PORTAL, icon: iconMap.portal, isPinned: true }
  ];

  centers.forEach(center => {
    const currentFeatures = center.features.filter(f => f.status === 'now');
    if (currentFeatures.length > 0) {
      const baseRoute = currentFeatures[0].routes[0]?.path.split('/')[1];
      const routeKey = baseRoute?.toUpperCase() as keyof typeof ROUTES;
      
      if (ROUTES[routeKey]) {
        items.push({
          name: center.name,
          href: ROUTES[routeKey],
          icon: iconMap[center.key] || '📄',
          status: 'now'
        });
      }
    }
  });

  items.push({ name: 'Settings', href: ROUTES.SETTINGS, icon: iconMap.settings });
  
  return items;
};

interface AppLayoutProps {
  children: React.ReactNode;
}

// Inner component that uses hooks after providers are set up
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { 
    sidebarOpen, 
    navigationCollapsed, 
    modalsOpen, 
    loading,
    toggleSidebar,
    setSidebarOpen,
    toggleNavigationCollapsed,
    openModal,
    closeModal,
    closeAllModals,
    setGlobalLoading
  } = useUIState();

  const {
    globalError,
    setGlobalError,
    clearError,
    updateActivity
  } = useAppState();

  // Update activity on interaction
  const handleUserActivity = () => {
    updateActivity();
  };

  const navigationItems = generateNavigationItems();

  // Global error display
  const ErrorBanner = globalError ? (
    <div className="fixed top-14 left-0 right-0 bg-red-500 text-white px-4 py-2 text-sm z-50 flex items-center justify-between">
      <span>{globalError}</span>
      <button 
        onClick={clearError}
        className="ml-4 text-white hover:text-gray-200 font-bold"
      >
        ×
      </button>
    </div>
  ) : null;

  // Global loading overlay
  const LoadingOverlay = loading.global ? (
    <div className="fixed inset-0 bg-black bg-opacity-25 z-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 flex items-center gap-3">
        <div className="animate-spin w-5 h-5 border-2 border-theme border-t-transparent rounded-full"></div>
        <span>Loading...</span>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen" onClick={handleUserActivity}>
      <Topbar />
      {ErrorBanner}
      
      <NavigationDock 
        items={navigationItems}
        collapsed={navigationCollapsed}
        onToggleCollapsed={toggleNavigationCollapsed}
      />
      
      <CommandPalette 
        searchFunction={search}
        isOpen={modalsOpen.commandPalette}
        onClose={() => closeModal('commandPaletteOpen')}
        onOpen={() => openModal('commandPaletteOpen')}
      />
      
      {/* Main content with dynamic padding based on sidebar state */}
      <main className={`
        transition-all duration-200 pt-14
        ${navigationCollapsed ? 'md:ml-4' : 'md:ml-16'} 
        pb-16 md:pb-0
        ${globalError ? 'pt-20' : 'pt-14'}
      `}>
        {children}
      </main>

      {LoadingOverlay}
      
      {/* Sync indicator */}
      {loading.sync && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 z-30">
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          Syncing...
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Don't show dock on public pages (home, auth)  
  const isPublicPage = pathname === '/' || pathname?.startsWith('/auth') || pathname === '/landing';
  
  if (isPublicPage) {
    return (
      <SessionProvider refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider refetchInterval={0}>
      <QueryClientProvider client={queryClient}>
        <PrefsProvider>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </PrefsProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
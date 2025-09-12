"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES, type RouteValue } from '@ria/utils';
import { centers, getCurrentFeatures, getFeatureByRoute } from '../features/registry';

interface DockItem {
  name: string;
  href: RouteValue;
  icon: string;
  isPinned?: boolean;
  status?: 'now' | 'next' | 'later';
}

const iconMap: Record<string, string> = {
  portal: '🏠',
  email: '📧',
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

const generateDockItems = (): DockItem[] => {
  const items: DockItem[] = [
    { name: 'Portal', href: ROUTES.PORTAL, icon: iconMap.portal, isPinned: true },
    { name: 'Email', href: ROUTES.EMAIL, icon: iconMap.email, status: 'now' }
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

const dockItems = generateDockItems();

export default function NavigationDock() {
  const pathname = usePathname();

  const isActive = (href: RouteValue) => {
    if (href === ROUTES.PORTAL) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const getStatusIndicator = (item: DockItem) => {
    if (item.status === 'next') {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-gray-900" 
             title="Coming Soon" />
      );
    }
    return null;
  };

  return (
    <>
      {/* Desktop Dock - Left Sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-full md:w-16 md:bg-bg-elev-1 md:border-r md:border-border md:z-40">
        <div className="flex flex-col items-center py-4 space-y-3">
          {dockItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
                ${isActive(item.href) 
                  ? 'bg-theme text-white shadow-md' 
                  : 'bg-bg-elev-2 hover:bg-bg-elev-3 hover:scale-105 border border-border'
                }
              `}
              title={item.name}
            >
              <span className="text-xl">{item.icon}</span>
              {getStatusIndicator(item)}
              
              {/* Tooltip */}
              <div className="absolute left-16 px-3 py-2 bg-bg-elev-3 border border-border text-text text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-md">
                {item.name}
                {item.status === 'next' && ' (Coming Soon)'}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Dock - Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-bg-elev-1 border-t border-border z-40">
        <div className="flex justify-around items-center py-2 px-2">
          {dockItems.slice(0, 5).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all duration-200
                ${isActive(item.href) 
                  ? 'bg-theme text-white' 
                  : 'hover:bg-bg-elev-2 text-text'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs text-text-muted mt-1 leading-none">{item.name.slice(0, 6)}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu Button for Additional Items */}
      <div className="fixed bottom-16 right-4 md:hidden z-40">
        <details className="relative">
          <summary className="w-12 h-12 bg-theme rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-theme-hover transition-colors">
            <span className="text-lg">⋯</span>
          </summary>
          <div className="absolute bottom-full right-0 mb-2 bg-bg-elev-2 border border-border rounded-lg shadow-xl p-2 min-w-[200px]">
            {dockItems.slice(5).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-text transition-colors
                  ${isActive(item.href) 
                    ? 'bg-theme text-white' 
                    : 'hover:bg-bg-elev-3'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </div>
        </details>
      </div>
    </>
  );
}
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES, type RouteValue } from '@ria/utils';

interface DockItem {
  name: string;
  href: RouteValue;
  icon: string;
  isPinned?: boolean;
}

const dockItems: DockItem[] = [
  { name: 'Portal', href: ROUTES.PORTAL, icon: '🏠', isPinned: true }, // Always pinned
  { name: 'Messaging', href: ROUTES.MESSAGING, icon: '💬' },
  { name: 'Tasks', href: ROUTES.TASKS, icon: '✅' },
  { name: 'Library', href: ROUTES.LIBRARY, icon: '📚' },
  { name: 'Insights', href: ROUTES.INSIGHTS, icon: '📊' },
  { name: 'Finance', href: ROUTES.FINANCE, icon: '💰' },
  { name: 'Product', href: ROUTES.PRODUCT, icon: '🛠️' },
  { name: 'Campaigns', href: ROUTES.CAMPAIGNS, icon: '📢' },
  { name: 'Admin', href: ROUTES.ADMIN, icon: '⚙️' },
  { name: 'Settings', href: ROUTES.SETTINGS, icon: '🔧' },
];

export default function NavigationDock() {
  const pathname = usePathname();

  const isActive = (href: RouteValue) => {
    if (href === ROUTES.PORTAL) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Desktop Dock - Left Sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-full md:w-16 md:bg-gray-900 md:z-40">
        <div className="flex flex-col items-center py-4 space-y-3">
          {dockItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
                ${isActive(item.href) 
                  ? 'bg-blue-600 shadow-lg' 
                  : 'bg-gray-800 hover:bg-gray-700 hover:scale-105'
                }
              `}
              title={item.name}
            >
              <span className="text-xl">{item.icon}</span>
              
              {/* Tooltip */}
              <div className="absolute left-16 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Dock - Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-gray-900 border-t border-gray-800 z-40">
        <div className="flex justify-around items-center py-2 px-2">
          {dockItems.slice(0, 5).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all duration-200
                ${isActive(item.href) 
                  ? 'bg-blue-600' 
                  : 'hover:bg-gray-800'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs text-gray-300 mt-1 leading-none">{item.name.slice(0, 6)}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu Button for Additional Items */}
      <div className="fixed bottom-16 right-4 md:hidden z-40">
        <details className="relative">
          <summary className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
            <span className="text-lg">⋯</span>
          </summary>
          <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-xl p-2 min-w-[200px]">
            {dockItems.slice(5).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-white transition-colors
                  ${isActive(item.href) 
                    ? 'bg-blue-600' 
                    : 'hover:bg-gray-800'
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
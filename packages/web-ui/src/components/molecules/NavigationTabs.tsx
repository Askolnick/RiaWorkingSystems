"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface TabItem {
  href: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface NavigationTabsProps {
  tabs: TabItem[];
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * NavigationTabs shows navigational tabs that highlight the current section based on pathname.
 * This is a generic component that can be used across different sections of the app.
 */
export function NavigationTabs({
  tabs,
  className = "",
  variant = 'default',
  size = 'md'
}: NavigationTabsProps) {
  const pathname = usePathname();

  const getTabClasses = (tab: TabItem, isActive: boolean) => {
    const baseClasses = "transition-colors duration-200";
    const sizeClasses = {
      sm: "px-2 py-1 text-sm",
      md: "px-3 py-2",
      lg: "px-4 py-3 text-lg"
    };

    if (variant === 'default') {
      return `${baseClasses} ${sizeClasses[size]} rounded-t-md ${
        isActive 
          ? 'bg-bg-elev-1 border border-border border-b-transparent -mb-px text-text font-medium' 
          : 'bg-bg-elev-2 hover:bg-bg-elev-3 text-text-muted hover:text-text'
      } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    }

    if (variant === 'pills') {
      return `${baseClasses} ${sizeClasses[size]} rounded-full ${
        isActive 
          ? 'bg-theme text-white font-medium' 
          : 'bg-bg-elev-2 hover:bg-bg-elev-3 text-text-muted hover:text-text'
      } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    }

    if (variant === 'underline') {
      return `${baseClasses} ${sizeClasses[size]} border-b-2 ${
        isActive 
          ? 'border-theme text-theme font-medium' 
          : 'border-transparent text-text-muted hover:text-text hover:border-border'
      } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    }

    return baseClasses;
  };

  const getNavClasses = () => {
    if (variant === 'default') {
      return "border-b border-border";
    }
    if (variant === 'underline') {
      return "border-b border-border";
    }
    return "";
  };

  return (
    <nav className={`${getNavClasses()} mb-4 ${className}`}>
      <ul className={`flex ${variant === 'pills' ? 'gap-2' : variant === 'underline' ? 'gap-6' : 'gap-1'} ${variant === 'default' ? 'p-1' : ''}`}>
        {tabs.map((tab) => {
          const isActive = pathname?.startsWith(tab.href);
          
          if (tab.disabled) {
            return (
              <li key={tab.href}>
                <span className={getTabClasses(tab, false)}>
                  {tab.icon && <span className="mr-2">{tab.icon}</span>}
                  {tab.label}
                </span>
              </li>
            );
          }

          return (
            <li key={tab.href}>
              <Link href={tab.href} className={getTabClasses(tab, isActive)}>
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
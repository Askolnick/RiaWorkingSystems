import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface DashboardStats {
  activeClients: number;
  pendingTasks: number;
  aumThisMonth: string;
  recentActivities: Activity[];
}

interface Activity {
  id: string;
  type: 'task' | 'client' | 'finance' | 'document';
  title: string;
  description: string;
  timestamp: string;
  status?: 'completed' | 'pending' | 'in-progress';
}

interface Module {
  name: string;
  href: string;
  icon: string;
  description: string;
  lastAccessed?: string;
  isEnabled: boolean;
}

interface PortalStore {
  // Dashboard data
  stats: DashboardStats;
  statsLoading: boolean;
  statsError: string | null;
  
  // Modules
  modules: Module[];
  
  // Activities
  activities: Activity[];
  activitiesLoading: boolean;
  
  // User preferences
  preferences: {
    dashboardLayout: 'grid' | 'list';
    moduleOrder: string[];
    showStats: boolean;
  };
  
  // Actions
  fetchStats: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  updatePreferences: (prefs: Partial<PortalStore['preferences']>) => void;
  markActivityAsRead: (id: string) => void;
  toggleModuleVisibility: (moduleName: string) => void;
}

// Mock data generators
const generateMockStats = (): DashboardStats => ({
  activeClients: 24,
  pendingTasks: 12,
  aumThisMonth: '$2.1M',
  recentActivities: [
    {
      id: '1',
      type: 'task',
      title: 'Client Meeting Scheduled',
      description: 'Meeting with John Doe scheduled for tomorrow',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    },
    {
      id: '2',
      type: 'finance',
      title: 'Invoice Generated',
      description: 'Invoice #INV-2024-001 generated for $5,000',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: '3',
      type: 'document',
      title: 'Document Uploaded',
      description: 'Client portfolio document uploaded to library',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: '4',
      type: 'client',
      title: 'New Client Onboarded',
      description: 'Jane Smith completed onboarding process',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    }
  ]
});

const defaultModules: Module[] = [
  { name: 'Messaging', href: '/messaging', icon: '💬', description: 'Client communications and internal messaging', isEnabled: true },
  { name: 'Tasks', href: '/tasks', icon: '✅', description: 'Task management and workflow tracking', isEnabled: true },
  { name: 'Library', href: '/library', icon: '📚', description: 'Document library and knowledge base', isEnabled: true },
  { name: 'Insights', href: '/insights', icon: '📊', description: 'Analytics and business intelligence', isEnabled: true },
  { name: 'Finance', href: '/finance', icon: '💰', description: 'Financial management and accounting', isEnabled: true },
  { name: 'Product', href: '/product', icon: '🛠️', description: 'Product and service management', isEnabled: true },
  { name: 'Campaigns', href: '/campaigns', icon: '📢', description: 'Marketing campaigns and outreach', isEnabled: true },
  { name: 'Admin', href: '/admin', icon: '⚙️', description: 'System administration and user management', isEnabled: true },
  { name: 'Settings', href: '/settings', icon: '🔧', description: 'Account and application settings', isEnabled: true },
];

export const usePortalStore = create<PortalStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      stats: generateMockStats(),
      statsLoading: false,
      statsError: null,
      
      modules: defaultModules,
      
      activities: generateMockStats().recentActivities,
      activitiesLoading: false,
      
      preferences: {
        dashboardLayout: 'grid',
        moduleOrder: defaultModules.map(m => m.name),
        showStats: true,
      },
      
      // Actions
      fetchStats: async () => {
        set(state => {
          state.statsLoading = true;
          state.statsError = null;
        });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newStats = generateMockStats();
          set(state => {
            state.stats = newStats;
            state.statsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.statsError = error instanceof Error ? error.message : 'Failed to fetch stats';
            state.statsLoading = false;
          });
        }
      },
      
      fetchActivities: async () => {
        set(state => {
          state.activitiesLoading = true;
        });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const activities = generateMockStats().recentActivities;
          set(state => {
            state.activities = activities;
            state.activitiesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.activitiesLoading = false;
          });
          console.error('Failed to fetch activities:', error);
        }
      },
      
      updatePreferences: (prefs: Partial<PortalStore['preferences']>) => {
        set(state => {
          state.preferences = { ...state.preferences, ...prefs };
        });
      },
      
      markActivityAsRead: (id: string) => {
        set(state => {
          const activity = state.activities.find(a => a.id === id);
          if (activity) {
            // In a real app, this would update the read status
            console.log(`Marked activity ${id} as read`);
          }
        });
      },
      
      toggleModuleVisibility: (moduleName: string) => {
        set(state => {
          const module = state.modules.find(m => m.name === moduleName);
          if (module) {
            module.isEnabled = !module.isEnabled;
          }
        });
      },
    }))
  )
);
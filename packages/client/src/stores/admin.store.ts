import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  userCount: number;
}

interface SystemSettings {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  sessionTimeout: number;
  maxFileSize: number;
  emailNotifications: boolean;
}

interface AdminStore {
  // Users
  users: User[];
  usersLoading: boolean;
  usersError: string | null;
  
  // Roles & Permissions
  roles: Role[];
  rolesLoading: boolean;
  
  // System Settings
  settings: SystemSettings;
  settingsLoading: boolean;
  
  // System Stats
  systemStats: {
    totalUsers: number;
    activeUsers: number;
    totalStorage: string;
    systemUptime: string;
  };
  
  // Actions
  fetchUsers: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchSystemStats: () => Promise<void>;
  
  // User management
  updateUserRole: (userId: string, role: User['role']) => Promise<void>;
  updateUserStatus: (userId: string, status: User['status']) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  
  // Settings management
  updateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  
  // Role management
  createRole: (role: Omit<Role, 'id' | 'userCount'>) => Promise<void>;
  updateRole: (id: string, updates: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
}

// Mock data generators
const generateMockUsers = (): User[] => [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@ria.com',
    role: 'admin',
    status: 'active',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Manager',
    email: 'manager@ria.com',
    role: 'manager',
    status: 'active',
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'Bob User',
    email: 'user@ria.com',
    role: 'user',
    status: 'active',
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-02-01T00:00:00Z'
  }
];

const generateMockRoles = (): Role[] => [
  {
    id: '1',
    name: 'Administrator',
    permissions: ['all'],
    description: 'Full system access',
    userCount: 2
  },
  {
    id: '2',
    name: 'Manager',
    permissions: ['read', 'write', 'manage_users'],
    description: 'Management level access',
    userCount: 5
  },
  {
    id: '3',
    name: 'User',
    permissions: ['read', 'write'],
    description: 'Standard user access',
    userCount: 15
  }
];

export const useAdminStore = create<AdminStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      users: [],
      usersLoading: false,
      usersError: null,
      
      roles: [],
      rolesLoading: false,
      
      settings: {
        maintenanceMode: false,
        allowRegistration: true,
        sessionTimeout: 30,
        maxFileSize: 50,
        emailNotifications: true,
      },
      settingsLoading: false,
      
      systemStats: {
        totalUsers: 22,
        activeUsers: 18,
        totalStorage: '2.3 GB',
        systemUptime: '99.9%'
      },
      
      // Actions
      fetchUsers: async () => {
        set(state => {
          state.usersLoading = true;
          state.usersError = null;
        });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          set(state => {
            state.users = generateMockUsers();
            state.usersLoading = false;
          });
        } catch (error) {
          set(state => {
            state.usersError = error instanceof Error ? error.message : 'Failed to fetch users';
            state.usersLoading = false;
          });
        }
      },
      
      fetchRoles: async () => {
        set(state => { state.rolesLoading = true; });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          set(state => {
            state.roles = generateMockRoles();
            state.rolesLoading = false;
          });
        } catch (error) {
          set(state => { state.rolesLoading = false; });
        }
      },
      
      fetchSettings: async () => {
        set(state => { state.settingsLoading = true; });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
          set(state => { state.settingsLoading = false; });
        } catch (error) {
          set(state => { state.settingsLoading = false; });
        }
      },
      
      fetchSystemStats: async () => {
        // Mock implementation - stats would be fetched from API
      },
      
      updateUserRole: async (userId: string, role: User['role']) => {
        set(state => {
          const user = state.users.find(u => u.id === userId);
          if (user) {
            user.role = role;
          }
        });
      },
      
      updateUserStatus: async (userId: string, status: User['status']) => {
        set(state => {
          const user = state.users.find(u => u.id === userId);
          if (user) {
            user.status = status;
          }
        });
      },
      
      deleteUser: async (userId: string) => {
        set(state => {
          state.users = state.users.filter(u => u.id !== userId);
        });
      },
      
      updateSettings: async (settings: Partial<SystemSettings>) => {
        set(state => {
          state.settings = { ...state.settings, ...settings };
        });
      },
      
      createRole: async (role: Omit<Role, 'id' | 'userCount'>) => {
        const newRole: Role = {
          ...role,
          id: Date.now().toString(),
          userCount: 0
        };
        set(state => {
          state.roles.push(newRole);
        });
      },
      
      updateRole: async (id: string, updates: Partial<Role>) => {
        set(state => {
          const index = state.roles.findIndex(r => r.id === id);
          if (index !== -1) {
            state.roles[index] = { ...state.roles[index], ...updates };
          }
        });
      },
      
      deleteRole: async (id: string) => {
        set(state => {
          state.roles = state.roles.filter(r => r.id !== id);
        });
      },
    }))
  )
);
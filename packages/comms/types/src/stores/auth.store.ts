import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tenantId: string;
  roles: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * Authentication Store
 * Manages user authentication state, tokens, and user information
 */
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (email: string, password: string) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Check if we're in mock mode
            const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
            
            if (useMockData) {
              // Mock login for development
              await new Promise(resolve => setTimeout(resolve, 500));
              
              const mockUser: User = {
                id: '1',
                email,
                name: email.split('@')[0],
                tenantId: 'tenant-1',
                roles: ['admin'],
              };
              
              const mockToken = 'mock-jwt-token-' + Date.now();
              
              set((state) => {
                state.user = mockUser;
                state.token = mockToken;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
            } else {
              // Real authentication will be handled by NextAuth on the frontend
              // This store method is mainly for compatibility
              throw new Error('Use NextAuth signIn method for real authentication');
            }
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Login failed';
              state.isLoading = false;
            });
            throw error;
          }
        },

        logout: () => {
          set((state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
          });
        },

        register: async (email: string, password: string, name: string) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Check if we're in mock mode
            const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
            
            if (useMockData) {
              // Mock registration for development
              await new Promise(resolve => setTimeout(resolve, 500));
              
              const mockUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                email,
                name,
                tenantId: 'tenant-1',
                roles: ['user'],
              };
              
              const mockToken = 'mock-jwt-token-' + Date.now();
              
              set((state) => {
                state.user = mockUser;
                state.token = mockToken;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
            } else {
              // Real registration - call the register API
              const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Registration failed');
              }

              const { user } = await response.json();
              
              set((state) => {
                state.user = user;
                state.token = null; // Will be handled by NextAuth
                state.isAuthenticated = false; // User needs to sign in
                state.isLoading = false;
              });
            }
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Registration failed';
              state.isLoading = false;
            });
            throw error;
          }
        },

        refreshToken: async () => {
          const currentToken = get().token;
          if (!currentToken) throw new Error('No token to refresh');

          try {
            // Mock token refresh - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const newToken = 'mock-jwt-token-refreshed-' + Date.now();
            
            set((state) => {
              state.token = newToken;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Token refresh failed';
              state.isAuthenticated = false;
            });
            throw error;
          }
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        setUser: (user: User) => {
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
          });
        },

        setToken: (token: string) => {
          set((state) => {
            state.token = token;
          });
        },
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
);

// Selectors
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectAuthLoading = (state: AuthStore) => state.isLoading;
export const selectAuthError = (state: AuthStore) => state.error;
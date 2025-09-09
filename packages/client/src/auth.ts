export type User = {
  id: string;
  email: string;
  name?: string;
};

export type Session = {
  user: User;
  token: string;
  refreshToken?: string;
};

export interface AuthClient {
  getSession(): Promise<Session | null>;
  signIn(email: string, password: string): Promise<Session>;
  signUp(email: string, password: string, name?: string): Promise<Session>;
  signOut(): Promise<void>;
  refreshSession(): Promise<Session>;
}

// Mock auth implementation for development/testing
export const createMockAuth = (): AuthClient => {
  const SESSION_KEY = "ria.auth.session";

  const parseSession = (): Session | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  };

  const getSession = async (): Promise<Session | null> => {
    return parseSession();
  };

  const signIn = async (email: string, password: string): Promise<Session> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, you would verify the credentials. Here we just create a
    // dummy user and token on the fly.
    const session: Session = {
      user: {
        id: Math.random().toString(36).substring(2),
        email,
        name: email.split('@')[0], // Extract name from email
      },
      token: Math.random().toString(36).substring(2),
      refreshToken: Math.random().toString(36).substring(2),
    };
    
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    
    return session;
  };

  const signUp = async (email: string, password: string, name?: string): Promise<Session> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const session: Session = {
      user: {
        id: Math.random().toString(36).substring(2),
        email,
        name: name || email.split('@')[0],
      },
      token: Math.random().toString(36).substring(2),
      refreshToken: Math.random().toString(36).substring(2),
    };
    
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    
    return session;
  };

  const signOut = async (): Promise<void> => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_KEY);
    }
  };

  const refreshSession = async (): Promise<Session> => {
    const currentSession = parseSession();
    if (!currentSession) {
      throw new Error('No session to refresh');
    }
    
    // Simulate token refresh
    const refreshedSession: Session = {
      ...currentSession,
      token: Math.random().toString(36).substring(2),
    };
    
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(refreshedSession));
    }
    
    return refreshedSession;
  };

  return {
    getSession,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };
};

// Default mock auth instance
export const auth = createMockAuth();
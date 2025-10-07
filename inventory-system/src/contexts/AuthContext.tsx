import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, LoginCredentials } from '../types/auth';
import { MOCK_USERS } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Constants for localStorage keys
const AUTH_STORAGE_KEY = 'inventory_auth_state';
const AUTH_EXPIRY_KEY = 'inventory_auth_expiry';

// Helper functions for localStorage
const saveAuthToStorage = (authState: AuthState) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    // Set expiry to 24 hours from now
    const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
    localStorage.setItem(AUTH_EXPIRY_KEY, expiry.toString());
  } catch (error) {
    console.warn('Failed to save auth state to localStorage:', error);
  }
};

const loadAuthFromStorage = (): AuthState | null => {
  try {
    const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
    const now = new Date().getTime();
    
    // Check if auth has expired
    if (!expiry || now > parseInt(expiry)) {
      clearAuthFromStorage();
      return null;
    }
    
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      return JSON.parse(savedAuth);
    }
  } catch (error) {
    console.warn('Failed to load auth state from localStorage:', error);
  }
  return null;
};

const clearAuthFromStorage = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
  } catch (error) {
    console.warn('Failed to clear auth state from localStorage:', error);
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on app start
  useEffect(() => {
    const savedAuth = loadAuthFromStorage();
    if (savedAuth && savedAuth.isAuthenticated) {
      setAuthState(savedAuth);
    }
    setIsLoading(false);
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      if (authState.isAuthenticated) {
        saveAuthToStorage(authState);
      } else {
        clearAuthFromStorage();
      }
    }
  }, [authState, isLoading]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userRecord = MOCK_USERS[credentials.email];
    
    if (userRecord && userRecord.password === credentials.password) {
      // Update last login time
      const updatedUser = {
        ...userRecord.user,
        lastLogin: new Date().toISOString()
      };
      
      const newAuthState = {
        user: updatedUser,
        isAuthenticated: true
      };
      
      setAuthState(newAuthState);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    const newAuthState = {
      user: null,
      isAuthenticated: false
    };
    setAuthState(newAuthState);
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

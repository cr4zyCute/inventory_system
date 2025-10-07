import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, LoginCredentials } from '../types/auth';
import { MOCK_USERS } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });

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
      
      setAuthState({
        user: updatedUser,
        isAuthenticated: true
      });
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false
    });
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout
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

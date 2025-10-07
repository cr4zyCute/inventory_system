export type UserRole = 'admin' | 'cashier' | 'manager';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  name: string; // Full name for display
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Mock user data for demonstration - using email as key
export const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@gmail.com': {
    password: 'admin',
    user: {
      id: '1',
      email: 'admin@gmail.com',
      username: 'admin',
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      name: 'System Administrator',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: new Date().toISOString()
    }
  },
  'manager@gmail.com': {
    password: 'manager',
    user: {
      id: '2',
      email: 'manager@gmail.com',
      username: 'manager',
      role: 'manager',
      firstName: 'Jane',
      lastName: 'Manager',
      name: 'Jane Manager',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: new Date().toISOString()
    }
  },
  'cashier@gmail.com': {
    password: 'cashier',
    user: {
      id: '3',
      email: 'cashier@gmail.com',
      username: 'cashier',
      role: 'cashier',
      firstName: 'John',
      lastName: 'Cashier',
      name: 'John Cashier',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: new Date().toISOString()
    }
  }
};

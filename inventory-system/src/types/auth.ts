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

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
}

// Mock user data removed - now using backend database authentication

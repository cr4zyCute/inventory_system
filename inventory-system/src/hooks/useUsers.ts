import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}

// API functions
const API_BASE_URL = '';

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/api/users`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data || data || [];
};

const createUser = async (userData: UserCreateInput): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  return result.data;
};

const updateUser = async ({ id, data }: { id: string; data: Partial<UserCreateInput> }): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  return result.data;
};

const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
};

const updateUserStatus = async ({ id, isActive }: { id: string; isActive: boolean }): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive }),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  return result.data;
};

// Custom hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      // Update the users cache
      queryClient.setQueryData(['users'], (oldData: User[] | undefined) => {
        return oldData ? [newUser, ...oldData] : [newUser];
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      // Update the users cache
      queryClient.setQueryData(['users'], (oldData: User[] | undefined) => {
        return oldData?.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ) || [];
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, deletedId) => {
      // Remove from users cache
      queryClient.setQueryData(['users'], (oldData: User[] | undefined) => {
        return oldData?.filter(user => user.id !== deletedId) || [];
      });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserStatus,
    onSuccess: (updatedUser) => {
      // Update the users cache
      queryClient.setQueryData(['users'], (oldData: User[] | undefined) => {
        return oldData?.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ) || [];
      });
    },
  });
};

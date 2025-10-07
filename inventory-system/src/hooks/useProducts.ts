import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface Product {
  id: string;
  barcode: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stockQuantity: number;
  minStockLevel: number;
  categoryId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductCreateInput {
  barcode: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stockQuantity: number;
  minStockLevel: number;
  categoryId?: string;
  isActive: boolean;
}

// API functions
const API_BASE_URL = '';

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data || data || [];
};

const createProduct = async (productData: ProductCreateInput): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  return result.data;
};

const updateProduct = async ({ id, data }: { id: string; data: Partial<ProductCreateInput> }): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
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

const deleteProduct = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
};

const updateProductStatus = async ({ id, isActive }: { id: string; isActive: boolean }): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}/status`, {
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
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      // Update the products cache
      queryClient.setQueryData(['products'], (oldData: Product[] | undefined) => {
        return oldData ? [newProduct, ...oldData] : [newProduct];
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (updatedProduct) => {
      // Update the products cache
      queryClient.setQueryData(['products'], (oldData: Product[] | undefined) => {
        return oldData?.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        ) || [];
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, deletedId) => {
      // Remove from products cache
      queryClient.setQueryData(['products'], (oldData: Product[] | undefined) => {
        return oldData?.filter(product => product.id !== deletedId) || [];
      });
    },
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProductStatus,
    onSuccess: (updatedProduct) => {
      // Update the products cache
      queryClient.setQueryData(['products'], (oldData: Product[] | undefined) => {
        return oldData?.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        ) || [];
      });
    },
  });
};

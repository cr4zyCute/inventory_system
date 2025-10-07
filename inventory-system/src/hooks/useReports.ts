import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3001/api';

interface ReportParams {
  startDate: string;
  endDate: string;
}

interface SalesReportData {
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  topProducts: Array<{
    name: string;
    sales: number;
    units: number;
  }>;
}

interface InventoryReportData {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  lowStockProducts: Array<{
    name: string;
    current: number;
    minimum: number;
    category: string;
  }>;
}

interface UserSalesReportData {
  totalSales: number;
  totalTransactions: number;
  todaySales: number;
  todayTransactions: number;
  weekSales: number;
  recentTransactions: Array<{
    id: string;
    time: string;
    amount: number;
    items: number;
  }>;
}

interface DashboardAnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  activeCustomers: number;
  productsSold: number;
  salesTrend: Array<{
    date: string;
    sales: number;
  }>;
}

// Sales Summary Report
export const useSalesReport = (params: ReportParams) => {
  return useQuery({
    queryKey: ['salesReport', params],
    queryFn: async (): Promise<SalesReportData> => {
      const response = await fetch(
        `${API_BASE_URL}/reports/sales-summary?startDate=${params.startDate}&endDate=${params.endDate}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales report');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!params.startDate && !!params.endDate,
  });
};

// Inventory Overview Report
export const useInventoryReport = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['inventoryReport'],
    queryFn: async (): Promise<InventoryReportData> => {
      const response = await fetch(`${API_BASE_URL}/reports/inventory-overview`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory report');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: options?.enabled !== false,
  });
};

// User Sales Report (My Sales)
export const useUserSalesReport = (params: ReportParams) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userSalesReport', user?.id, params],
    queryFn: async (): Promise<UserSalesReportData> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/reports/my-sales/${user.id}?startDate=${params.startDate}&endDate=${params.endDate}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user sales report');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!user?.id && !!params.startDate && !!params.endDate,
  });
};

// Daily Transactions Report
export const useDailyTransactionsReport = (params: ReportParams) => {
  return useQuery({
    queryKey: ['dailyTransactionsReport', params],
    queryFn: async (): Promise<UserSalesReportData> => {
      const response = await fetch(
        `${API_BASE_URL}/reports/daily-transactions?startDate=${params.startDate}&endDate=${params.endDate}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily transactions report');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!params.startDate && !!params.endDate,
  });
};

// Dashboard Analytics
export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: async (): Promise<DashboardAnalyticsData> => {
      const response = await fetch(`${API_BASE_URL}/reports/dashboard-analytics`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard analytics');
      }
      
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time data
  });
};

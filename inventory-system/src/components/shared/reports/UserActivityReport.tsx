import React, { useState, useEffect } from 'react';
import '../css/report.css';

interface Transaction {
  id: string;
  date: string;
  time: string;
  cashier: string;
  items: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt?: string;
}

interface UserActivityMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalSales: number;
  activityRate: string;
  topPerformers: Array<{
    name: string;
    role: string;
    transactionCount: number;
    totalSales: number;
    lastActivity: string;
  }>;
  recentActivities: Array<{
    id: string;
    user: string;
    userRole: string;
    description: string;
    amount: number;
    timestamp: string;
  }>;
  lastLoginData: Array<{
    name: string;
    role: string;
    lastLogin: string;
  }>;
}

const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString()}`;
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatLastLogin = (lastLogin: string): string => {
  return formatTimeAgo(lastLogin);
};

const getRoleIcon = (role: string): string => {
  switch (role) {
    case 'ADMIN': return 'bi-shield-check';
    case 'MANAGER': return 'bi-person-gear';
    case 'CASHIER': return 'bi-cash-coin';
    default: return 'bi-person';
  }
};

const getRoleColor = (role: string): string => {
  switch (role) {
    case 'ADMIN': return '#dc3545';
    case 'MANAGER': return '#fd7e14';
    case 'CASHIER': return '#198754';
    default: return '#6c757d';
  }
};

// Fetch transactions from the same API as other reports
const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await fetch('/api/transactions');
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    const result = await response.json();
    
    // The backend returns { success: true, data: [...] } format
    const transactions = result.data || result;
    
    // Transform database data to match our Transaction interface
    return transactions.map((dbTransaction: any) => ({
      id: dbTransaction.transactionId,
      date: new Date(dbTransaction.createdAt).toLocaleDateString(),
      time: new Date(dbTransaction.createdAt).toLocaleTimeString(),
      cashier: dbTransaction.cashierName && dbTransaction.cashierName !== 'Unknown' 
               ? dbTransaction.cashierName
               : dbTransaction.cashier?.firstName && dbTransaction.cashier?.lastName
               ? `${dbTransaction.cashier.firstName} ${dbTransaction.cashier.lastName}`
               : dbTransaction.cashier?.username
               ? dbTransaction.cashier.username
               : 'Unknown Cashier',
      items: dbTransaction.items?.length || 0,
      total: dbTransaction.totalAmount,
      paymentMethod: dbTransaction.paymentMethod,
      status: dbTransaction.status === 'completed' ? 'Completed' : 
              dbTransaction.status === 'refunded' ? 'Refunded' : 'Pending',
      createdAt: dbTransaction.createdAt
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Calculate user activity metrics from transaction data
const calculateUserMetrics = (transactions: Transaction[]): UserActivityMetrics => {
  // Group transactions by cashier
  const cashierMap = new Map<string, { count: number; sales: number; lastActivity: string }>();
  
  transactions.forEach(transaction => {
    const existing = cashierMap.get(transaction.cashier) || { count: 0, sales: 0, lastActivity: transaction.createdAt || '' };
    cashierMap.set(transaction.cashier, {
      count: existing.count + 1,
      sales: existing.sales + transaction.total,
      lastActivity: transaction.createdAt || existing.lastActivity
    });
  });

  // Create top performers
  const topPerformers = Array.from(cashierMap.entries())
    .map(([name, data]) => ({
      name,
      role: 'CASHIER', // Default role, could be enhanced with real user data
      transactionCount: data.count,
      totalSales: data.sales,
      lastActivity: data.lastActivity
    }))
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, 5);

  // Create recent activities
  const recentActivities = transactions
    .slice(0, 10)
    .map(transaction => ({
      id: transaction.id,
      user: transaction.cashier,
      userRole: 'CASHIER',
      description: `Processed transaction ${transaction.id}`,
      amount: transaction.total,
      timestamp: transaction.createdAt || new Date().toISOString()
    }));

  // Create last login data (simulated from transaction activity)
  const lastLoginData = Array.from(cashierMap.entries())
    .map(([name, data]) => ({
      name,
      role: 'CASHIER',
      lastLogin: data.lastActivity
    }))
    .sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime())
    .slice(0, 6);

  const totalUsers = cashierMap.size;
  const activeUsers = totalUsers; // All users with transactions are considered active
  const totalTransactions = transactions.length;
  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
  const activityRate = totalUsers > 0 ? '100.0' : '0.0'; // All users with transactions are active

  return {
    totalUsers,
    activeUsers,
    totalTransactions,
    totalSales,
    activityRate,
    topPerformers,
    recentActivities,
    lastLoginData
  };
};

const UserActivityReport: React.FC = () => {
  const [metrics, setMetrics] = useState<UserActivityMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalSales: 0,
    activityRate: '0',
    topPerformers: [],
    recentActivities: [],
    lastLoginData: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactionData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTransactions();
        setMetrics(calculateUserMetrics(data));
      } catch (err) {
        setError('Failed to load user activity data');
        console.error('Error loading user activity data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactionData();
  }, []);

  if (isLoading) {
    return (
      <div className="report-content">
        <div className="loading-state">
          <i className="bi-arrow-repeat spinning"></i>
          <span>Loading user activity report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-content">
        <div className="error-state">
          <i className="bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-people"></i>
          </div>
          <div className="metric-info">
            <h3>{metrics.totalUsers}</h3>
            <p>Active Cashiers</p>
            <div className="metric-detail">Users with transactions</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-person-check"></i>
          </div>
          <div className="metric-info">
            <h3>{metrics.activeUsers}</h3>
            <p>Active Users</p>
            <div className="metric-detail">Recently active</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-receipt"></i>
          </div>
          <div className="metric-info">
            <h3>{metrics.totalTransactions.toLocaleString()}</h3>
            <p>Total Transactions</p>
            <div className="metric-detail">All time</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-graph-up"></i>
          </div>
          <div className="metric-info">
            <h3>{metrics.activityRate}%</h3>
            <p>Activity Rate</p>
            <div className="metric-detail">{formatCurrency(metrics.totalSales)} sales</div>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Top Performers</h4>
          <div className="product-list">
            {metrics.topPerformers.length > 0 ? (
              metrics.topPerformers.slice(0, 5).map((performer, index) => (
                <div key={index} className="product-item">
                  <div className="performer-info">
                    <span className="product-name">
                      <i className={getRoleIcon(performer.role)} style={{ color: getRoleColor(performer.role), marginRight: '8px' }}></i>
                      {performer.name} - {performer.role}
                    </span>
                    <div className="performer-details">
                      <small>{performer.transactionCount} transactions</small>
                    </div>
                  </div>
                  <span className="product-sales">{formatCurrency(performer.totalSales)}</span>
                  <span className="product-units">{performer.transactionCount} txns</span>
                  <span className="last-login">{formatLastLogin(performer.lastActivity)}</span>
                </div>
              ))
            ) : (
              <div className="no-data">
                <i className="bi-person-x"></i>
                <span>No user performance data available</span>
              </div>
            )}
          </div>
        </div>

        <div className="report-section">
          <h4>Recent Activity</h4>
          <div className="activity-list">
            {metrics.recentActivities.length > 0 ? (
              metrics.recentActivities.slice(0, 8).map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    <i className="bi-receipt"></i>
                  </div>
                  <div className="activity-content">
                    <p>{activity.user} - {activity.userRole}</p>
                    <span>{activity.description}</span>
                    {activity.amount > 0 && (
                      <div className="activity-amount">{formatCurrency(activity.amount)}</div>
                    )}
                  </div>
                  <div className="activity-time">{formatTimeAgo(activity.timestamp)}</div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <i className="bi-clock-history"></i>
                <span>No recent activities found</span>
              </div>
            )}
          </div>
        </div>

        <div className="report-section">
          <h4>Last Login</h4>
          <div className="last-login-table">
            {metrics.lastLoginData.length > 0 ? (
              metrics.lastLoginData.map((loginEntry, index) => (
                <div key={index} className="login-entry">
                  <div className="login-user">
                    <div className="user-name">{loginEntry.name}</div>
                    <div className="user-role">{loginEntry.role}</div>
                  </div>
                  <div className="login-time">{formatLastLogin(loginEntry.lastLogin)}</div>
                  <div className="login-date">{formatDate(loginEntry.lastLogin)}</div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <i className="bi-person-x"></i>
                <span>No login data available</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityReport;

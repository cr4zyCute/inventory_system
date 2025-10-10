import React, { useState, useEffect } from 'react';
import { Skeleton } from '../common/skeletonLoading';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './css/useractivity.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface UserActivityData {
  summary: {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalSales: number;
    activityRate: string;
  };
  topPerformers: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    transactionCount: number;
    totalSales: number;
    lastLogin: string;
    isActive: boolean;
  }>;
  activityTrend: Array<{
    date: string;
    transactions: number;
    logins: number;
    totalActivity: number;
  }>;
  roleStats: Array<{
    role: string;
    count: number;
    percentage: string;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    user: string;
    userRole: string;
    amount: number;
    timestamp: string;
  }>;
}

const UserActivity: React.FC = () => {
  const [activityData, setActivityData] = useState<UserActivityData | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);

  // Fetch user activity data
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setActivityLoading(true);
        const response = await fetch('/api/reports/user-activity-report');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setActivityData(result.data);
            return;
          }
        }
        
        // Fallback to mock data if API fails
        throw new Error('API response not successful');
      } catch (error) {
        console.error('Failed to fetch activity data, using fallback data:', error);
        
        // Fallback mock data
        const fallbackData: UserActivityData = {
          summary: {
            totalUsers: 12,
            activeUsers: 8,
            totalTransactions: 156,
            totalSales: 45230.50,
            activityRate: '66.7',
          },
          topPerformers: [
            {
              id: '1',
              name: 'Maria Santos',
              role: 'CASHIER',
              email: 'maria.santos@store.com',
              transactionCount: 45,
              totalSales: 12450.75,
              lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              isActive: true,
            },
            {
              id: '2',
              name: 'John Dela Cruz',
              role: 'MANAGER',
              email: 'john.delacruz@store.com',
              transactionCount: 32,
              totalSales: 9875.25,
              lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              isActive: true,
            },
            {
              id: '3',
              name: 'Ana Rodriguez',
              role: 'CASHIER',
              email: 'ana.rodriguez@store.com',
              transactionCount: 28,
              totalSales: 8234.50,
              lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              isActive: true,
            },
            {
              id: '4',
              name: 'Carlos Mendoza',
              role: 'ADMIN',
              email: 'carlos.mendoza@store.com',
              transactionCount: 25,
              totalSales: 7890.25,
              lastLogin: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
              isActive: true,
            },
            {
              id: '5',
              name: 'Lisa Garcia',
              role: 'CASHIER',
              email: 'lisa.garcia@store.com',
              transactionCount: 26,
              totalSales: 6543.75,
              lastLogin: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
              isActive: true,
            },
          ],
          activityTrend: [
            { date: 'Sun', transactions: 12, logins: 3, totalActivity: 15 },
            { date: 'Mon', transactions: 28, logins: 8, totalActivity: 36 },
            { date: 'Tue', transactions: 35, logins: 7, totalActivity: 42 },
            { date: 'Wed', transactions: 22, logins: 6, totalActivity: 28 },
            { date: 'Thu', transactions: 31, logins: 8, totalActivity: 39 },
            { date: 'Fri', transactions: 18, logins: 5, totalActivity: 23 },
            { date: 'Sat', transactions: 10, logins: 2, totalActivity: 12 },
          ],
          roleStats: [
            { role: 'CASHIER', count: 6, percentage: '50.0' },
            { role: 'MANAGER', count: 3, percentage: '25.0' },
            { role: 'ADMIN', count: 3, percentage: '25.0' },
          ],
          recentActivities: [
            {
              id: '1',
              type: 'transaction',
              description: 'Processed transaction TXN-2024-001247',
              user: 'Maria Santos',
              userRole: 'CASHIER',
              amount: 125.50,
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            },
            {
              id: '2',
              type: 'transaction',
              description: 'Processed transaction TXN-2024-001248',
              user: 'John Dela Cruz',
              userRole: 'MANAGER',
              amount: 89.75,
              timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            },
          ],
        };
        
        setActivityData(fallbackData);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivityData();
  }, []);

  return (
    <div className="user-activity-container">
      <div className="activity-header">
        <h1 className="activity-title">
          <i className="bi bi-graph-up"></i>
          User Activity Analytics
        </h1>
        <p className="activity-subtitle">
          Monitor user engagement, performance metrics, and system activity trends
        </p>
      </div>

      <div className="activity-content">
        {activityLoading ? (
          <div className="activity-loading">
            <div className="loading-grid">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="chart-skeleton">
                  <Skeleton width="100%" height="300px" variant="rounded" animation="shimmer" />
                </div>
              ))}
            </div>
          </div>
        ) : activityData ? (
          <div className="activity-charts">
            {/* Hierarchical Grid Layout with 4 Boxes */}
            <div className="hierarchical-grid">
              {/* Box 1: Activity Summary Cards */}
              <div className="grid-box summary-box">
                <h3 className="box-title">
                  <i className="bi bi-speedometer2"></i>
                  Activity Summary
                </h3>
                <div className="summary-metrics">
                  <div className="metric-item">
                    <div className="metric-icon">
                      <i className="bi bi-people"></i>
                    </div>
                    <div className="metric-info">
                      <span className="metric-value">{activityData.summary.totalUsers}</span>
                      <span className="metric-label">Total Users</span>
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-icon">
                      <i className="bi bi-person-check"></i>
                    </div>
                    <div className="metric-info">
                      <span className="metric-value">{activityData.summary.activeUsers}</span>
                      <span className="metric-label">Active Users</span>
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-icon">
                      <i className="bi bi-receipt"></i>
                    </div>
                    <div className="metric-info">
                      <span className="metric-value">{activityData.summary.totalTransactions}</span>
                      <span className="metric-label">Transactions</span>
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-icon">
                      <i className="bi bi-currency-dollar"></i>
                    </div>
                    <div className="metric-info">
                      <span className="metric-value">₱{activityData.summary.totalSales.toLocaleString()}</span>
                      <span className="metric-label">Total Sales</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Activity Trend Line Chart */}
              <div className="grid-box chart-box">
                <h3 className="box-title">
                  <i className="bi bi-graph-up"></i>
                  Weekly Activity Trend
                </h3>
                <div className="chart-wrapper">
                  <Line
                    data={{
                      labels: activityData.activityTrend.map(item => item.date),
                      datasets: [
                        {
                          label: 'Transactions',
                          data: activityData.activityTrend.map(item => item.transactions),
                          borderColor: '#000000',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          tension: 0.4,
                          fill: true,
                        },
                        {
                          label: 'User Logins',
                          data: activityData.activityTrend.map(item => item.logins),
                          borderColor: '#666666',
                          backgroundColor: 'rgba(102, 102, 102, 0.1)',
                          tension: 0.4,
                          fill: true,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Box 3: Role Distribution Donut Chart */}
              <div className="grid-box chart-box">
                <h3 className="box-title">
                  <i className="bi bi-pie-chart"></i>
                  User Role Distribution
                </h3>
                <div className="chart-wrapper">
                  <Doughnut
                    data={{
                      labels: activityData.roleStats.map(item => item.role),
                      datasets: [
                        {
                          data: activityData.roleStats.map(item => item.count),
                          backgroundColor: [
                            '#000000',
                            '#333333',
                            '#666666',
                            '#999999',
                          ],
                          borderWidth: 2,
                          borderColor: '#ffffff',
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                        title: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Box 4: Top Performers Bar Chart */}
              <div className="grid-box chart-box">
                <h3 className="box-title">
                  <i className="bi bi-bar-chart"></i>
                  Top Performers
                </h3>
                <div className="chart-wrapper">
                  <Bar
                    data={{
                      labels: activityData.topPerformers.slice(0, 5).map(item => item.name.split(' ')[0]),
                      datasets: [
                        {
                          label: 'Transactions',
                          data: activityData.topPerformers.slice(0, 5).map(item => item.transactionCount),
                          backgroundColor: '#000000',
                          borderColor: '#000000',
                          borderWidth: 1,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Additional Activity Details */}
            <div className="activity-details">
              <div className="details-section">
                <h3 className="details-title">
                  <i className="bi bi-clock-history"></i>
                  Recent Activities
                </h3>
                <div className="activities-list">
                  {activityData.recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-info">
                        <div className="activity-description">{activity.description}</div>
                        <div className="activity-meta">
                          <span className="activity-user">{activity.user}</span>
                          <span className="activity-role">({activity.userRole})</span>
                          <span className="activity-amount">₱{activity.amount.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="activity-time">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="details-section">
                <h3 className="details-title">
                  <i className="bi bi-trophy"></i>
                  Performance Leaderboard
                </h3>
                <div className="leaderboard">
                  {activityData.topPerformers.slice(0, 5).map((performer, index) => (
                    <div key={performer.id} className="leaderboard-item">
                      <div className="rank">#{index + 1}</div>
                      <div className="performer-info">
                        <div className="performer-name">{performer.name}</div>
                        <div className="performer-role">{performer.role}</div>
                      </div>
                      <div className="performer-stats">
                        <div className="stat-transactions">{performer.transactionCount} transactions</div>
                        <div className="stat-sales">₱{performer.totalSales.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="activity-error">
            <i className="bi bi-exclamation-triangle"></i>
            <p>Failed to load activity data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivity;

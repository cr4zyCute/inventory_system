import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import './css/CashierDashboardAnalytics.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Transaction {
  id: string;
  date: string;
  time: string;
  cashier: string;
  items: number;
  total: number;
  paymentMethod: string;
  status: string;
  lineItems?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt?: string;
  cashierId?: string;
}

interface CashierAnalyticsData {
  salesTrend: {
    labels: string[];
    data: number[];
  };
  topProducts: {
    labels: string[];
    data: number[];
  };
  salesByTimeOfDay: {
    labels: string[];
    data: number[];
  };
  hourlyPerformance: {
    labels: string[];
    data: number[];
  };
}

interface CashierAnalyticsStats {
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  todaysSales: number;
  todaysTransactions: number;
  bestHour: string;
}

type TimePeriod = 'daily' | 'weekly' | 'monthly';

// Fetch transactions filtered by current cashier
const fetchCashierTransactions = async (cashierId: string): Promise<Transaction[]> => {
  try {
    const response = await fetch('/api/transactions');
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    const result = await response.json();
    
    const transactions = result.data || result;
    
    // Transform and filter by cashier ID
    const allTransactions = transactions.map((dbTransaction: any) => ({
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
      lineItems: dbTransaction.items?.map((item: any) => ({
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.unitPrice
      })) || [],
      createdAt: dbTransaction.createdAt,
      cashierId: dbTransaction.cashierId
    }));

    // Filter transactions for current cashier only
    return allTransactions.filter((t: Transaction) => 
      t.cashierId === cashierId || 
      t.cashier.toLowerCase().includes(cashierId.toLowerCase()) ||
      t.status === 'Completed' // Include completed transactions if cashier matching is unclear
    );
  } catch (error) {
    console.error('Error fetching cashier transactions:', error);
    return [];
  }
};

const CashierDashboardAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { data: products = [] } = useProducts();
  const [analyticsData, setAnalyticsData] = useState<CashierAnalyticsData | null>(null);
  const [analyticsStats, setAnalyticsStats] = useState<CashierAnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'performance' | 'products' | 'trends'>('performance');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');

  useEffect(() => {
    if (user?.id) {
      fetchCashierAnalyticsData();
    }
  }, [user, timePeriod]);

  const fetchCashierAnalyticsData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch transactions for current cashier only
      const transactions = await fetchCashierTransactions(user.id);
      
      // Filter only completed transactions
      const completedTransactions = transactions.filter(t => t.status === 'Completed');
      
      // Process cashier-specific data
      const processedData = processCashierAnalyticsData(completedTransactions, timePeriod);
      const processedStats = calculateCashierAnalyticsStats(completedTransactions);
      
      setAnalyticsData(processedData);
      setAnalyticsStats(processedStats);
    } catch (error) {
      console.error('Error fetching cashier analytics data:', error);
      // Set default values if API fails
      setAnalyticsData(getDefaultAnalyticsData());
      setAnalyticsStats(getDefaultAnalyticsStats());
    } finally {
      setLoading(false);
    }
  };

  const calculateCashierAnalyticsStats = (transactions: Transaction[]): CashierAnalyticsStats => {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = transactions.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    // Today's performance
    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = transactions.filter(t => 
      t.createdAt && t.createdAt.startsWith(today)
    );
    const todaysSales = todaysTransactions.reduce((sum, t) => sum + t.total, 0);
    
    // Find best performing hour
    const hourlyData = new Map();
    transactions.forEach(t => {
      if (t.createdAt) {
        const hour = new Date(t.createdAt).getHours();
        const current = hourlyData.get(hour) || 0;
        hourlyData.set(hour, current + t.total);
      }
    });
    
    let bestHour = '12:00 PM';
    let bestHourSales = 0;
    hourlyData.forEach((sales, hour) => {
      if (sales > bestHourSales) {
        bestHourSales = sales;
        bestHour = hour === 0 ? '12:00 AM' : 
                   hour < 12 ? `${hour}:00 AM` : 
                   hour === 12 ? '12:00 PM' : 
                   `${hour - 12}:00 PM`;
      }
    });
    
    return {
      totalRevenue,
      totalTransactions,
      averageTransaction,
      todaysSales,
      todaysTransactions: todaysTransactions.length,
      bestHour
    };
  };

  const generateCashierTimeSeriesData = (transactions: Transaction[], period: TimePeriod) => {
    const now = new Date();
    let labels: string[] = [];
    let salesData: number[] = [];

    switch (period) {
      case 'daily':
        // Last 7 days
        labels = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now);
          date.setDate(now.getDate() - (6 - i));
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        salesData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now);
          date.setDate(now.getDate() - (6 - i));
          const dateStr = date.toISOString().split('T')[0];
          const dayTransactions = transactions.filter(t => 
            t.createdAt && t.createdAt.startsWith(dateStr)
          );
          return dayTransactions.reduce((sum, t) => sum + t.total, 0);
        });
        break;

      case 'weekly':
        // Last 4 weeks
        labels = Array.from({ length: 4 }, (_, i) => `Week ${4 - i}`);
        salesData = Array.from({ length: 4 }, (_, i) => {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (7 * (3 - i)));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          const weekTransactions = transactions.filter(t => {
            if (!t.createdAt) return false;
            const transactionDate = new Date(t.createdAt);
            return transactionDate >= weekStart && transactionDate <= weekEnd;
          });
          return weekTransactions.reduce((sum, t) => sum + t.total, 0);
        });
        break;

      case 'monthly':
        // Last 6 months
        labels = Array.from({ length: 6 }, (_, i) => {
          const month = new Date(now);
          month.setMonth(now.getMonth() - (5 - i));
          return month.toLocaleDateString('en-US', { month: 'short' });
        });
        salesData = Array.from({ length: 6 }, (_, i) => {
          const month = new Date(now);
          month.setMonth(now.getMonth() - (5 - i));
          const monthStr = month.toISOString().slice(0, 7);
          const monthTransactions = transactions.filter(t => 
            t.createdAt && t.createdAt.startsWith(monthStr)
          );
          return monthTransactions.reduce((sum, t) => sum + t.total, 0);
        });
        break;
    }

    return { labels, salesData };
  };

  const processCashierAnalyticsData = (transactions: Transaction[], period: TimePeriod): CashierAnalyticsData => {
    // Sales trend over time
    const { labels, salesData } = generateCashierTimeSeriesData(transactions, period);

    // Top products sold by this cashier
    const productSales = new Map();
    transactions.forEach(transaction => {
      if (transaction.lineItems) {
        transaction.lineItems.forEach((item) => {
          const current = productSales.get(item.name) || 0;
          productSales.set(item.name, current + item.quantity);
        });
      }
    });

    const topProductsArray = Array.from(productSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Sales by time of day breakdown
    const timeOfDayMap = new Map([
      ['Morning (6AM-12PM)', 0],
      ['Afternoon (12PM-6PM)', 0],
      ['Evening (6PM-12AM)', 0],
      ['Night (12AM-6AM)', 0]
    ]);
    
    transactions.forEach(t => {
      if (t.createdAt) {
        const hour = new Date(t.createdAt).getHours();
        if (hour >= 6 && hour < 12) {
          timeOfDayMap.set('Morning (6AM-12PM)', timeOfDayMap.get('Morning (6AM-12PM)')! + t.total);
        } else if (hour >= 12 && hour < 18) {
          timeOfDayMap.set('Afternoon (12PM-6PM)', timeOfDayMap.get('Afternoon (12PM-6PM)')! + t.total);
        } else if (hour >= 18 && hour < 24) {
          timeOfDayMap.set('Evening (6PM-12AM)', timeOfDayMap.get('Evening (6PM-12AM)')! + t.total);
        } else {
          timeOfDayMap.set('Night (12AM-6AM)', timeOfDayMap.get('Night (12AM-6AM)')! + t.total);
        }
      }
    });

    // Hourly performance (last 24 hours)
    const hourlyPerformance = Array.from({ length: 24 }, (_, hour) => {
      const hourTransactions = transactions.filter(t => {
        if (!t.createdAt) return false;
        const transactionHour = new Date(t.createdAt).getHours();
        return transactionHour === hour;
      });
      return hourTransactions.reduce((sum, t) => sum + t.total, 0);
    });

    return {
      salesTrend: {
        labels: labels,
        data: salesData
      },
      topProducts: {
        labels: topProductsArray.length > 0 ? topProductsArray.map(([name]) => name) : ['No Sales'],
        data: topProductsArray.length > 0 ? topProductsArray.map(([, quantity]) => quantity) : [0]
      },
      salesByTimeOfDay: {
        labels: Array.from(timeOfDayMap.keys()),
        data: Array.from(timeOfDayMap.values())
      },
      hourlyPerformance: {
        labels: Array.from({ length: 24 }, (_, i) => 
          i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
        ),
        data: hourlyPerformance
      }
    };
  };

  const getDefaultAnalyticsData = (): CashierAnalyticsData => {
    return {
      salesTrend: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [0, 0, 0, 0, 0, 0, 0]
      },
      topProducts: {
        labels: ['No Sales Yet'],
        data: [0]
      },
      salesByTimeOfDay: {
        labels: ['Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-12AM)', 'Night (12AM-6AM)'],
        data: [0, 0, 0, 0]
      },
      hourlyPerformance: {
        labels: Array.from({ length: 24 }, (_, i) => 
          i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
        ),
        data: Array(24).fill(0)
      }
    };
  };

  const getDefaultAnalyticsStats = (): CashierAnalyticsStats => {
    return {
      totalRevenue: 0,
      totalTransactions: 0,
      averageTransaction: 0,
      todaysSales: 0,
      todaysTransactions: 0,
      bestHour: '12:00 PM'
    };
  };

  // Chart configurations
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#000000'
        }
      },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#ffffff',
        bodyColor: '#ffffff'
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#000000'
        },
        grid: {
          color: '#e0e0e0'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#000000',
          callback: function(value: any) {
            return '₱' + value.toLocaleString();
          }
        },
        grid: {
          color: '#e0e0e0'
        }
      }
    }
  };

  const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#000000',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#ffffff',
        bodyColor: '#ffffff'
      }
    }
  };

  if (loading) {
    return (
      <div className="cashier-dashboard-analytics">
        <div className="analytics-header">
          <h2><i className="bi-graph-up"></i> My Performance Dashboard</h2>
          <p>Loading your analytics data...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!analyticsData || !analyticsStats) {
    return (
      <div className="cashier-dashboard-analytics">
        <div className="analytics-header">
          <h2><i className="bi-graph-up"></i> My Performance Dashboard</h2>
          <p>Unable to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cashier-dashboard-analytics">
      {/* Header */}
      <div className="analytics-header">
        <h2><i className="bi-person-badge"></i> My Performance Dashboard</h2>
        <p>Welcome back, {user?.firstName || user?.username}! Here's your performance overview.</p>
      </div>

      {/* Performance Stats */}
      <div className="cashier-stats">
        <div className="stat-box">
          <div className="stat-icon">
            <i className="bi-currency-dollar"></i>
          </div>
          <div className="stat-content">
            <h3>₱{analyticsStats.totalRevenue.toLocaleString()}</h3>
            <p>Total Sales</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">
            <i className="bi-receipt"></i>
          </div>
          <div className="stat-content">
            <h3>{analyticsStats.totalTransactions}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">
            <i className="bi-calculator"></i>
          </div>
          <div className="stat-content">
            <h3>₱{analyticsStats.averageTransaction.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</h3>
            <p>Average Transaction</p>
          </div>
        </div>
        {/* <div className="stat-box">
          <div className="stat-icon">
            <i className="bi-calendar-day"></i>
          </div>
          <div className="stat-content">
            <h3>₱{analyticsStats.todaysSales.toLocaleString()}</h3>
            <p>Today's Sales</p>
          </div>
        </div> */}
        <div className="stat-box">
          <div className="stat-icon">
            <i className="bi-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{analyticsStats.bestHour}</h3>
            <p>Best Hour</p>
          </div>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="time-period-selector">
        <h3><i className="bi-clock"></i> Time Period</h3>
        <div className="period-buttons">
          <button 
            className={`period-btn ${timePeriod === 'daily' ? 'active' : ''}`}
            onClick={() => setTimePeriod('daily')}
          >
            Daily
          </button>
          <button 
            className={`period-btn ${timePeriod === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimePeriod('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`period-btn ${timePeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimePeriod('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="chart-navigation">
        <button 
          className={`nav-btn ${activeChart === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveChart('performance')}
        >
          <i className="bi-graph-up"></i> Performance
        </button>
        <button 
          className={`nav-btn ${activeChart === 'products' ? 'active' : ''}`}
          onClick={() => setActiveChart('products')}
        >
          <i className="bi-box"></i> Products
        </button>
        <button 
          className={`nav-btn ${activeChart === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveChart('trends')}
        >
          <i className="bi-clock-history"></i> Trends
        </button>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {activeChart === 'performance' && (
          <>
            {/* Sales Trend */}
            <div className="chart-container">
              <div className="chart-header">
                <h3><i className="bi-graph-up"></i> My Sales Trend</h3>
                <span className="chart-type">Line Chart</span>
              </div>
              <div className="chart-wrapper">
                <Line
                  data={{
                    labels: analyticsData.salesTrend.labels,
                    datasets: [
                      {
                        label: 'Sales (₱)',
                        data: analyticsData.salesTrend.data,
                        borderColor: '#000000',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.1
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>

            {/* Sales by Time of Day */}
            <div className="chart-container">
              <div className="chart-header">
                <h3><i className="bi-clock"></i> Sales by Time of Day</h3>
                <span className="chart-type">Donut Chart</span>
              </div>
              <div className="chart-wrapper">
                <Doughnut
                  data={{
                    labels: analyticsData.salesByTimeOfDay.labels,
                    datasets: [
                      {
                        data: analyticsData.salesByTimeOfDay.data,
                        backgroundColor: ['#000000', '#333333', '#666666', '#999999'],
                        borderColor: '#ffffff',
                        borderWidth: 2,
                        hoverBackgroundColor: ['#222222', '#555555', '#777777', '#aaaaaa']
                      }
                    ]
                  }}
                  options={{
                    ...doughnutOptions,
                    plugins: {
                      ...doughnutOptions.plugins,
                      tooltip: {
                        backgroundColor: '#000000',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                          label: function(context: any) {
                            const label = context.label || '';
                            const value = context.parsed;
                            return `${label}: ₱${value.toLocaleString()}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}

        {activeChart === 'products' && (
          <div className="chart-container">
            <div className="chart-header">
              <h3><i className="bi-trophy"></i> My Top Products</h3>
              <span className="chart-type">Bar Chart</span>
            </div>
            <div className="chart-wrapper">
              <Bar
                data={{
                  labels: analyticsData.topProducts.labels,
                  datasets: [
                    {
                      label: 'Units Sold',
                      data: analyticsData.topProducts.data,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      borderColor: '#000000',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      ticks: {
                        color: '#000000',
                        callback: function(value: any) {
                          return value + ' units';
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {activeChart === 'trends' && (
          <div className="chart-container">
            <div className="chart-header">
              <h3><i className="bi-clock-history"></i> Hourly Performance</h3>
              <span className="chart-type">Bar Chart</span>
            </div>
            <div className="chart-wrapper">
              <Bar
                data={{
                  labels: analyticsData.hourlyPerformance.labels,
                  datasets: [
                    {
                      label: 'Sales (₱)',
                      data: analyticsData.hourlyPerformance.data,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      borderColor: '#000000',
                      borderWidth: 1
                    }
                  ]
                }}
                options={chartOptions}
              />
            </div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="refresh-section">
        <button className="refresh-btn" onClick={fetchCashierAnalyticsData}>
          <i className="bi-arrow-clockwise"></i> Refresh My Data
        </button>
      </div>
    </div>
  );
};

export default CashierDashboardAnalytics;

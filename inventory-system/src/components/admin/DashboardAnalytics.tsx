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
import { useProducts } from '../../hooks/useProducts';
import './css/DashboardAnalytics.css';

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
}

interface AnalyticsData {
  salesTrend: {
    labels: string[];
    data: number[];
  };
  topProducts: {
    labels: string[];
    data: number[];
  };
  salesByCategory: {
    labels: string[];
    data: number[];
  };
  salesGrowthRate: {
    labels: string[];
    data: number[];
  };
  inventoryLevels: {
    labels: string[];
    data: number[];
  };
}

interface AnalyticsStats {
  totalRevenue: number;
  totalTransactions: number;
  totalProducts: number;
  lowStockItems: number;
}

type TimePeriod = 'hourly' | 'daily' | 'weekly' | 'monthly';


// Fetch transactions from the same API as SalesSummaryReport
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
      lineItems: dbTransaction.items?.map((item: any) => ({
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.unitPrice
      })) || [],
      createdAt: dbTransaction.createdAt
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

const DashboardAnalytics: React.FC = () => {
  const { data: products = [] } = useProducts();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'sales' | 'products' | 'inventory'>('sales');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');

  useEffect(() => {
    fetchAnalyticsData();
  }, [products, timePeriod]); // Refetch when products or time period change

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch transactions using the same method as SalesSummaryReport
      const transactions = await fetchTransactions();
      
      // Filter only completed transactions
      const completedTransactions = transactions.filter(t => t.status === 'Completed');
      
      // Process data using real system data
      const processedData = processRealAnalyticsData(completedTransactions, products, timePeriod);
      const processedStats = calculateAnalyticsStats(completedTransactions, products);
      
      setAnalyticsData(processedData);
      setAnalyticsStats(processedStats);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set default values if API fails
      setAnalyticsData(getDefaultAnalyticsData());
      setAnalyticsStats(getDefaultAnalyticsStats());
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalyticsStats = (transactions: Transaction[], products: any[]): AnalyticsStats => {
    // Calculate total revenue from completed transactions
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    
    // Count total transactions
    const totalTransactions = transactions.length;
    
    // Count total products
    const totalProducts = products.length;
    
    // Count low stock items
    const lowStockItems = products.filter(p => p.stockQuantity <= p.minStockLevel).length;
    
    return {
      totalRevenue,
      totalTransactions,
      totalProducts,
      lowStockItems
    };
  };

  const calculateGrowthRate = (transactions: Transaction[], period: TimePeriod) => {
    const now = new Date();
    const growthPeriods = period === 'daily' ? 7 : period === 'weekly' ? 8 : period === 'monthly' ? 12 : 24;
    const growthLabels: string[] = [];
    const growthData: number[] = [];
    const periodSalesData: number[] = [];
    
    // Calculate sales for each period
    for (let i = 0; i < growthPeriods; i++) {
      let periodStart: Date, periodEnd: Date, label: string;
      
      if (period === 'hourly') {
        periodStart = new Date(now);
        periodStart.setHours(now.getHours() - (growthPeriods - 1 - i), 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setHours(periodStart.getHours() + 1);
        label = periodStart.getHours().toString().padStart(2, '0') + ':00';
      } else if (period === 'daily') {
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - (growthPeriods - 1 - i));
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + 1);
        label = periodStart.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (period === 'weekly') {
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - (7 * (growthPeriods - 1 - i)));
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + 7);
        label = `Week ${i + 1}`;
      } else { // monthly
        periodStart = new Date(now);
        periodStart.setMonth(now.getMonth() - (growthPeriods - 1 - i));
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodStart.getMonth() + 1);
        label = periodStart.toLocaleDateString('en-US', { month: 'short' });
      }
      
      const periodTransactions = transactions.filter(t => {
        if (!t.createdAt) return false;
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= periodStart && transactionDate < periodEnd;
      });
      
      const periodSales = periodTransactions.reduce((sum, t) => sum + t.total, 0);
      periodSalesData.push(periodSales);
      growthLabels.push(label);
      
      // Calculate growth rate (percentage change from previous period)
      if (i === 0) {
        growthData.push(0); // First period has no previous period to compare
      } else {
        const previousPeriodSales = periodSalesData[i - 1];
        const growthRate = previousPeriodSales > 0 ? 
          ((periodSales - previousPeriodSales) / previousPeriodSales) * 100 : 0;
        growthData.push(growthRate);
      }
    }
    
    return { growthLabels, growthData };
  };

  const generateTimeSeriesData = (transactions: Transaction[], period: TimePeriod) => {
    const now = new Date();
    let labels: string[] = [];
    let salesData: number[] = [];

    switch (period) {
      case 'hourly':
        // Last 24 hours
        labels = Array.from({ length: 24 }, (_, i) => {
          const hour = new Date(now);
          hour.setHours(now.getHours() - (23 - i), 0, 0, 0); // Reset minutes, seconds, milliseconds
          return hour.getHours().toString().padStart(2, '0') + ':00';
        });
        salesData = labels.map((_, i) => {
          const hour = new Date(now);
          hour.setHours(now.getHours() - (23 - i), 0, 0, 0);
          const nextHour = new Date(hour);
          nextHour.setHours(hour.getHours() + 1);
          
          const hourTransactions = transactions.filter(t => {
            if (!t.createdAt) return false;
            const transactionTime = new Date(t.createdAt);
            return transactionTime >= hour && transactionTime < nextHour;
          });
          const total = hourTransactions.reduce((sum, t) => sum + t.total, 0);
          return total; // Return actual total (including 0 for no transactions)
        });
        break;

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
          const total = dayTransactions.reduce((sum, t) => sum + t.total, 0);
          return total; // Return actual total (including 0 for no transactions)
        });
        break;

      case 'weekly':
        // Last 8 weeks
        labels = Array.from({ length: 8 }, (_, i) => {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (7 * (7 - i)));
          return `Week ${8 - i}`;
        });
        salesData = Array.from({ length: 8 }, (_, i) => {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (7 * (7 - i)));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          const weekTransactions = transactions.filter(t => {
            if (!t.createdAt) return false;
            const transactionDate = new Date(t.createdAt);
            return transactionDate >= weekStart && transactionDate <= weekEnd;
          });
          const total = weekTransactions.reduce((sum, t) => sum + t.total, 0);
          return total; // Return actual total (including 0 for no transactions)
        });
        break;

      case 'monthly':
        // Last 12 months
        labels = Array.from({ length: 12 }, (_, i) => {
          const month = new Date(now);
          month.setMonth(now.getMonth() - (11 - i));
          return month.toLocaleDateString('en-US', { month: 'short' });
        });
        salesData = Array.from({ length: 12 }, (_, i) => {
          const month = new Date(now);
          month.setMonth(now.getMonth() - (11 - i));
          const monthStr = month.toISOString().slice(0, 7); // YYYY-MM
          const monthTransactions = transactions.filter(t => 
            t.createdAt && t.createdAt.startsWith(monthStr)
          );
          const total = monthTransactions.reduce((sum, t) => sum + t.total, 0);
          return total; // Return actual total (including 0 for no transactions)
        });
        break;
    }

    // Remove leading zeros but keep the rest of the timeline
    let startIndex = 0;
    for (let i = 0; i < salesData.length; i++) {
      if (salesData[i] > 0) {
        startIndex = i;
        break;
      }
    }

    return { 
      labels: labels.slice(startIndex), 
      salesData: salesData.slice(startIndex) 
    };
  };

  const processRealAnalyticsData = (transactions: Transaction[], products: any[], period: TimePeriod): AnalyticsData => {
    // Process sales trend based on selected time period
    const { labels, salesData } = generateTimeSeriesData(transactions, period);

    // Process top products from lineItems
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

    // Calculate sales growth rate data (will be processed in generateTimeSeriesData)
    const { growthLabels, growthData } = calculateGrowthRate(transactions, period);

    // Process inventory levels
    const lowStockProducts = products
      .filter(p => p.stockQuantity <= p.minStockLevel)
      .slice(0, 5);

    return {
      salesTrend: {
        labels: labels,
        data: salesData
      },
      topProducts: {
        labels: topProductsArray.map(([name]) => name),
        data: topProductsArray.map(([, quantity]) => quantity)
      },
      salesByCategory: {
        labels: topProductsArray.length > 0 ? topProductsArray.map(([name]) => name) : ['No Data'],
        data: topProductsArray.length > 0 ? topProductsArray.map(([, quantity]) => quantity) : [0]
      },
      salesGrowthRate: {
        labels: growthLabels,
        data: growthData
      },
      inventoryLevels: {
        labels: lowStockProducts.map(p => p.name),
        data: lowStockProducts.map(p => p.stockQuantity)
      }
    };
  };

  const getDefaultAnalyticsData = (): AnalyticsData => {
    return {
      salesTrend: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [0, 0, 0, 0, 0, 0, 0]
      },
      topProducts: {
        labels: ['No Data'],
        data: [0]
      },
      salesByCategory: {
        labels: ['No Data'],
        data: [0]
      },
      salesGrowthRate: {
        labels: ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7'],
        data: [0, 0, 0, 0, 0, 0, 0]
      },
      inventoryLevels: {
        labels: ['No Data'],
        data: [0]
      }
    };
  };

  const getDefaultAnalyticsStats = (): AnalyticsStats => {
    return {
      totalRevenue: 0,
      totalTransactions: 0,
      totalProducts: 0,
      lowStockItems: 0
    };
  };

  // Chart configurations with black and white theme
  const lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
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
        type: 'linear',
        beginAtZero: true, // Start from zero to show full scale
        ticks: {
          stepSize: 1000, // Increment by ₱1,000
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

  const barChartOptions: any = {
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
        beginAtZero: true, // Bar charts should start at zero
        ticks: {
          color: '#000000'
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
      <div className="dashboard-analytics">
        <div className="analytics-header">
          <h2><i className="bi-graph-up"></i> Dashboard Analytics</h2>
          <p>Loading analytics data...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="dashboard-analytics">
        <div className="analytics-header">
          <h2><i className="bi-graph-up"></i> Dashboard Analytics</h2>
          <p>Unable to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-analytics">

      {/* Analytics Stats Boxes */}
      {analyticsStats && (
        <div className="analytics-stats">
          <div className="stat-box">
            <div className="stat-icon">
              <i className="bi-currency-dollar"></i>
            </div>
            <div className="stat-content">
              <h3>₱{analyticsStats.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">
              <i className="bi-receipt"></i>
            </div>
            <div className="stat-content">
              <h3>{analyticsStats.totalTransactions.toLocaleString()}</h3>
              <p>Total Transactions</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">
              <i className="bi-box"></i>
            </div>
            <div className="stat-content">
              <h3>{analyticsStats.totalProducts.toLocaleString()}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">
              <i className="bi-exclamation-triangle"></i>
            </div>
            <div className="stat-content">
              <h3>{analyticsStats.lowStockItems.toLocaleString()}</h3>
              <p>Low Stock Items</p>
            </div>
          </div>
        </div>
      )}

      {/* Time Period Selector */}
      <div className="time-period-selector">
        <h3><i className="bi-clock"></i> Time Period</h3>
        <div className="period-buttons">
          <button 
            className={`period-btn ${timePeriod === 'hourly' ? 'active' : ''}`}
            onClick={() => setTimePeriod('hourly')}
          >
            Hourly
          </button>
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
          className={`nav-btn ${activeChart === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveChart('sales')}
        >
          <i className="bi-graph-up"></i> Sales Analytics
        </button>
        <button 
          className={`nav-btn ${activeChart === 'products' ? 'active' : ''}`}
          onClick={() => setActiveChart('products')}
        >
          <i className="bi-box"></i> Product Analytics
        </button>
        <button 
          className={`nav-btn ${activeChart === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveChart('inventory')}
        >
          <i className="bi-boxes"></i> Inventory Analytics
        </button>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {activeChart === 'sales' && (
          <>
            {/* Sales Trend Line Chart */}
            <div className="chart-container">
              <div className="chart-header">
                <h3><i className="bi-graph-up"></i> Sales Trend ({timePeriod === 'hourly' ? '24 Hours' : timePeriod === 'daily' ? '7 Days' : timePeriod === 'weekly' ? '8 Weeks' : '12 Months'})</h3>
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
                        tension: 0, // Make lines pointy (not smooth)
                        pointRadius: 0, // Hide points by default
                        pointHoverRadius: 8, // Show larger points on hover
                        pointBackgroundColor: 'transparent', // Transparent by default
                        pointBorderColor: 'transparent', // Transparent by default
                        pointBorderWidth: 0, // No border by default
                        pointHoverBackgroundColor: '#000000', // Black on hover
                        pointHoverBorderColor: '#ffffff', // White border on hover
                        pointHoverBorderWidth: 3 // Thicker border on hover
                      }
                    ]
                  }}
                  options={lineChartOptions}
                />
              </div>
            </div>

            {/* Sales Growth Rate Line Chart */}
            <div className="chart-container">
              <div className="chart-header">
                <h3><i className="bi-graph-up-arrow"></i> Sales Growth Rate Over Time</h3>
                <span className="chart-type">Line Chart</span>
              </div>
              <div className="chart-wrapper">
                <Line
                  data={{
                    labels: analyticsData.salesGrowthRate.labels,
                    datasets: [
                      {
                        label: 'Growth Rate (%)',
                        data: analyticsData.salesGrowthRate.data,
                        borderColor: '#000000',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0,
                        pointRadius: 0,
                        pointHoverRadius: 8,
                        pointBackgroundColor: 'transparent',
                        pointBorderColor: 'transparent',
                        pointBorderWidth: 0,
                        pointHoverBackgroundColor: '#000000',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 3
                      }
                    ]
                  }}
                  options={{
                    ...lineChartOptions,
                    scales: {
                      ...lineChartOptions.scales,
                      y: {
                        type: 'linear',
                        beginAtZero: true, // Include zero in the scale
                        ticks: {
                          color: '#000000',
                          callback: function(value: any) {
                            return value + '%';
                          }
                        },
                        grid: {
                          color: '#e0e0e0'
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
          <>
            {/* Top Products Bar Chart */}
            <div className="chart-container">
              <div className="chart-header">
                <h3><i className="bi-trophy"></i> Top Products</h3>
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
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(0, 0, 0, 0.9)'
                      }
                    ]
                  }}
                  options={barChartOptions}
                />
              </div>
            </div>

            {/* Sales by Category Donut Chart */}
            <div className="chart-container">
              <div className="chart-header">
                <h3><i className="bi-tags"></i> Sales by Category</h3>
                <span className="chart-type">Donut Chart</span>
              </div>
              <div className="chart-wrapper">
                <Doughnut
                  data={{
                    labels: analyticsData.salesByCategory.labels,
                    datasets: [
                      {
                        data: analyticsData.salesByCategory.data,
                        backgroundColor: [
                          '#000000', '#333333', '#666666', '#999999', '#cccccc'
                        ],
                        borderColor: '#ffffff',
                        borderWidth: 2,
                        hoverBackgroundColor: [
                          '#222222', '#555555', '#777777', '#aaaaaa', '#dddddd'
                        ]
                      }
                    ]
                  }}
                  options={doughnutOptions}
                />
              </div>
            </div>
          </>
        )}

        {activeChart === 'inventory' && (
          <>
            {/* Inventory Levels Bar Chart */}
            <div className="chart-container">
              <div className="chart-header">
                <h3><i className="bi-boxes"></i> Low Stock Items</h3>
                <span className="chart-type">Bar Chart</span>
              </div>
              <div className="chart-wrapper">
                <Bar
                  data={{
                    labels: analyticsData.inventoryLevels.labels,
                    datasets: [
                      {
                        label: 'Stock Quantity',
                        data: analyticsData.inventoryLevels.data,
                        backgroundColor: analyticsData.inventoryLevels.data.map(value => 
                          value <= 10 ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.6)'
                        ),
                        borderColor: '#000000',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={barChartOptions}
                />
              </div>
            </div>

            {/* Stock Status Donut Chart */}
            <div className="chart-container">
              <div className="chart-header">
                <h3><i className="bi-pie-chart"></i> Stock Status Overview</h3>
                <span className="chart-type">Donut Chart</span>
              </div>
              <div className="chart-wrapper">
                <Doughnut
                  data={{
                    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
                    datasets: [
                      {
                        data: [
                          products.filter(p => p.stockQuantity > p.minStockLevel).length,
                          products.filter(p => p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0).length,
                          products.filter(p => p.stockQuantity === 0).length
                        ],
                        backgroundColor: ['#000000', '#666666', '#cccccc'],
                        borderColor: '#ffffff',
                        borderWidth: 2,
                        hoverBackgroundColor: ['#333333', '#888888', '#dddddd']
                      }
                    ]
                  }}
                  options={doughnutOptions}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Refresh Button */}
      <div className="refresh-section">
        <button className="refresh-btn" onClick={fetchAnalyticsData}>
          <i className="bi-arrow-clockwise"></i> Refresh Data
        </button>
      </div>
    </div>
  );
};

export default DashboardAnalytics;

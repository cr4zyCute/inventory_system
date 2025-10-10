import React, { useState, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useUsers } from '../../hooks/useUsers';
import './css/report.css';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

// Fetch transactions from API
const fetchTransactions = async () => {
  try {
    const response = await fetch('/api/transactions');
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    const result = await response.json();
    return result.data || result || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const SalesSummaryReportPlaceholder: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const transactionData = await fetchTransactions();
      setTransactions(transactionData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="report-content">
        <div className="loading-state">
          <i className="bi-arrow-clockwise loading-spin"></i>
          <p>Loading sales data...</p>
        </div>
      </div>
    );
  }

  // Calculate real metrics
  const totalSales = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalTransactions = transactions.length;
  const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Calculate today's sales
  const today = new Date().toLocaleDateString();
  const todaysSales = transactions
    .filter(t => new Date(t.createdAt).toLocaleDateString() === today)
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  // Calculate top products from real transaction data
  const productMap = new Map<string, { sales: number; units: number }>();
  
  transactions.forEach(transaction => {
    transaction.items?.forEach((item: any) => {
      const productName = item.product?.name || 'Unknown Product';
      const existing = productMap.get(productName) || { sales: 0, units: 0 };
      productMap.set(productName, {
        sales: existing.sales + (item.unitPrice * item.quantity),
        units: existing.units + item.quantity
      });
    });
  });
  
  const topProducts = Array.from(productMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // Calculate daily sales for last 7 days
  const dailySales = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString();
    const dayName = days[date.getDay()];
    
    const daySales = transactions
      .filter(t => new Date(t.createdAt).toLocaleDateString() === dateStr)
      .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    
    dailySales.push({ day: dayName, sales: daySales });
  }

  const maxDailySales = Math.max(...dailySales.map(d => d.sales));

  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-currency-dollar"></i></div>
          <div className="metric-info">
            <h3>{formatCurrency(totalSales)}</h3>
            <p>Total Sales</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-receipt"></i></div>
          <div className="metric-info">
            <h3>{totalTransactions.toLocaleString()}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-cash-coin"></i></div>
          <div className="metric-info">
            <h3>{formatCurrency(avgTransaction)}</h3>
            <p>Average Transaction</p>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Top Performing Products</h4>
          <div className="product-performance">
            {topProducts.length > 0 ? topProducts.map(product => (
              <div key={product.name} className="product-item">
                <div>
                  <h5>{product.name}</h5>
                  <span>{product.units} units sold</span>
                </div>
                <strong>{formatCurrency(product.sales)}</strong>
              </div>
            )) : (
              <p>No product data available</p>
            )}
          </div>
        </div>

        <div className="report-section">
          <h4>Daily Sales Trend (Last 7 Days)</h4>
          <div className="placeholder-chart">
            <div className="chart-bars">
              {dailySales.map((day, index) => (
                <div 
                  key={index} 
                  className="bar" 
                  style={{ 
                    height: `${maxDailySales > 0 ? (day.sales / maxDailySales) * 100 : 0}%` 
                  }}
                  title={`${day.day}: ${formatCurrency(day.sales)}`}
                ></div>
              ))}
            </div>
            <div className="chart-labels">
              {dailySales.map(day => (
                <span key={day.day}>{day.day}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InventoryOverviewReportPlaceholder: React.FC = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();

  if (productsLoading) {
    return (
      <div className="report-content">
        <div className="loading-state">
          <i className="bi-arrow-clockwise loading-spin"></i>
          <p>Loading inventory data...</p>
        </div>
      </div>
    );
  }

  // Calculate real inventory metrics
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.minStockLevel);
  const outOfStockProducts = products.filter(p => p.stockQuantity === 0);
  const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);

  // Get category breakdown (simplified since we don't have category data loaded)
  const categoryBreakdown = [
    { label: 'General Products', value: `${activeProducts}`, percentage: '100%' }
  ];

  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-boxes"></i></div>
          <div className="metric-info">
            <h3>{activeProducts}</h3>
            <p>Active Products</p>
          </div>
        </div>
        <div className={`metric-card ${lowStockProducts.length > 0 ? 'warning' : ''}`}>
          <div className="metric-icon"><i className="bi-exclamation-triangle"></i></div>
          <div className="metric-info">
            <h3>{lowStockProducts.length}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className={`metric-card ${outOfStockProducts.length > 0 ? 'danger' : ''}`}>
          <div className="metric-icon"><i className="bi-x-circle"></i></div>
          <div className="metric-info">
            <h3>{outOfStockProducts.length}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-graph-up"></i></div>
          <div className="metric-info">
            <h3>{formatCurrency(inventoryValue)}</h3>
            <p>Inventory Value</p>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Low Stock Alert</h4>
          <div className="alert-list">
            {lowStockProducts.length > 0 ? lowStockProducts.slice(0, 10).map(product => (
              <div key={product.id} className="alert-item">
                <span className="product-name">{product.name}</span>
                <span className="stock-info">Current: {product.stockQuantity} | Min: {product.minStockLevel}</span>
                <span className="category">SKU: {product.barcode}</span>
              </div>
            )) : (
              <p>No low stock items - all products are well stocked!</p>
            )}
          </div>
        </div>

        <div className="report-section">
          <h4>Inventory Summary</h4>
          <div className="inventory-summary">
            <div className="summary-item">
              <span className="summary-label">Total Products:</span>
              <span className="summary-value">{products.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Active Products:</span>
              <span className="summary-value">{activeProducts}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Inactive Products:</span>
              <span className="summary-value">{products.length - activeProducts}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Product Value:</span>
              <span className="summary-value">{formatCurrency(activeProducts > 0 ? inventoryValue / activeProducts : 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserActivityReportPlaceholder: React.FC = () => {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const transactionData = await fetchTransactions();
      setTransactions(transactionData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading || usersLoading) {
    return (
      <div className="report-content">
        <div className="loading-state">
          <i className="bi-arrow-clockwise loading-spin"></i>
          <p>Loading user activity data...</p>
        </div>
      </div>
    );
  }

  // Calculate real user metrics
  const activeStaff = users.filter(u => u.isActive).length;
  const totalUsers = users.length;
  
  // Calculate staff performance from transactions
  const staffPerformance = users.map(user => {
    const userTransactions = transactions.filter(t => 
      t.cashierName === `${user.firstName} ${user.lastName}` ||
      t.cashier?.firstName === user.firstName && t.cashier?.lastName === user.lastName
    );
    
    const sales = userTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    
    return {
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      sales,
      transactions: userTransactions.length,
      lastLogin: user.lastLogin
    };
  }).filter(staff => staff.transactions > 0)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // Role distribution
  const roleDistribution = users.reduce((acc: any, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-people"></i></div>
          <div className="metric-info">
            <h3>{activeStaff}</h3>
            <p>Active Staff Members</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-person-check"></i></div>
          <div className="metric-info">
            <h3>{totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-receipt"></i></div>
          <div className="metric-info">
            <h3>{transactions.length}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Top Performing Staff</h4>
          {staffPerformance.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Role</th>
                  <th>Sales</th>
                  <th>Transactions</th>
                </tr>
              </thead>
              <tbody>
                {staffPerformance.map(person => (
                  <tr key={person.name}>
                    <td>{person.name}</td>
                    <td>{person.role}</td>
                    <td>{formatCurrency(person.sales)}</td>
                    <td>{person.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No transaction data available for staff performance analysis</p>
          )}
        </div>

        <div className="report-section">
          <h4>User Role Distribution</h4>
          <div className="role-distribution">
            {Object.entries(roleDistribution).map(([role, count]) => (
              <div key={role} className="role-item">
                <span className="role-name">{role}</span>
                <span className="role-count">{count as number} users</span>
                <span className="role-percentage">
                  {totalUsers > 0 ? Math.round(((count as number) / totalUsers) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FinancialReportPlaceholder: React.FC = () => {
  const expenseBreakdown = [
    { category: 'Payroll', amount: 198450 },
    { category: 'Inventory Purchases', amount: 134200 },
    { category: 'Utilities', amount: 45220 },
    { category: 'Marketing', amount: 32850 }
  ];

  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-piggy-bank"></i></div>
          <div className="metric-info">
            <h3>{formatCurrency(528450)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-wallet2"></i></div>
          <div className="metric-info">
            <h3>{formatCurrency(411720)}</h3>
            <p>Total Expenses</p>
          </div>
        </div>
        <div className="metric-card success">
          <div className="metric-icon"><i className="bi-graph-up-arrow"></i></div>
          <div className="metric-info">
            <h3>{formatCurrency(116730)}</h3>
            <p>Net Income</p>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Expense Breakdown</h4>
          <table className="report-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {expenseBreakdown.map(item => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{Math.round((item.amount / 411720) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h4>Monthly Cash Flow</h4>
          <div className="placeholder-chart">
            <div className="chart-bars dual">
              {[65, 72, 58, 78, 85, 69].map((value, index) => (
                <div key={index} className="bar-group">
                  <div className="bar income" style={{ height: `${value}%` }}></div>
                  <div className="bar expense" style={{ height: `${Math.max(20, value - 15)}%` }}></div>
                </div>
              ))}
            </div>
            <div className="chart-labels">
              {['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map(month => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductPerformanceReportPlaceholder: React.FC = () => {
  const productMetrics = [
    { name: 'Signature Latte', conversion: '42%', returning: '68%', satisfaction: '4.9/5' },
    { name: 'Cold Brew Concentrate', conversion: '35%', returning: '54%', satisfaction: '4.7/5' },
    { name: 'Hazelnut Syrup', conversion: '28%', returning: '46%', satisfaction: '4.6/5' }
  ];

  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-basket"></i></div>
          <div className="metric-info">
            <h3>92%</h3>
            <p>Best Seller Availability</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-lightning"></i></div>
          <div className="metric-info">
            <h3>4.6</h3>
            <p>Average Product Rating</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-repeat"></i></div>
          <div className="metric-info">
            <h3>61%</h3>
            <p>Repeat Purchase Rate</p>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Performance by Product</h4>
          <table className="report-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Conversion</th>
                <th>Returning Customers</th>
                <th>Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {productMetrics.map(product => (
                <tr key={product.name}>
                  <td>{product.name}</td>
                  <td>{product.conversion}</td>
                  <td>{product.returning}</td>
                  <td>{product.satisfaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h4>Product Journey</h4>
          <div className="journey-steps">
            {[
              { label: 'Discovery', value: '18k impressions' },
              { label: 'Interest', value: '9.2k product views' },
              { label: 'Purchase', value: '3.1k checkouts' },
              { label: 'Loyalty', value: '1.8k repeat buyers' }
            ].map(step => (
              <div key={step.label} className="journey-step">
                <span className="step-label">{step.label}</span>
                <span className="step-value">{step.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const OverviewDashboard: React.FC = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      const transactionData = await fetchTransactions();
      setTransactions(transactionData);
      setIsLoading(false);
    };
    loadTransactions();
  }, []);

  // Calculate real metrics
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockItems = products.filter(p => p.stockQuantity <= p.minStockLevel).length;
  const activeStaff = users.filter(u => u.isActive).length;

  // Calculate 30-day revenue
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDayRevenue = transactions
    .filter(t => new Date(t.createdAt) >= thirtyDaysAgo)
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  if (isLoading || productsLoading || usersLoading) {
    return (
      <div className="report-content">
        <div className="loading-state">
          <i className="bi-arrow-clockwise loading-spin"></i>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-content">
      <div className="overview-header" style={{ 
        textAlign: 'center', 
        marginBottom: '32px',
        padding: '24px',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #000000'
      }}>
        <h2 style={{ 
          color: '#000000', 
          margin: '0 0 8px 0',
          textShadow: '0 2px 8px rgba(255, 255, 255, 0.8)'
        }}>Reports Overview</h2>
        
      </div>

      {/* Quick Stats Grid */}
      <div className="report-metrics" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-currency-dollar"></i></div>
          <div className="metric-info">
            <h3>{formatCurrency(thirtyDayRevenue)}</h3>
            <p>Total Revenue (30d)</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-boxes"></i></div>
          <div className="metric-info">
            <h3>{activeProducts}</h3>
            <p>Active Products</p>
          </div>
        </div>
        <div className={`metric-card ${lowStockItems > 0 ? 'warning' : ''}`}>
          <div className="metric-icon"><i className="bi-exclamation-triangle"></i></div>
          <div className="metric-info">
            <h3>{lowStockItems}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-people"></i></div>
          <div className="metric-info">
            <h3>{activeStaff}</h3>
            <p>Active Staff</p>
          </div>
        </div>
      </div>


      {/* Analytics and Graphs - 2x2 Grid Layout */}
      <div className="report-sections" style={{ marginTop: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          
          {/* Sales Trend Chart */}
          <div className="report-section">
            <h4>Sales Trend (Last 7 Days)</h4>
            <div className="placeholder-chart">
              <div className="chart-bars">
                {(() => {
                  const dailySales = [];
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toLocaleDateString();
                    
                    const daySales = transactions
                      .filter(t => new Date(t.createdAt).toLocaleDateString() === dateStr)
                      .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
                    
                    dailySales.push(daySales);
                  }
                  
                  const maxSales = Math.max(...dailySales, 1);
                  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  
                  return dailySales.map((sales, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - index));
                    const dayName = days[date.getDay()];
                    
                    return (
                      <div 
                        key={index} 
                        className="bar" 
                        style={{ 
                          height: `${(sales / maxSales) * 100}%`,
                          minHeight: '4px'
                        }}
                        title={`${dayName}: ${formatCurrency(sales)}`}
                      ></div>
                    );
                  });
                })()}
              </div>
              <div className="chart-labels">
                {(() => {
                  const labels = [];
                  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    labels.push(days[date.getDay()]);
                  }
                  return labels.map((day, index) => (
                    <span key={index}>{day}</span>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Inventory Status Donut Chart */}
          <div className="report-section">
            <h4>Inventory Status Analysis</h4>
            <div className="donut-chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '20px' }}>
              <div className="donut-chart" style={{ 
                width: '160px', 
                height: '160px', 
                borderRadius: '50%', 
                background: `conic-gradient(
                  ${(() => {
                    const wellStocked = products.filter(p => p.isActive && p.stockQuantity > p.minStockLevel).length;
                    const lowStock = products.filter(p => p.isActive && p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0).length;
                    const outOfStock = products.filter(p => p.isActive && p.stockQuantity === 0).length;
                    const total = wellStocked + lowStock + outOfStock;
                    
                    if (total === 0) return '#e5e7eb 0deg 360deg';
                    
                    const wellStockedPercentage = (wellStocked / total) * 100;
                    const lowStockPercentage = (lowStock / total) * 100;
                    const outOfStockPercentage = (outOfStock / total) * 100;
                    
                    let currentAngle = 0;
                    const segments = [];
                    
                    if (wellStocked > 0) {
                      const angle = (wellStockedPercentage / 100) * 360;
                      segments.push(`#000000 ${currentAngle}deg ${currentAngle + angle}deg`);
                      currentAngle += angle;
                    }
                    
                    if (lowStock > 0) {
                      const angle = (lowStockPercentage / 100) * 360;
                      segments.push(`#fbbf24 ${currentAngle}deg ${currentAngle + angle}deg`);
                      currentAngle += angle;
                    }
                    
                    if (outOfStock > 0) {
                      const angle = (outOfStockPercentage / 100) * 360;
                      segments.push(`#ef4444 ${currentAngle}deg ${currentAngle + angle}deg`);
                      currentAngle += angle;
                    }
                    
                    return segments.join(', ');
                  })()}
                )`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ 
                  width: '90px', 
                  height: '90px', 
                  borderRadius: '50%', 
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#000000'
                }}>
                  <div>Total</div>
                  <div>{products.filter(p => p.isActive).length}</div>
                  <div style={{ fontSize: '0.65rem', color: '#666' }}>Products</div>
                </div>
              </div>
              
              <div className="donut-legend" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' }}>
                {(() => {
                  const wellStocked = products.filter(p => p.isActive && p.stockQuantity > p.minStockLevel).length;
                  const lowStock = products.filter(p => p.isActive && p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0).length;
                  const outOfStock = products.filter(p => p.isActive && p.stockQuantity === 0).length;
                  const total = wellStocked + lowStock + outOfStock;
                  
                  const categories = [
                    { label: 'Well Stocked', count: wellStocked, color: '#000000' },
                    { label: 'Low Stock', count: lowStock, color: '#fbbf24' },
                    { label: 'Out of Stock', count: outOfStock, color: '#ef4444' }
                  ];
                  
                  return categories.map(category => {
                    const percentage = total > 0 ? (category.count / total) * 100 : 0;
                    
                    return (
                      <div key={category.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          background: category.color 
                        }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#333' }}>
                          {category.label}: {category.count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
       

          {/* Business Insights */}
        
        </div>

   

      </div>
    </div>
  );
};

export const SystemAnalyticsReportPlaceholder: React.FC = () => {
  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-cpu"></i></div>
          <div className="metric-info">
            <h3>99.98%</h3>
            <p>System Uptime</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-shield-check"></i></div>
          <div className="metric-info">
            <h3>0</h3>
            <p>Security Incidents</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-gear"></i></div>
          <div className="metric-info">
            <h3>24</h3>
            <p>Automation Routines</p>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Request Volume</h4>
          <div className="placeholder-chart">
            <div className="chart-bars">
              {[30, 45, 50, 40, 60, 55, 48].map((value, index) => (
                <div key={index} className="bar" style={{ height: `${value}%` }}></div>
              ))}
            </div>
            <div className="chart-labels">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Recent System Events</h4>
          <div className="activity-list">
            {[
              { icon: 'bi-cloud-arrow-up', title: 'Deployment completed', time: '12 minutes ago', detail: 'Inventory sync service v2.3' },
              { icon: 'bi-bell', title: 'Alert resolved', time: '1 hour ago', detail: 'Payment gateway latency normalized' },
              { icon: 'bi-check-circle', title: 'Backup verified', time: '3 hours ago', detail: 'Daily backup integrity confirmed' }
            ].map(event => (
              <div key={event.title} className="activity-item">
                <div className="activity-icon"><i className={event.icon}></i></div>
                <div className="activity-content">
                  <p><strong>{event.title}</strong></p>
                  <span>{event.detail}</span>
                </div>
                <div className="activity-time">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

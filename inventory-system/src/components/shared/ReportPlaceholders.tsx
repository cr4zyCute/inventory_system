import React from 'react';
import './css/report.css';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

export const SalesSummaryReportPlaceholder: React.FC = () => {
  const topProducts = [
    { name: 'Premium Coffee Beans', sales: 154000, units: 320 },
    { name: 'Matcha Latte Mix', sales: 98000, units: 210 },
    { name: 'Chocolate Drizzle', sales: 74500, units: 158 }
  ];

  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-currency-dollar"></i></div>
          <div className="metric-info">
            <h3>{formatCurrency(528450)}</h3>
            <p>Total Sales (30 days)</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-receipt"></i></div>
          <div className="metric-info">
            <h3>1,420</h3>
            <p>Total Transactions</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-cash-coin"></i></div>
          <div className="metric-info">
            <h3>{formatCurrency(372)}</h3>
            <p>Average Basket Value</p>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Top Performing Products</h4>
          <div className="product-performance">
            {topProducts.map(product => (
              <div key={product.name} className="product-item">
                <div>
                  <h5>{product.name}</h5>
                  <span>{product.units} units sold</span>
                </div>
                <strong>{formatCurrency(product.sales)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h4>Daily Sales Trend</h4>
          <div className="placeholder-chart">
            <div className="chart-bars">
              {[50, 70, 45, 90, 65, 80, 55].map((value, index) => (
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
      </div>
    </div>
  );
};

export const InventoryOverviewReportPlaceholder: React.FC = () => {
  const lowStockProducts = [
    { name: 'Espresso Shots', current: 12, minimum: 20, category: 'Beverages' },
    { name: 'Cold Cups 16oz', current: 45, minimum: 80, category: 'Packaging' },
    { name: 'Brown Sugar', current: 18, minimum: 35, category: 'Ingredients' }
  ];

  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-boxes"></i></div>
          <div className="metric-info">
            <h3>248</h3>
            <p>Active Products</p>
          </div>
        </div>
        <div className="metric-card warning">
          <div className="metric-icon"><i className="bi-exclamation-triangle"></i></div>
          <div className="metric-info">
            <h3>14</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="metric-card danger">
          <div className="metric-icon"><i className="bi-x-circle"></i></div>
          <div className="metric-info">
            <h3>6</h3>
            <p>Out of Stock</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-graph-up"></i></div>
          <div className="metric-info">
            <h3>{formatCurrency(1897450)}</h3>
            <p>Inventory Value</p>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Low Stock Alert</h4>
          <div className="alert-list">
            {lowStockProducts.map(product => (
              <div key={product.name} className="alert-item">
                <span className="product-name">{product.name}</span>
                <span className="stock-info">Current: {product.current} | Min: {product.minimum}</span>
                <span className="category">{product.category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h4>Category Breakdown</h4>
          <div className="placeholder-chart donut">
            <div className="donut-center">
              <span className="donut-value">100%</span>
              <span className="donut-label">Stock</span>
            </div>
            <div className="chart-legend">
              {[
                { label: 'Beverages', value: '35%' },
                { label: 'Ingredients', value: '28%' },
                { label: 'Packaging', value: '22%' },
                { label: 'Others', value: '15%' }
              ].map(item => (
                <div key={item.label} className="legend-item">
                  <div className="legend-color"></div>
                  <span>{item.label} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserActivityReportPlaceholder: React.FC = () => {
  const staffPerformance = [
    { name: 'Ava Castillo', role: 'Cashier', sales: 68500, transactions: 182 },
    { name: 'Liam Santos', role: 'Cashier', sales: 61200, transactions: 165 },
    { name: 'Mika Reyes', role: 'Barista', sales: 54820, transactions: 143 }
  ];

  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-people"></i></div>
          <div className="metric-info">
            <h3>32</h3>
            <p>Active Staff Members</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-clock-history"></i></div>
          <div className="metric-info">
            <h3>94%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-star"></i></div>
          <div className="metric-info">
            <h3>4.7</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Top Performing Staff</h4>
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
        </div>

        <div className="report-section">
          <h4>Recent Staff Activity</h4>
          <div className="activity-list">
            {[
              { staff: 'Ava Castillo', action: 'Completed shift with 95% satisfaction', time: '10 minutes ago' },
              { staff: 'Liam Santos', action: 'Achieved daily upsell target', time: '1 hour ago' },
              { staff: 'Mika Reyes', action: 'Handled 40 transactions today', time: '3 hours ago' }
            ].map(item => (
              <div key={item.staff} className="activity-item">
                <div className="activity-icon"><i className="bi-person-check"></i></div>
                <div className="activity-content">
                  <p><strong>{item.staff}</strong></p>
                  <span>{item.action}</span>
                </div>
                <div className="activity-time">{item.time}</div>
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
        <p style={{ 
          color: '#333333', 
          margin: 0,
          textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)'
        }}>Quick summary of all available reports and key metrics</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="report-metrics" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-currency-dollar"></i></div>
          <div className="metric-info">
            <h3>{formatCurrency(528450)}</h3>
            <p>Total Revenue (30d)</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-boxes"></i></div>
          <div className="metric-info">
            <h3>248</h3>
            <p>Active Products</p>
          </div>
        </div>
        <div className="metric-card warning">
          <div className="metric-icon"><i className="bi-exclamation-triangle"></i></div>
          <div className="metric-info">
            <h3>14</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="bi-people"></i></div>
          <div className="metric-info">
            <h3>32</h3>
            <p>Active Staff</p>
          </div>
        </div>
      </div>

      {/* Available Reports Grid */}
      <div className="report-sections">
        <div className="report-section" style={{ gridColumn: '1 / -1' }}>
          <h4>Available Reports</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            
            {/* Sales Summary Card */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              border: '1px solid #000000',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#ffffff', 
                  border: '1px solid #000000',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#000000',
                  fontSize: '1.5rem'
                }}>
                  <i className="bi-graph-up"></i>
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#000000' }}>Sales Summary</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666666' }}>Revenue & transactions</p>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#333333', margin: '12px 0' }}>
                View total sales, transactions, and top-performing products over time.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#666666' }}>
                Last updated: Today
              </div>
            </div>

            {/* Inventory Overview Card */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              border: '1px solid #000000',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#ffffff', 
                  border: '1px solid #000000',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#000000',
                  fontSize: '1.5rem'
                }}>
                  <i className="bi-boxes"></i>
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#000000' }}>Inventory Overview</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666666' }}>Stock levels & alerts</p>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#333333', margin: '12px 0' }}>
                Monitor stock levels, low stock alerts, and inventory value.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#666666' }}>
                Last updated: Today
              </div>
            </div>

            {/* User Activity Card */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              border: '1px solid #000000',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#ffffff', 
                  border: '1px solid #000000',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#000000',
                  fontSize: '1.5rem'
                }}>
                  <i className="bi-people"></i>
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#000000' }}>User Activity</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666666' }}>Staff performance</p>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#333333', margin: '12px 0' }}>
                Track staff performance, attendance, and activity logs.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#666666' }}>
                Last updated: Today
              </div>
            </div>

            {/* Financial Report Card */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              border: '1px solid #000000',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#ffffff', 
                  border: '1px solid #000000',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#000000',
                  fontSize: '1.5rem'
                }}>
                  <i className="bi-currency-dollar"></i>
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#000000' }}>Financial Report</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666666' }}>Revenue & expenses</p>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#333333', margin: '12px 0' }}>
                Analyze revenue, expenses, and net income with cash flow insights.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#666666' }}>
                Last updated: Today
              </div>
            </div>

            {/* Product Performance Card */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              border: '1px solid #000000',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#ffffff', 
                  border: '1px solid #000000',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#000000',
                  fontSize: '1.5rem'
                }}>
                  <i className="bi-bar-chart"></i>
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#000000' }}>Product Performance</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666666' }}>Conversion & ratings</p>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#333333', margin: '12px 0' }}>
                Track product conversion rates, customer satisfaction, and loyalty.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#666666' }}>
                Last updated: Today
              </div>
            </div>

            {/* System Analytics Card */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              border: '1px solid #000000',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#ffffff', 
                  border: '1px solid #000000',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#000000',
                  fontSize: '1.5rem'
                }}>
                  <i className="bi-speedometer2"></i>
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#000000' }}>System Analytics</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666666' }}>Uptime & performance</p>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#333333', margin: '12px 0' }}>
                Monitor system uptime, security, and automation routines.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#666666' }}>
                Last updated: Today
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="report-sections" style={{ marginTop: '30px' }}>
        <div className="report-section" style={{ gridColumn: '1 / -1' }}>
          <h4>Quick Actions</h4>
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button style={{
              padding: '12px 24px',
              background: '#000000',
              color: '#ffffff',
              border: '1px solid #000000',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="bi-file-earmark-pdf"></i>
              Export All Reports
            </button>
            <button style={{
              padding: '12px 24px',
              background: '#ffffff',
              color: '#000000',
              border: '1px solid #000000',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="bi-calendar-range"></i>
              Schedule Reports
            </button>
            <button style={{
              padding: '12px 24px',
              background: '#ffffff',
              color: '#000000',
              border: '1px solid #000000',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="bi-gear"></i>
              Report Settings
            </button>
          </div>
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

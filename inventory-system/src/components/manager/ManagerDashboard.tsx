import { useAuth } from '../../contexts/AuthContext';
import './ManagerDashboard.css';

export function ManagerDashboard() {
  const { user, logout } = useAuth();

  const businessStats = [
    { title: 'Daily Sales', value: '$2,847', icon: '💰', trend: '+12%', color: '#059669' },
    { title: 'Total Orders', value: '156', icon: '📋', trend: '+8%', color: '#3b82f6' },
    { title: 'Inventory Value', value: '$45,230', icon: '📦', trend: '-2%', color: '#f59e0b' },
    { title: 'Staff on Duty', value: '8', icon: '👥', trend: '0%', color: '#8b5cf6' }
  ];

  const topProducts = [
    { name: 'Premium Coffee Beans', sold: 45, revenue: '$675', stock: 23 },
    { name: 'Organic Milk', sold: 38, revenue: '$152', stock: 67 },
    { name: 'Fresh Bread', sold: 32, revenue: '$96', stock: 15 },
    { name: 'Energy Drinks', sold: 28, revenue: '$140', stock: 42 },
    { name: 'Snack Mix', sold: 25, revenue: '$75', stock: 38 }
  ];

  const recentOrders = [
    { id: '#1234', customer: 'John Smith', amount: '$45.60', status: 'completed', time: '10 min ago' },
    { id: '#1235', customer: 'Sarah Johnson', amount: '$23.40', status: 'processing', time: '15 min ago' },
    { id: '#1236', customer: 'Mike Wilson', amount: '$67.80', status: 'completed', time: '22 min ago' },
    { id: '#1237', customer: 'Emma Davis', amount: '$12.30', status: 'pending', time: '28 min ago' },
    { id: '#1238', customer: 'Tom Brown', amount: '$89.50', status: 'completed', time: '35 min ago' }
  ];

  const managementActions = [
    { title: 'Inventory Reports', description: 'Generate detailed inventory reports', icon: '📊', action: 'Generate' },
    { title: 'Staff Schedule', description: 'Manage employee schedules and shifts', icon: '📅', action: 'Manage' },
    { title: 'Sales Analytics', description: 'View comprehensive sales analytics', icon: '📈', action: 'View' },
    { title: 'Supplier Orders', description: 'Place orders with suppliers', icon: '🚚', action: 'Order' },
    { title: 'Price Management', description: 'Update product prices and promotions', icon: '🏷️', action: 'Update' },
    { title: 'Customer Feedback', description: 'Review customer feedback and ratings', icon: '⭐', action: 'Review' }
  ];

  return (
    <div className="manager-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Manager Dashboard</h1>
            <p>Welcome back, <strong>{user?.name}</strong></p>
          </div>
          <button onClick={logout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Business Stats */}
        <section className="stats-section">
          <h2>Today's Performance</h2>
          <div className="stats-grid">
            {businessStats.map((stat, index) => (
              <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <h3>{stat.value}</h3>
                  <p>{stat.title}</p>
                  <span className={`trend ${stat.trend.startsWith('+') ? 'positive' : stat.trend.startsWith('-') ? 'negative' : 'neutral'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="dashboard-grid">
          {/* Top Products */}
          <section className="products-section">
            <h2>Top Selling Products</h2>
            <div className="products-list">
              {topProducts.map((product, index) => (
                <div key={index} className="product-item">
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p>Sold: {product.sold} units</p>
                  </div>
                  <div className="product-stats">
                    <span className="revenue">{product.revenue}</span>
                    <span className={`stock ${product.stock < 20 ? 'low' : 'normal'}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Orders */}
          <section className="orders-section">
            <h2>Recent Orders</h2>
            <div className="orders-list">
              {recentOrders.map((order, index) => (
                <div key={index} className="order-item">
                  <div className="order-info">
                    <h4>{order.id}</h4>
                    <p>{order.customer}</p>
                  </div>
                  <div className="order-details">
                    <span className="amount">{order.amount}</span>
                    <span className={`status ${order.status}`}>{order.status}</span>
                    <span className="time">{order.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Management Actions */}
        <section className="actions-section">
          <h2>Management Tools</h2>
          <div className="actions-grid">
            {managementActions.map((action, index) => (
              <div key={index} className="action-card">
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                  <button className="action-btn">{action.action}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

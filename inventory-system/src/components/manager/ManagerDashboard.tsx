import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../shared/Sidebar';
import Reports from '../shared/report';
import './ManagerDashboard.css';

export function ManagerDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  const businessStats = [
    { title: 'Daily Sales', value: '₱2,847', icon: 'bi-currency-dollar', trend: '+12%', color: '#059669' },
    { title: 'Total Orders', value: '156', icon: 'bi-clipboard-data', trend: '+8%', color: '#3b82f6' },
    { title: 'Inventory Value', value: '₱45,230', icon: 'bi-boxes', trend: '-2%', color: '#f59e0b' },
    { title: 'Staff on Duty', value: '8', icon: 'bi-people', trend: '0%', color: '#8b5cf6' }
  ];

  const topProducts = [
    { name: 'Premium Coffee Beans', sold: 45, revenue: '₱675', stock: 23 },
    { name: 'Organic Milk', sold: 38, revenue: '₱152', stock: 67 },
    { name: 'Fresh Bread', sold: 32, revenue: '₱96', stock: 15 },
    { name: 'Energy Drinks', sold: 28, revenue: '₱140', stock: 42 },
    { name: 'Snack Mix', sold: 25, revenue: '₱75', stock: 38 }
  ];

  const recentOrders = [
    { id: '#1234', customer: 'John Smith', amount: '₱45.60', status: 'completed', time: '10 min ago' },
    { id: '#1235', customer: 'Sarah Johnson', amount: '₱23.40', status: 'processing', time: '15 min ago' },
    { id: '#1236', customer: 'Mike Wilson', amount: '₱67.80', status: 'completed', time: '22 min ago' },
    { id: '#1237', customer: 'Emma Davis', amount: '₱12.30', status: 'pending', time: '28 min ago' },
    { id: '#1238', customer: 'Tom Brown', amount: '₱89.50', status: 'completed', time: '35 min ago' }
  ];

  const managementActions = [
    { title: 'Inventory Reports', description: 'Generate detailed inventory reports', icon: 'bi-graph-up', action: 'Generate' },
    { title: 'Staff Schedule', description: 'Manage employee schedules and shifts', icon: 'bi-calendar3', action: 'Manage' },
    { title: 'Sales Analytics', description: 'View comprehensive sales analytics', icon: 'bi-bar-chart', action: 'View' },
    { title: 'Supplier Orders', description: 'Place orders with suppliers', icon: 'bi-truck', action: 'Order' },
    { title: 'Price Management', description: 'Update product prices and promotions', icon: 'bi-tags', action: 'Update' },
    { title: 'Customer Feedback', description: 'Review customer feedback and ratings', icon: 'bi-star', action: 'Review' }
  ];

  const handleSidebarItemClick = (itemId: string) => {
    setActiveSection(itemId);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            {/* Business Stats */}
            <section className="stats-section">
              <h2>Today's Performance</h2>
              <div className="stats-grid">
                {businessStats.map((stat, index) => (
                  <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                    <div className="stat-icon"><i className={stat.icon}></i></div>
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
                    <div className="action-icon"><i className={action.icon}></i></div>
                    <div className="action-content">
                      <h3>{action.title}</h3>
                      <p>{action.description}</p>
                      <button className="action-btn">{action.action}</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        );
      case 'inventory':
        return (
          <section className="content-section">
            <h2><i className="bi-boxes"></i> Inventory Management</h2>
            <p>Monitor and control inventory levels, stock alerts, and product management.</p>
            <div className="placeholder-content">
              <p>Inventory management interface will be implemented here.</p>
            </div>
          </section>
        );
      case 'reports':
        return <Reports />;
      case 'staff':
        return (
          <section className="content-section">
            <h2><i className="bi-person-badge"></i> Staff Management</h2>
            <p>Manage employee schedules, performance, and staff operations.</p>
            <div className="placeholder-content">
              <p>Staff management interface will be implemented here.</p>
            </div>
          </section>
        );
      case 'suppliers':
        return (
          <section className="content-section">
            <h2><i className="bi-truck"></i> Suppliers</h2>
            <p>Manage supplier relationships, orders, and procurement.</p>
            <div className="placeholder-content">
              <p>Supplier management interface will be implemented here.</p>
            </div>
          </section>
        );
      case 'pos':
        return (
          <section className="content-section">
            <h2><i className="bi-cart3"></i> Point of Sale</h2>
            <p>Access the point of sale system for processing transactions.</p>
            <div className="placeholder-content">
              <p>Point of sale interface will be implemented here.</p>
            </div>
          </section>
        );
      case 'transactions':
        return (
          <section className="content-section">
            <h2><i className="bi-credit-card"></i> Transactions</h2>
            <p>View and manage all transaction records and payment history.</p>
            <div className="placeholder-content">
              <p>Transaction management interface will be implemented here.</p>
            </div>
          </section>
        );
      default:
        return (
          <section className="content-section">
            <h2>Page Not Found</h2>
            <p>The requested section could not be found.</p>
          </section>
        );
    }
  };

  return (
    <div className="manager-dashboard">
      <Sidebar 
        activeItem={activeSection}
        onItemClick={handleSidebarItemClick}
      />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1>Manager Dashboard</h1>
              <p>Welcome back, <strong>{user?.firstName} {user?.lastName}</strong></p>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../shared/Sidebar';
import CategoryManager from '../category/CategoryManager';
import TransactionHistory from '../cashier/TransactionRecord';
import ProductManagement from '../admin/ProductManagement';
import Reports from '../shared/report';
import ProfilePage from '../admin/ProfilePage';
import Settings from '../settings/Settings';
import ManagerDashboardAnalytics from './ManagerDashboardAnalytics.tsx';
import './ManagerDashboard.css';

export function ManagerDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleSidebarItemClick = (itemId: string) => {
    setActiveSection(itemId);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ManagerDashboardAnalytics />;
      case 'inventory':
        return <ProductManagement />;
      case 'categories':
        try {
          return <CategoryManager />;
        } catch (error) {
          return (
            <section className="content-section">
              <h2><i className="bi-tags"></i> Product Categories</h2>
              <div className="error-fallback">
                <p>⚠️ Error loading Category Manager</p>
                <p>Please check:</p>
                <ul>
                  <li>Backend server is running</li>
                  <li>Categories table exists in database</li>
                  <li>API endpoints are accessible</li>
                </ul>
                <button onClick={() => window.location.reload()}>Reload Page</button>
              </div>
            </section>
          );
        }
      case 'analytics':
        return <ManagerDashboardAnalytics />;
      case 'reports':
        return <Reports />;
      case 'staff':
        return (
          <section className="content-section">
            <h2><i className="bi-person-badge"></i> Staff Management</h2>
            <p>Manage employee schedules, performance, and staff operations.</p>

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
        return <TransactionHistory />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <Settings />;
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

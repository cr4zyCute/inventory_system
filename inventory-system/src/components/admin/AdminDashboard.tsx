import { useState } from 'react';
import Sidebar from '../shared/Sidebar';
import UserManagement from './UserManagement';
import ProductManagement from './ProductManagement';
import Reports from '../shared/report';
import CategoryManager from '../category/CategoryManager';
import TransactionHistory from '../cashier/TransactionRecord';
import DashboardAnalytics from './DashboardAnalytics';
import ProfilePage from './ProfilePage';
import './css/AdminDashboard.css';

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');


  const handleSidebarItemClick = (itemId: string) => {
    setActiveSection(itemId);
  };

  const renderContent = () => {

    switch (activeSection) {
      case 'dashboard':
        return <DashboardAnalytics />;
      case 'users':
        return <UserManagement />;
      case 'inventory':
        return <ProductManagement />;
      case 'categories':
        return <CategoryManager />;
      case 'reports':
        return <Reports />;
      case 'system':
        return (
          <section className="content-section">
            <h2><i className="bi-gear"></i> System Settings</h2>
            <p>Configure system-wide settings and preferences.</p>
            <div className="placeholder-content">
              <p>System settings interface will be implemented here.</p>
            </div>
          </section>
        );
      case 'security':
        return (
          <section className="content-section">
            <h2><i className="bi-shield-lock"></i> Security Audit</h2>
            <p>View security logs and audit trails.</p>
            <div className="placeholder-content">
              <p>Security audit interface will be implemented here.</p>
            </div>
          </section>
        );
      case 'backup':
        return (
          <section className="content-section">
            <h2><i className="bi-hdd"></i> Backup & Recovery</h2>
            <p>Manage data backups and recovery operations.</p>
            <div className="placeholder-content">
              <p>Backup management interface will be implemented here.</p>
            </div>
          </section>
        );
      case 'suppliers':
        return (
          <section className="content-section">
            <h2><i className="bi-truck"></i> Suppliers</h2>
            <p>Manage suppliers and vendor relationships.</p>
            <div className="placeholder-content">
              <p>Supplier management interface will be implemented here.</p>
            </div>
          </section>
        );
      case 'transactions':
        return <TransactionHistory />;
      case 'analytics':
        return <DashboardAnalytics />;
      case 'profile':
        return <ProfilePage />;
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
    <div className="admin-dashboard">
      <Sidebar 
        activeItem={activeSection}
        onItemClick={handleSidebarItemClick}
      />
      <div className="dashboard-content">


        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

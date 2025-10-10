import { useState } from 'react';
import Sidebar from '../shared/Sidebar';
import UserManagement from './UserManagement';
import ProductManagement from './ProductManagement';
import Reports from '../shared/report';
import CategoryManager from '../category/CategoryManager';
import './css/AdminDashboard.css';

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const adminStats = [
    { title: 'Total Users', value: '24', icon: 'bi-people', color: '#4f46e5' },
    { title: 'Active Sessions', value: '8', icon: 'bi-arrow-repeat', color: '#059669' },
    { title: 'System Health', value: '98%', icon: 'bi-lightning', color: '#dc2626' },
    { title: 'Data Backup', value: 'Today', icon: 'bi-hdd', color: '#7c3aed' }
  ];

  const recentActivities = [
    { action: 'User "manager" logged in', time: '2 minutes ago', type: 'login' },
    { action: 'Database backup completed', time: '1 hour ago', type: 'system' },
    { action: 'New cashier account created', time: '3 hours ago', type: 'user' },
    { action: 'System update installed', time: '1 day ago', type: 'system' },
    { action: 'Weekly report generated', time: '2 days ago', type: 'report' }
  ];

  const systemModules = [
    { name: 'User Management', description: 'Manage users, roles, and permissions', icon: 'bi-person', status: 'active' },
    { name: 'Inventory Control', description: 'Monitor and control inventory levels', icon: 'bi-boxes', status: 'active' },
    { name: 'Sales Analytics', description: 'Advanced sales reporting and analytics', icon: 'bi-graph-up', status: 'active' },
    { name: 'System Settings', description: 'Configure system-wide settings', icon: 'bi-gear', status: 'active' },
    { name: 'Backup & Recovery', description: 'Data backup and recovery management', icon: 'bi-arrow-repeat', status: 'active' },
    { name: 'Security Audit', description: 'Security logs and audit trails', icon: 'bi-shield-lock', status: 'active' }
  ];

  const handleSidebarItemClick = (itemId: string) => {
    setActiveSection(itemId);
  };

  const renderContent = () => {

    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            {/* Stats Cards */}
            <section className="stats-section">
              <h2>System Overview</h2>
              <div className="stats-grid">
                {adminStats.map((stat, index) => (
                  <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                    <div className="stat-icon"><i className={stat.icon}></i></div>
                    <div className="stat-content">
                      <h3>{stat.value}</h3>
                      <p>{stat.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* System Modules */}
            <section className="modules-section">
              <h2>System Modules</h2>
              <div className="modules-grid">
                {systemModules.map((module, index) => (
                  <div key={index} className="module-card">
                    <div className="module-header">
                      <i className={`module-icon ${module.icon}`}></i>
                      <span className={`module-status ${module.status}`}>
                        <i className={module.status === 'active' ? 'bi-circle-fill text-success' : 'bi-circle-fill text-danger'}></i>
                      </span>
                    </div>
                    <h3>{module.name}</h3>
                    <p>{module.description}</p>
                    <button className="module-btn">Configure</button>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Activities */}
            <section className="activities-section">
              <h2>Recent Activities</h2>
              <div className="activities-list">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className={`activity-type ${activity.type}`}>
                      {activity.type === 'login' && <i className="bi-key"></i>}
                      {activity.type === 'system' && <i className="bi-gear"></i>}
                      {activity.type === 'user' && <i className="bi-person"></i>}
                      {activity.type === 'report' && <i className="bi-clipboard-data"></i>}
                    </div>
                    <div className="activity-content">
                      <p>{activity.action}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        );
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
        return (
          <section className="content-section">
            <h2><i className="bi-receipt"></i> Transaction History</h2>
            <p>View and manage transaction records.</p>
            <div className="placeholder-content">
              <p>Transaction history interface will be implemented here.</p>
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

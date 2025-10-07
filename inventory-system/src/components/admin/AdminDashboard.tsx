import { useAuth } from '../../contexts/AuthContext';
import './AdminDashboard.css';

export function AdminDashboard() {
  const { user, logout } = useAuth();

  const adminStats = [
    { title: 'Total Users', value: '24', icon: '👥', color: '#4f46e5' },
    { title: 'Active Sessions', value: '8', icon: '🔄', color: '#059669' },
    { title: 'System Health', value: '98%', icon: '⚡', color: '#dc2626' },
    { title: 'Data Backup', value: 'Today', icon: '💾', color: '#7c3aed' }
  ];

  const recentActivities = [
    { action: 'User "manager" logged in', time: '2 minutes ago', type: 'login' },
    { action: 'Database backup completed', time: '1 hour ago', type: 'system' },
    { action: 'New cashier account created', time: '3 hours ago', type: 'user' },
    { action: 'System update installed', time: '1 day ago', type: 'system' },
    { action: 'Weekly report generated', time: '2 days ago', type: 'report' }
  ];

  const systemModules = [
    { name: 'User Management', description: 'Manage users, roles, and permissions', icon: '👤', status: 'active' },
    { name: 'Inventory Control', description: 'Monitor and control inventory levels', icon: '📦', status: 'active' },
    { name: 'Sales Analytics', description: 'Advanced sales reporting and analytics', icon: '📊', status: 'active' },
    { name: 'System Settings', description: 'Configure system-wide settings', icon: '⚙️', status: 'active' },
    { name: 'Backup & Recovery', description: 'Data backup and recovery management', icon: '🔄', status: 'active' },
    { name: 'Security Audit', description: 'Security logs and audit trails', icon: '🔒', status: 'active' }
  ];

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, <strong>{user?.name}</strong></p>
          </div>
          <button onClick={logout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Stats Cards */}
        <section className="stats-section">
          <h2>System Overview</h2>
          <div className="stats-grid">
            {adminStats.map((stat, index) => (
              <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                <div className="stat-icon">{stat.icon}</div>
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
                  <span className="module-icon">{module.icon}</span>
                  <span className={`module-status ${module.status}`}>
                    {module.status === 'active' ? '🟢' : '🔴'}
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
                  {activity.type === 'login' && '🔐'}
                  {activity.type === 'system' && '⚙️'}
                  {activity.type === 'user' && '👤'}
                  {activity.type === 'report' && '📋'}
                </div>
                <div className="activity-content">
                  <p>{activity.action}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

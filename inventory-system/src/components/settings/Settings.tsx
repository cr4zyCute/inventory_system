import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AccountSettings from './AccountSettings';
import AdminSettings from './AdminSettings';
import ManagerSettings from './ManagerSettings';
import CashierSettings from './CashierSettings';
import './css/Settings.css';

const Settings: React.FC = () => {
  const { user } = useAuth();
  
  // Set default tab based on user role (first tab in the list)
  const getDefaultTab = () => {
    switch (user?.role?.toLowerCase()) {
      case 'admin':
        return 'system';
      case 'manager':
        return 'management';
      case 'cashier':
        return 'cashier';
      default:
        return 'account';
    }
  };
  
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize with account as fallback, will be updated when user loads
    return user ? getDefaultTab() : 'account';
  });

  // Update active tab when user data becomes available
  React.useEffect(() => {
    if (user && activeTab === 'account' && user.role) {
      setActiveTab(getDefaultTab());
    }
  }, [user]);

  const getTabsForRole = () => {
    const accountTab = { id: 'account', label: 'Account Settings', icon: 'bi-person-gear' };
    
    switch (user?.role?.toLowerCase()) {
      case 'admin':
        return [
          { id: 'system', label: 'System Settings', icon: 'bi-gear' },
          accountTab
        ];
      case 'manager':
        return [
          { id: 'management', label: 'Management Settings', icon: 'bi-clipboard-data' },
          accountTab
        ];
      case 'cashier':
        return [
          { id: 'cashier', label: 'Cashier Settings', icon: 'bi-display' },
          accountTab
        ];
      default:
        return [accountTab];
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'system':
        return user?.role?.toLowerCase() === 'admin' ? <AdminSettings /> : <AccountSettings />;
      case 'management':
        return user?.role?.toLowerCase() === 'manager' ? <ManagerSettings /> : <AccountSettings />;
      case 'cashier':
        return user?.role?.toLowerCase() === 'cashier' ? <CashierSettings /> : <AccountSettings />;
      default:
        return <AccountSettings />;
    }
  };

  const tabs = getTabsForRole();

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="settings-title">
          <i className="bi bi-gear"></i>
          Settings
        </h1>
        <p className="settings-subtitle">Manage your account and application preferences</p>
      </div>

      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default Settings;

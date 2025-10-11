import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AccountSettings from './AccountSettings';
import AdminSettings from './AdminSettings';
import ManagerSettings from './ManagerSettings';
import CashierSettings from './CashierSettings';
import './css/Settings.css';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  const getTabsForRole = () => {
    const baseTabs = [
      { id: 'account', label: 'Account Settings', icon: 'bi-person-gear' }
    ];

    switch (user?.role?.toLowerCase()) {
      case 'admin':
        return [
          ...baseTabs,
          { id: 'system', label: 'System Settings', icon: 'bi-gear' }
        ];
      case 'manager':
        return [
          ...baseTabs,
          { id: 'management', label: 'Management Settings', icon: 'bi-clipboard-data' }
        ];
      case 'cashier':
        return [
          ...baseTabs,
          { id: 'cashier', label: 'Cashier Settings', icon: 'bi-display' }
        ];
      default:
        return baseTabs;
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

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './css/Sidebar.css';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  roles: string[];
  section?: string;
  onClick?: () => void;
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define all menu items with role-based access
  const menuItems: MenuItem[] = [
    // Dashboard Section
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2', roles: ['admin', 'manager', 'cashier'], section: 'main' },
    
    // Admin Only
    { id: 'users', label: 'User Management', icon: 'bi-people', roles: ['admin'], section: 'admin' },
    { id: 'system', label: 'System Settings', icon: 'bi-gear', roles: ['admin'], section: 'admin' },
    { id: 'security', label: 'Security Audit', icon: 'bi-shield-lock', roles: ['admin'], section: 'admin' },
    { id: 'backup', label: 'Backup & Recovery', icon: 'bi-hdd', roles: ['admin'], section: 'admin' },
    
    // Manager & Admin
    { id: 'inventory', label: 'Inventory Management', icon: 'bi-boxes', roles: ['admin', 'manager'], section: 'management' },
    { id: 'categories', label: 'Product Categories', icon: 'bi-tags', roles: ['admin', 'manager'], section: 'management' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'bi-graph-up', roles: ['admin', 'manager'], section: 'management' },
    { id: 'suppliers', label: 'Suppliers', icon: 'bi-truck', roles: ['admin', 'manager'], section: 'management' },
    
    // Cashier, Manager & Admin
    // { id: 'pos', label: 'Point of Sale', icon: 'bi-cart3', roles: ['admin', 'manager', 'cashier'], section: 'operations' },
    { id: 'transactions', label: 'Transaction History', icon: 'bi-receipt', roles: ['admin', 'manager', 'cashier'], section: 'operations' },
    
    // Cashier Only
    // { id: 'scanner', label: 'Barcode Scanner', icon: 'bi-upc-scan', roles: ['cashier'], section: 'operations' },
    { id: 'phone-scanner', label: 'Scanner', icon: 'bi-phone', roles: ['cashier'], section: 'operations' },
    { id: 'transaction-display', label: 'Transaction Display', icon: 'bi-display', roles: ['cashier'], section: 'operations' },
    // { id: 'quick-sale', label: 'Quick Sale', icon: 'bi-lightning', roles: ['cashier'], section: 'operations' },
  ];

  // Filter menu items based on user role
  const getFilteredMenuItems = () => {
    if (!user?.role) return [];
    return menuItems.filter(item => item.roles.includes(user.role));
  };

  // Group items by section
  const getGroupedMenuItems = () => {
    const filtered = getFilteredMenuItems();
    const grouped: { [key: string]: MenuItem[] } = {};
    
    filtered.forEach(item => {
      const section = item.section || 'main';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(item);
    });
    
    return grouped;
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (onItemClick) {
      onItemClick(item.id);
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'main': return 'Main';
      case 'admin': return 'Administration';
      case 'management': return 'Management';
      case 'operations': return 'Operations';
      default: return section;
    }
  };

  const groupedItems = getGroupedMenuItems();

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <i className="brand-icon bi-shop"></i>
          {!isCollapsed && <span className="brand-text">Inventory System</span>}
        </div>
        <button 
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}></i>
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.firstName?.charAt(0) || <i className="bi-person"></i>}
        </div>
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-name">{user?.firstName} {user?.lastName}</div>
            <div className="user-role">{user?.role?.toUpperCase()}</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section} className="nav-section">
            {!isCollapsed && items.length > 0 && (
              <div className="section-title">{getSectionTitle(section)}</div>
            )}
            <ul className="nav-list">
              {items.map(item => (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link ${activeItem === item.id ? 'active' : ''}`}
                    onClick={() => handleItemClick(item)}
                    title={isCollapsed ? item.label : ''}
                  >
                    <i className={`nav-icon ${item.icon}`}></i>
                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="logout-button"
          onClick={logout}
          title={isCollapsed ? 'Logout' : ''}
        >
          <i className="nav-icon bi-box-arrow-right"></i>
          {!isCollapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

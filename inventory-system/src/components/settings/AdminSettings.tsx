import React, { useState } from 'react';

const AdminSettings: React.FC = () => {
  const [systemSettings, setSystemSettings] = useState({
    storeName: 'Tindahan Store',
    currency: 'PHP',
    taxRate: '12',
    lowStockThreshold: '10',
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    passwordExpiry: '90',
    requireStrongPasswords: true,
    enableTwoFactor: false,
    auditLogging: true,
    autoLockout: true
  });

  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSystemSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const saveSystemSettings = () => {
    localStorage.setItem('adminSystemSettings', JSON.stringify(systemSettings));
    alert('System settings saved!');
  };

  const saveSecuritySettings = () => {
    localStorage.setItem('adminSecuritySettings', JSON.stringify(securitySettings));
    alert('Security settings saved!');
  };

  const handleMaintenanceToggle = () => {
    const newMode = !systemSettings.maintenanceMode;
    setSystemSettings(prev => ({ ...prev, maintenanceMode: newMode }));
    alert(`Maintenance mode ${newMode ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="admin-settings">
      {/* System Configuration */}
      <div className="settings-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="bi bi-gear"></i>
            System Configuration
          </h3>
          <p className="card-description">Configure core system settings and business parameters</p>
        </div>

        <div className="settings-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="storeName" className="form-label">Store Name</label>
              <input
                type="text"
                id="storeName"
                name="storeName"
                value={systemSettings.storeName}
                onChange={handleSystemChange}
                className="form-input"
                required
              />
              <small className="form-help">Name displayed on receipts and reports</small>
            </div>

            <div className="form-group">
              <label htmlFor="currency" className="form-label">Currency</label>
              <select
                id="currency"
                name="currency"
                value={systemSettings.currency}
                onChange={handleSystemChange}
                className="form-input"
              >
                <option value="PHP">Philippine Peso (PHP)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
              <small className="form-help">Default currency for all transactions</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="taxRate" className="form-label">Tax Rate (%)</label>
              <input
                type="number"
                id="taxRate"
                name="taxRate"
                value={systemSettings.taxRate}
                onChange={handleSystemChange}
                className="form-input"
                min="0"
                max="100"
                step="0.01"
              />
              <small className="form-help">Default tax rate applied to sales</small>
            </div>

            <div className="form-group">
              <label htmlFor="lowStockThreshold" className="form-label">Low Stock Threshold</label>
              <input
                type="number"
                id="lowStockThreshold"
                name="lowStockThreshold"
                value={systemSettings.lowStockThreshold}
                onChange={handleSystemChange}
                className="form-input"
                min="0"
              />
              <small className="form-help">Alert when product quantity falls below this number</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="backupFrequency" className="form-label">Backup Frequency</label>
              <select
                id="backupFrequency"
                name="backupFrequency"
                value={systemSettings.backupFrequency}
                onChange={handleSystemChange}
                className="form-input"
                disabled={!systemSettings.autoBackup}
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <small className="form-help">How often automatic backups are created</small>
            </div>
          </div>

          <div className="checkbox-section">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="autoBackup"
                name="autoBackup"
                checked={systemSettings.autoBackup}
                onChange={handleSystemChange}
                className="form-checkbox"
              />
              <label htmlFor="autoBackup" className="checkbox-label">
                <strong>Enable Automatic Backups</strong>
                <span>Automatically create database backups at scheduled intervals</span>
              </label>
            </div>
          </div>

          <div className="maintenance-section">
            <div className="maintenance-toggle">
              <div className="toggle-info">
                <h4>Maintenance Mode</h4>
                <p>Enable to prevent users from accessing the system during updates</p>
              </div>
              <button
                type="button"
                onClick={handleMaintenanceToggle}
                className={`toggle-button ${systemSettings.maintenanceMode ? 'active' : ''}`}
              >
                <div className="toggle-slider"></div>
                <span className="toggle-text">
                  {systemSettings.maintenanceMode ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
            {systemSettings.maintenanceMode && (
              <div className="maintenance-warning">
                <i className="bi bi-exclamation-triangle"></i>
                Maintenance mode is currently enabled. Users cannot access the system.
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={saveSystemSettings}
              className="btn btn-primary"
            >
              <i className="bi bi-check"></i>
              Save System Settings
            </button>
          </div>
        </div>
      </div>

      {/* Security & Access Control */}
      <div className="settings-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="bi bi-shield-lock"></i>
            Security & Access Control
          </h3>
          <p className="card-description">Configure security policies and user access controls</p>
        </div>

        <div className="settings-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sessionTimeout" className="form-label">Session Timeout (minutes)</label>
              <select
                id="sessionTimeout"
                name="sessionTimeout"
                value={securitySettings.sessionTimeout}
                onChange={handleSecurityChange}
                className="form-input"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
              <small className="form-help">Auto-logout users after this period of inactivity</small>
            </div>

            <div className="form-group">
              <label htmlFor="maxLoginAttempts" className="form-label">Max Login Attempts</label>
              <select
                id="maxLoginAttempts"
                name="maxLoginAttempts"
                value={securitySettings.maxLoginAttempts}
                onChange={handleSecurityChange}
                className="form-input"
              >
                <option value="3">3 attempts</option>
                <option value="5">5 attempts</option>
                <option value="10">10 attempts</option>
              </select>
              <small className="form-help">Lock account after this many failed login attempts</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="passwordExpiry" className="form-label">Password Expiry (days)</label>
              <select
                id="passwordExpiry"
                name="passwordExpiry"
                value={securitySettings.passwordExpiry}
                onChange={handleSecurityChange}
                className="form-input"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="0">Never expire</option>
              </select>
              <small className="form-help">Force users to change passwords after this period</small>
            </div>
          </div>

          <div className="checkbox-section">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="requireStrongPasswords"
                name="requireStrongPasswords"
                checked={securitySettings.requireStrongPasswords}
                onChange={handleSecurityChange}
                className="form-checkbox"
              />
              <label htmlFor="requireStrongPasswords" className="checkbox-label">
                <strong>Require Strong Passwords</strong>
                <span>Enforce password complexity requirements (8+ chars, mixed case, numbers)</span>
              </label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="auditLogging"
                name="auditLogging"
                checked={securitySettings.auditLogging}
                onChange={handleSecurityChange}
                className="form-checkbox"
              />
              <label htmlFor="auditLogging" className="checkbox-label">
                <strong>Enable Audit Logging</strong>
                <span>Log all user actions and system events for security monitoring</span>
              </label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="autoLockout"
                name="autoLockout"
                checked={securitySettings.autoLockout}
                onChange={handleSecurityChange}
                className="form-checkbox"
              />
              <label htmlFor="autoLockout" className="checkbox-label">
                <strong>Auto Account Lockout</strong>
                <span>Automatically lock accounts after maximum failed login attempts</span>
              </label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="enableTwoFactor"
                name="enableTwoFactor"
                checked={securitySettings.enableTwoFactor}
                onChange={handleSecurityChange}
                className="form-checkbox"
              />
              <label htmlFor="enableTwoFactor" className="checkbox-label">
                <strong>Two-Factor Authentication</strong>
                <span>Require additional verification for admin accounts (Coming Soon)</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={saveSecuritySettings}
              className="btn btn-primary"
            >
              <i className="bi bi-check"></i>
              Save Security Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

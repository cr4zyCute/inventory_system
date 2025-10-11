import React, { useState } from 'react';

const ManagerSettings: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    lowStockAlerts: true,
    dailyReports: true,
    userActivity: false,
    systemUpdates: true,
    emailNotifications: true,
    alertThreshold: '10'
  });

  const [reportSettings, setReportSettings] = useState({
    defaultDateRange: '30',
    autoGenerateReports: true,
    includeCharts: true,
    reportFormat: 'pdf',
    emailReports: false,
    reportTime: '09:00'
  });

  const handleNotificationChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleReportChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setReportSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const saveNotificationSettings = () => {
    localStorage.setItem('managerNotificationSettings', JSON.stringify(notificationSettings));
    alert('Notification settings saved!');
  };

  const saveReportSettings = () => {
    localStorage.setItem('managerReportSettings', JSON.stringify(reportSettings));
    alert('Report settings saved!');
  };

  return (
    <div className="manager-settings">
      
      {/* Report Settings */}
      <div className="settings-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="bi bi-graph-up-arrow"></i>
            Report Preferences
          </h3>
          <p className="card-description">Configure automatic report generation and formatting</p>
        </div>

        <div className="settings-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="defaultDateRange" className="form-label">Default Date Range</label>
              <select
                id="defaultDateRange"
                name="defaultDateRange"
                value={reportSettings.defaultDateRange}
                onChange={handleReportChange}
                className="form-input"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <small className="form-help">Default time period for generating reports</small>
            </div>

            <div className="form-group">
              <label htmlFor="reportFormat" className="form-label">Report Format</label>
              <select
                id="reportFormat"
                name="reportFormat"
                value={reportSettings.reportFormat}
                onChange={handleReportChange}
                className="form-input"
              >
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="csv">CSV File</option>
              </select>
              <small className="form-help">Preferred format for downloaded reports</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reportTime" className="form-label">Daily Report Time</label>
              <input
                type="time"
                id="reportTime"
                name="reportTime"
                value={reportSettings.reportTime}
                onChange={handleReportChange}
                className="form-input"
              />
              <small className="form-help">Time when daily reports are automatically generated</small>
            </div>
          </div>

          <div className="checkbox-section">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="autoGenerateReports"
                name="autoGenerateReports"
                checked={reportSettings.autoGenerateReports}
                onChange={handleReportChange}
                className="form-checkbox"
              />
              <label htmlFor="autoGenerateReports" className="checkbox-label">
                <strong>Auto-Generate Daily Reports</strong>
                <span>Automatically create daily sales and inventory reports</span>
              </label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="includeCharts"
                name="includeCharts"
                checked={reportSettings.includeCharts}
                onChange={handleReportChange}
                className="form-checkbox"
              />
              <label htmlFor="includeCharts" className="checkbox-label">
                <strong>Include Charts in Reports</strong>
                <span>Add visual charts and graphs to generated reports</span>
              </label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="emailReports"
                name="emailReports"
                checked={reportSettings.emailReports}
                onChange={handleReportChange}
                className="form-checkbox"
              />
              <label htmlFor="emailReports" className="checkbox-label">
                <strong>Email Reports Automatically</strong>
                <span>Send generated reports to your email address</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={saveReportSettings}
              className="btn btn-primary"
            >
              <i className="bi bi-check"></i>
              Save Report Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSettings;

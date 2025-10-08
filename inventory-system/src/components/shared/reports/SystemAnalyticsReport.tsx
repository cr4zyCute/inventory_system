import React from 'react';
import '../css/report.css';

const SystemAnalyticsReport: React.FC = () => {
  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-cpu"></i>
          </div>
          <div className="metric-info">
            <h3>99.98%</h3>
            <p>System Uptime</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-speedometer2"></i>
          </div>
          <div className="metric-info">
            <h3>1.2s</h3>
            <p>Avg Response Time</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-shield-check"></i>
          </div>
          <div className="metric-info">
            <h3>0</h3>
            <p>Security Incidents</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-database"></i>
          </div>
          <div className="metric-info">
            <h3>2.4GB</h3>
            <p>Database Size</p>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>System Health Metrics</h4>
          <div className="product-list">
            <div className="product-item">
              <span className="product-name">CPU Usage</span>
              <span className="product-sales">23.5%</span>
              <span className="product-units">Normal</span>
            </div>
            <div className="product-item">
              <span className="product-name">Memory Usage</span>
              <span className="product-sales">67.2%</span>
              <span className="product-units">Normal</span>
            </div>
            <div className="product-item">
              <span className="product-name">Disk Usage</span>
              <span className="product-sales">45.8%</span>
              <span className="product-units">Normal</span>
            </div>
            <div className="product-item">
              <span className="product-name">Network I/O</span>
              <span className="product-sales">12.3 MB/s</span>
              <span className="product-units">Normal</span>
            </div>
            <div className="product-item">
              <span className="product-name">Active Connections</span>
              <span className="product-sales">247</span>
              <span className="product-units">Normal</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Recent System Events</h4>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <i className="bi-check-circle"></i>
              </div>
              <div className="activity-content">
                <p>System backup completed</p>
                <span>Daily backup routine finished successfully</span>
              </div>
              <div className="activity-time">2 hours ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <i className="bi-arrow-clockwise"></i>
              </div>
              <div className="activity-content">
                <p>Database optimization</p>
                <span>Automated maintenance completed</span>
              </div>
              <div className="activity-time">6 hours ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <i className="bi-shield-check"></i>
              </div>
              <div className="activity-content">
                <p>Security scan completed</p>
                <span>No threats detected</span>
              </div>
              <div className="activity-time">12 hours ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <i className="bi-cloud-upload"></i>
              </div>
              <div className="activity-content">
                <p>Cloud sync completed</p>
                <span>Data synchronized with cloud storage</span>
              </div>
              <div className="activity-time">1 day ago</div>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Performance Trend (7 Days)</h4>
          <div className="line-chart">
            <div className="chart-bars">
              <div className="bar" style={{ height: '95%' }} data-value="99.95%"></div>
              <div className="bar" style={{ height: '98%' }} data-value="99.98%"></div>
              <div className="bar" style={{ height: '100%' }} data-value="100%"></div>
              <div className="bar" style={{ height: '97%' }} data-value="99.97%"></div>
              <div className="bar" style={{ height: '99%' }} data-value="99.99%"></div>
              <div className="bar" style={{ height: '96%' }} data-value="99.96%"></div>
              <div className="bar" style={{ height: '98%' }} data-value="99.98%"></div>
            </div>
            <div className="chart-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalyticsReport;

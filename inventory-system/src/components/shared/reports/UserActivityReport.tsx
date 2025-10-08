import React from 'react';
import '../css/report.css';

const UserActivityReport: React.FC = () => {
  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-people"></i>
          </div>
          <div className="metric-info">
            <h3>32</h3>
            <p>Active Staff</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-clock"></i>
          </div>
          <div className="metric-info">
            <h3>1,248</h3>
            <p>Total Hours</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-graph-up"></i>
          </div>
          <div className="metric-info">
            <h3>94.5%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-star"></i>
          </div>
          <div className="metric-info">
            <h3>4.7</h3>
            <p>Avg Performance</p>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Top Performers</h4>
          <div className="product-list">
            <div className="product-item">
              <span className="product-name">Maria Santos - Cashier</span>
              <span className="product-sales">98.5%</span>
              <span className="product-units">156 hrs</span>
            </div>
            <div className="product-item">
              <span className="product-name">John Dela Cruz - Manager</span>
              <span className="product-sales">97.2%</span>
              <span className="product-units">168 hrs</span>
            </div>
            <div className="product-item">
              <span className="product-name">Ana Rodriguez - Cashier</span>
              <span className="product-sales">96.8%</span>
              <span className="product-units">152 hrs</span>
            </div>
            <div className="product-item">
              <span className="product-name">Carlos Mendoza - Stock Clerk</span>
              <span className="product-sales">95.4%</span>
              <span className="product-units">144 hrs</span>
            </div>
            <div className="product-item">
              <span className="product-name">Lisa Garcia - Supervisor</span>
              <span className="product-sales">94.9%</span>
              <span className="product-units">160 hrs</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Recent Activity</h4>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <i className="bi-person-check"></i>
              </div>
              <div className="activity-content">
                <p>Maria Santos clocked in</p>
                <span>Shift started at 8:00 AM</span>
              </div>
              <div className="activity-time">2 hours ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <i className="bi-box-seam"></i>
              </div>
              <div className="activity-content">
                <p>Carlos Mendoza updated inventory</p>
                <span>Added 50 units of Coffee Beans</span>
              </div>
              <div className="activity-time">3 hours ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <i className="bi-receipt"></i>
              </div>
              <div className="activity-content">
                <p>Ana Rodriguez processed sale</p>
                <span>Transaction #TXN-2024-001247</span>
              </div>
              <div className="activity-time">4 hours ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <i className="bi-gear"></i>
              </div>
              <div className="activity-content">
                <p>John Dela Cruz updated settings</p>
                <span>Modified discount policies</span>
              </div>
              <div className="activity-time">5 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityReport;

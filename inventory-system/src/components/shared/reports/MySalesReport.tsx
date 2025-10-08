import React from 'react';
import '../css/report.css';

const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString()}`;
};

const MySalesReport: React.FC = () => {
  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-calendar-day"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(8450)}</h3>
            <p>Today's Sales</p>
            <div className="metric-trend positive">+15.2%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-receipt"></i>
          </div>
          <div className="metric-info">
            <h3>47</h3>
            <p>Transactions Today</p>
            <div className="metric-trend positive">+8.3%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-calendar-week"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(52340)}</h3>
            <p>This Week</p>
            <div className="metric-trend positive">+12.7%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-graph-up"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(179)}</h3>
            <p>Avg Transaction</p>
            <div className="metric-trend positive">+6.8%</div>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Recent Transactions</h4>
          <div className="transaction-list">
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001247</span>
              <span className="txn-time">10:45 AM</span>
              <span className="txn-amount">{formatCurrency(245)}</span>
              <span className="txn-items">3 items</span>
            </div>
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001246</span>
              <span className="txn-time">10:32 AM</span>
              <span className="txn-amount">{formatCurrency(156)}</span>
              <span className="txn-items">2 items</span>
            </div>
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001245</span>
              <span className="txn-time">10:18 AM</span>
              <span className="txn-amount">{formatCurrency(89)}</span>
              <span className="txn-items">1 item</span>
            </div>
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001244</span>
              <span className="txn-time">10:05 AM</span>
              <span className="txn-amount">{formatCurrency(312)}</span>
              <span className="txn-items">4 items</span>
            </div>
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001243</span>
              <span className="txn-time">09:52 AM</span>
              <span className="txn-amount">{formatCurrency(178)}</span>
              <span className="txn-items">2 items</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>My Performance This Week</h4>
          <div className="line-chart">
            <div className="chart-bars">
              <div className="bar" style={{ height: '60%' }} data-value="₱6,450"></div>
              <div className="bar" style={{ height: '75%' }} data-value="₱8,230"></div>
              <div className="bar" style={{ height: '45%' }} data-value="₱5,120"></div>
              <div className="bar" style={{ height: '85%' }} data-value="₱9,680"></div>
              <div className="bar" style={{ height: '70%' }} data-value="₱7,340"></div>
              <div className="bar" style={{ height: '90%' }} data-value="₱10,070"></div>
              <div className="bar" style={{ height: '100%' }} data-value="₱11,450"></div>
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

        <div className="report-section">
          <h4>Top Items Sold Today</h4>
          <div className="product-list">
            <div className="product-item">
              <span className="product-name">Premium Coffee Beans</span>
              <span className="product-sales">{formatCurrency(1245)}</span>
              <span className="product-units">8 units</span>
            </div>
            <div className="product-item">
              <span className="product-name">Artisan Pastries</span>
              <span className="product-sales">{formatCurrency(890)}</span>
              <span className="product-units">6 units</span>
            </div>
            <div className="product-item">
              <span className="product-name">Fresh Sandwiches</span>
              <span className="product-sales">{formatCurrency(675)}</span>
              <span className="product-units">5 units</span>
            </div>
            <div className="product-item">
              <span className="product-name">Specialty Drinks</span>
              <span className="product-sales">{formatCurrency(456)}</span>
              <span className="product-units">4 units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySalesReport;

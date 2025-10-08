import React from 'react';
import '../css/report.css';

const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString()}`;
};

const DailyTransactionsReport: React.FC = () => {
  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-list-check"></i>
          </div>
          <div className="metric-info">
            <h3>247</h3>
            <p>Total Transactions</p>
            <div className="metric-trend positive">+18.5%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-currency-dollar"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(45680)}</h3>
            <p>Total Value</p>
            <div className="metric-trend positive">+22.3%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-graph-up"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(185)}</h3>
            <p>Average Value</p>
            <div className="metric-trend positive">+3.2%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-clock"></i>
          </div>
          <div className="metric-info">
            <h3>2.3 min</h3>
            <p>Avg Processing Time</p>
            <div className="metric-trend negative">-0.5 min</div>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Transaction Timeline</h4>
          <div className="transaction-list">
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001247</span>
              <span className="txn-time">10:45 AM</span>
              <span className="txn-amount">{formatCurrency(245)}</span>
              <span className="txn-items">3 items</span>
            </div>
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001246</span>
              <span className="txn-time">10:42 AM</span>
              <span className="txn-amount">{formatCurrency(156)}</span>
              <span className="txn-items">2 items</span>
            </div>
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001245</span>
              <span className="txn-time">10:38 AM</span>
              <span className="txn-amount">{formatCurrency(89)}</span>
              <span className="txn-items">1 item</span>
            </div>
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001244</span>
              <span className="txn-time">10:35 AM</span>
              <span className="txn-amount">{formatCurrency(312)}</span>
              <span className="txn-items">4 items</span>
            </div>
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001243</span>
              <span className="txn-time">10:32 AM</span>
              <span className="txn-amount">{formatCurrency(178)}</span>
              <span className="txn-items">2 items</span>
            </div>
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001242</span>
              <span className="txn-time">10:28 AM</span>
              <span className="txn-amount">{formatCurrency(267)}</span>
              <span className="txn-items">3 items</span>
            </div>
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001241</span>
              <span className="txn-time">10:25 AM</span>
              <span className="txn-amount">{formatCurrency(134)}</span>
              <span className="txn-items">2 items</span>
            </div>
            <div className="transaction-item">
              <span className="txn-id">TXN-2024-001240</span>
              <span className="txn-time">10:22 AM</span>
              <span className="txn-amount">{formatCurrency(456)}</span>
              <span className="txn-items">5 items</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Hourly Transaction Volume</h4>
          <div className="line-chart">
            <div className="chart-bars">
              <div className="bar" style={{ height: '30%' }} data-value="12"></div>
              <div className="bar" style={{ height: '45%' }} data-value="18"></div>
              <div className="bar" style={{ height: '60%' }} data-value="24"></div>
              <div className="bar" style={{ height: '85%' }} data-value="34"></div>
              <div className="bar" style={{ height: '100%' }} data-value="42"></div>
              <div className="bar" style={{ height: '75%' }} data-value="31"></div>
              <div className="bar" style={{ height: '55%' }} data-value="23"></div>
              <div className="bar" style={{ height: '40%' }} data-value="16"></div>
            </div>
            <div className="chart-labels">
              <span>8AM</span>
              <span>9AM</span>
              <span>10AM</span>
              <span>11AM</span>
              <span>12PM</span>
              <span>1PM</span>
              <span>2PM</span>
              <span>3PM</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Payment Methods</h4>
          <div className="product-list">
            <div className="product-item">
              <span className="product-name">Cash</span>
              <span className="product-sales">142 transactions</span>
              <span className="product-units">57.5%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Credit Card</span>
              <span className="product-sales">68 transactions</span>
              <span className="product-units">27.5%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Digital Wallet</span>
              <span className="product-sales">32 transactions</span>
              <span className="product-units">13.0%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Bank Transfer</span>
              <span className="product-sales">5 transactions</span>
              <span className="product-units">2.0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTransactionsReport;

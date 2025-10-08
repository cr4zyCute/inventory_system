import React from 'react';
import '../css/report.css';

const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString()}`;
};

const SalesSummaryReport: React.FC = () => {
  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-currency-dollar"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(245680)}</h3>
            <p>Total Sales</p>
            <div className="metric-trend positive">+12.5%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-receipt"></i>
          </div>
          <div className="metric-info">
            <h3>1,247</h3>
            <p>Total Transactions</p>
            <div className="metric-trend positive">+8.3%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-graph-up"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(197)}</h3>
            <p>Avg Transaction</p>
            <div className="metric-trend positive">+3.7%</div>
          </div>
        </div>
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
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Top Selling Products</h4>
          <div className="product-list">
            <div className="product-item">
              <span className="product-name">Premium Coffee Beans</span>
              <span className="product-sales">{formatCurrency(45680)}</span>
              <span className="product-units">234 units</span>
            </div>
            <div className="product-item">
              <span className="product-name">Organic Tea Collection</span>
              <span className="product-sales">{formatCurrency(32450)}</span>
              <span className="product-units">187 units</span>
            </div>
            <div className="product-item">
              <span className="product-name">Artisan Pastries</span>
              <span className="product-sales">{formatCurrency(28900)}</span>
              <span className="product-units">156 units</span>
            </div>
            <div className="product-item">
              <span className="product-name">Fresh Sandwiches</span>
              <span className="product-sales">{formatCurrency(24750)}</span>
              <span className="product-units">143 units</span>
            </div>
            <div className="product-item">
              <span className="product-name">Specialty Drinks</span>
              <span className="product-sales">{formatCurrency(19800)}</span>
              <span className="product-units">98 units</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Sales Trend (Last 7 Days)</h4>
          <div className="line-chart">
            <div className="chart-bars">
              <div className="bar" style={{ height: '60%' }} data-value="₱12,450"></div>
              <div className="bar" style={{ height: '75%' }} data-value="₱15,680"></div>
              <div className="bar" style={{ height: '45%' }} data-value="₱9,230"></div>
              <div className="bar" style={{ height: '85%' }} data-value="₱18,900"></div>
              <div className="bar" style={{ height: '70%' }} data-value="₱14,560"></div>
              <div className="bar" style={{ height: '90%' }} data-value="₱21,340"></div>
              <div className="bar" style={{ height: '100%' }} data-value="₱24,780"></div>
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

export default SalesSummaryReport;

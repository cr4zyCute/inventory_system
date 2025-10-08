import React from 'react';
import '../css/report.css';

const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString()}`;
};

const FinancialReport: React.FC = () => {
  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-currency-dollar"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(528450)}</h3>
            <p>Total Revenue</p>
            <div className="metric-trend positive">+18.5%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-receipt"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(234680)}</h3>
            <p>Total Expenses</p>
            <div className="metric-trend negative">+5.2%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-graph-up"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(293770)}</h3>
            <p>Net Income</p>
            <div className="metric-trend positive">+32.8%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-percent"></i>
          </div>
          <div className="metric-info">
            <h3>55.6%</h3>
            <p>Profit Margin</p>
            <div className="metric-trend positive">+8.1%</div>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Revenue Breakdown</h4>
          <div className="product-list">
            <div className="product-item">
              <span className="product-name">Product Sales</span>
              <span className="product-sales">{formatCurrency(425680)}</span>
              <span className="product-units">80.5%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Service Fees</span>
              <span className="product-sales">{formatCurrency(68450)}</span>
              <span className="product-units">13.0%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Delivery Charges</span>
              <span className="product-sales">{formatCurrency(24320)}</span>
              <span className="product-units">4.6%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Other Income</span>
              <span className="product-sales">{formatCurrency(10000)}</span>
              <span className="product-units">1.9%</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Expense Categories</h4>
          <div className="product-list">
            <div className="product-item">
              <span className="product-name">Cost of Goods Sold</span>
              <span className="product-sales">{formatCurrency(145680)}</span>
              <span className="product-units">62.1%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Staff Salaries</span>
              <span className="product-sales">{formatCurrency(56000)}</span>
              <span className="product-units">23.9%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Rent & Utilities</span>
              <span className="product-sales">{formatCurrency(18000)}</span>
              <span className="product-units">7.7%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Marketing & Ads</span>
              <span className="product-sales">{formatCurrency(8500)}</span>
              <span className="product-units">3.6%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Other Expenses</span>
              <span className="product-sales">{formatCurrency(6500)}</span>
              <span className="product-units">2.7%</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Cash Flow Trend</h4>
          <div className="line-chart">
            <div className="chart-bars">
              <div className="bar" style={{ height: '45%' }} data-value="₱45,680"></div>
              <div className="bar" style={{ height: '60%' }} data-value="₱62,340"></div>
              <div className="bar" style={{ height: '75%' }} data-value="₱78,920"></div>
              <div className="bar" style={{ height: '55%' }} data-value="₱58,450"></div>
              <div className="bar" style={{ height: '85%' }} data-value="₱89,670"></div>
              <div className="bar" style={{ height: '70%' }} data-value="₱74,580"></div>
              <div className="bar" style={{ height: '100%' }} data-value="₱105,230"></div>
            </div>
            <div className="chart-labels">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
              <span>Week 5</span>
              <span>Week 6</span>
              <span>Week 7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;

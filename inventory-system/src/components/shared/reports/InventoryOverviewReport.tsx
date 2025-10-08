import React from 'react';
import '../css/report.css';

const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString()}`;
};

const InventoryOverviewReport: React.FC = () => {
  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-boxes"></i>
          </div>
          <div className="metric-info">
            <h3>248</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="metric-card warning">
          <div className="metric-icon">
            <i className="bi-exclamation-triangle"></i>
          </div>
          <div className="metric-info">
            <h3>14</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="metric-card danger">
          <div className="metric-icon">
            <i className="bi-x-circle"></i>
          </div>
          <div className="metric-info">
            <h3>3</h3>
            <p>Out of Stock</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-currency-dollar"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(892450)}</h3>
            <p>Total Inventory Value</p>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Low Stock Alerts</h4>
          <div className="alert-list">
            <div className="alert-item">
              <span className="product-name">Premium Coffee Beans</span>
              <span className="stock-info">5 / 50</span>
              <span className="category">Beverages</span>
            </div>
            <div className="alert-item">
              <span className="product-name">Organic Tea Bags</span>
              <span className="stock-info">8 / 30</span>
              <span className="category">Beverages</span>
            </div>
            <div className="alert-item">
              <span className="product-name">Fresh Milk</span>
              <span className="stock-info">12 / 40</span>
              <span className="category">Dairy</span>
            </div>
            <div className="alert-item">
              <span className="product-name">Artisan Bread</span>
              <span className="stock-info">6 / 25</span>
              <span className="category">Bakery</span>
            </div>
            <div className="alert-item">
              <span className="product-name">Specialty Sugar</span>
              <span className="stock-info">3 / 20</span>
              <span className="category">Ingredients</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Inventory Distribution</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <div className="donut-chart">
              <div className="donut-center">
                <div className="donut-value">248</div>
                <div className="donut-label">Items</div>
              </div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#000000' }}></div>
                <span>Beverages (45%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#666666' }}></div>
                <span>Food Items (30%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#999999' }}></div>
                <span>Ingredients (15%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#cccccc' }}></div>
                <span>Others (10%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryOverviewReport;

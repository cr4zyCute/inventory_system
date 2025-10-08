import React from 'react';
import '../css/report.css';

const ProductPerformanceReport: React.FC = () => {
  return (
    <div className="report-content">
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-bar-chart"></i>
          </div>
          <div className="metric-info">
            <h3>87.3%</h3>
            <p>Conversion Rate</p>
            <div className="metric-trend positive">+5.2%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-star"></i>
          </div>
          <div className="metric-info">
            <h3>4.6</h3>
            <p>Avg Rating</p>
            <div className="metric-trend positive">+0.3</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-heart"></i>
          </div>
          <div className="metric-info">
            <h3>92.1%</h3>
            <p>Customer Satisfaction</p>
            <div className="metric-trend positive">+2.8%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-arrow-repeat"></i>
          </div>
          <div className="metric-info">
            <h3>68.4%</h3>
            <p>Return Rate</p>
            <div className="metric-trend positive">+12.5%</div>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Best Performing Products</h4>
          <div className="product-list">
            <div className="product-item">
              <span className="product-name">Premium Coffee Beans</span>
              <span className="product-sales">95.2%</span>
              <span className="product-units">4.8★</span>
            </div>
            <div className="product-item">
              <span className="product-name">Organic Tea Collection</span>
              <span className="product-sales">92.8%</span>
              <span className="product-units">4.7★</span>
            </div>
            <div className="product-item">
              <span className="product-name">Artisan Pastries</span>
              <span className="product-sales">89.5%</span>
              <span className="product-units">4.6★</span>
            </div>
            <div className="product-item">
              <span className="product-name">Fresh Sandwiches</span>
              <span className="product-sales">87.3%</span>
              <span className="product-units">4.5★</span>
            </div>
            <div className="product-item">
              <span className="product-name">Specialty Drinks</span>
              <span className="product-sales">85.1%</span>
              <span className="product-units">4.4★</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Customer Feedback Summary</h4>
          <div className="product-list">
            <div className="product-item">
              <span className="product-name">Excellent (5★)</span>
              <span className="product-sales">156 reviews</span>
              <span className="product-units">62.4%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Good (4★)</span>
              <span className="product-sales">74 reviews</span>
              <span className="product-units">29.6%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Average (3★)</span>
              <span className="product-sales">15 reviews</span>
              <span className="product-units">6.0%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Poor (2★)</span>
              <span className="product-sales">3 reviews</span>
              <span className="product-units">1.2%</span>
            </div>
            <div className="product-item">
              <span className="product-name">Terrible (1★)</span>
              <span className="product-sales">2 reviews</span>
              <span className="product-units">0.8%</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Performance Trends</h4>
          <div className="line-chart">
            <div className="chart-bars">
              <div className="bar" style={{ height: '70%' }} data-value="82.5%"></div>
              <div className="bar" style={{ height: '75%' }} data-value="84.2%"></div>
              <div className="bar" style={{ height: '80%' }} data-value="85.8%"></div>
              <div className="bar" style={{ height: '85%' }} data-value="86.9%"></div>
              <div className="bar" style={{ height: '88%' }} data-value="87.1%"></div>
              <div className="bar" style={{ height: '90%' }} data-value="87.3%"></div>
              <div className="bar" style={{ height: '100%' }} data-value="89.5%"></div>
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

export default ProductPerformanceReport;

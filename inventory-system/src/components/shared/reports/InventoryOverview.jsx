import React, { useState, useEffect } from 'react';
import { useProducts } from '../../../hooks/useProducts';
import { useInventoryActivity } from '../../../hooks/useInventoryActivity';
import '../css/report.css';
import '../css/InventoryOverview.css';

const formatCurrency = (amount) => {
  return `₱${amount.toLocaleString()}`;
};

const InventoryOverview = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: activities = [], isLoading: activitiesLoading } = useInventoryActivity();
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    newItems: [],
    stockUpdates: [],
    zeroStockItems: []
  });

  useEffect(() => {
    if (products.length > 0) {
      // Calculate inventory statistics
      const totalProducts = products.length;
      const lowStockItems = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length;
      const outOfStockItems = products.filter(p => p.stockQuantity === 0).length;
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);

      // Get new items (created in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newItems = products.filter(p => new Date(p.createdAt) >= sevenDaysAgo);

      // Get zero stock items
      const zeroStockItems = products.filter(p => p.stockQuantity === 0);

      // Get recent stock updates from activities
      const stockUpdates = activities
        .filter(a => a.action === 'STOCK_UPDATE' || a.action === 'PRODUCT_ADDED')
        .slice(0, 10); // Get last 10 updates

      setInventoryStats({
        totalProducts,
        lowStockItems,
        outOfStockItems,
        totalValue,
        newItems: newItems.slice(0, 5), // Show latest 5
        stockUpdates,
        zeroStockItems: zeroStockItems.slice(0, 5) // Show first 5
      });
    }
  }, [products, activities]);

  if (productsLoading || activitiesLoading) {
    return (
      <div className="inventory-overview-container">
        <div className="loading-state">
          <div className="loading-spinner">
            <i className="bi-arrow-clockwise loading-spin"></i>
          </div>
          <p>Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-overview-container">
      <div className="report-content">
        {/* Inventory Metrics */}
        <div className="report-metrics">
          <div className="metric-card">
            <div className="metric-icon">
              <i className="bi-boxes"></i>
            </div>
            <div className="metric-info">
              <h3>{inventoryStats.totalProducts}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div className="metric-card warning">
            <div className="metric-icon">
              <i className="bi-exclamation-triangle"></i>
            </div>
            <div className="metric-info">
              <h3>{inventoryStats.lowStockItems}</h3>
              <p>Low Stock Items</p>
            </div>
          </div>
          <div className="metric-card danger">
            <div className="metric-icon">
              <i className="bi-x-circle"></i>
            </div>
            <div className="metric-info">
              <h3>{inventoryStats.outOfStockItems}</h3>
              <p>Out of Stock</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <i className="bi-currency-dollar"></i>
            </div>
            <div className="metric-info">
              <h3>{formatCurrency(inventoryStats.totalValue)}</h3>
              <p>Total Inventory Value</p>
            </div>
          </div>
        </div>

        <div className="report-sections">
          {/* New Items Added */}
          <div className="report-section">
            <h4>
              <i className="bi-plus-circle" style={{ marginRight: '8px', color: '#28a745' }}></i>
              New Items Added (Last 7 Days)
            </h4>
            {inventoryStats.newItems.length > 0 ? (
              <div className="product-list">
                {inventoryStats.newItems.map((item) => (
                  <div key={item.id} className="product-item">
                    <span className="product-name">{item.name}</span>
                    <span className="product-sales">{formatCurrency(item.price)}</span>
                    <span className="product-units">{item.stockQuantity} units</span>
                    <span className="category" style={{ fontSize: '0.8rem', color: '#28a745' }}>
                      Added {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data" style={{ padding: '20px' }}>
                <i className="bi-inbox"></i>
                <p>No new items added in the last 7 days</p>
              </div>
            )}
          </div>

          {/* Recent Stock Updates */}
          <div className="report-section">
            <h4>
              <i className="bi-arrow-up-circle" style={{ marginRight: '8px', color: '#007bff' }}></i>
              Recent Stock Updates
            </h4>
            {inventoryStats.stockUpdates.length > 0 ? (
              <div className="activity-list">
                {inventoryStats.stockUpdates.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <i className={activity.action === 'PRODUCT_ADDED' ? 'bi-plus-circle' : 'bi-arrow-up-circle'}></i>
                    </div>
                    <div className="activity-content">
                      <p>{activity.details || `Stock updated for ${activity.productName || 'product'}`}</p>
                      <span>
                        {activity.userName} • {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="activity-time">
                      {activity.action === 'PRODUCT_ADDED' ? 'New' : 'Updated'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data" style={{ padding: '20px' }}>
                <i className="bi-clock-history"></i>
                <p>No recent stock updates</p>
              </div>
            )}
          </div>

          {/* Zero Stock Items */}
          <div className="report-section">
            <h4>
              <i className="bi-exclamation-octagon" style={{ marginRight: '8px', color: '#dc3545' }}></i>
              Items with Zero Stock
            </h4>
            {inventoryStats.zeroStockItems.length > 0 ? (
              <div className="alert-list">
                {inventoryStats.zeroStockItems.map((item) => (
                  <div key={item.id} className="alert-item" style={{ borderLeftColor: '#dc3545' }}>
                    <span className="product-name">{item.name}</span>
                    <span className="stock-info" style={{ color: '#dc3545', fontWeight: 'bold' }}>
                      0 / {item.minStockLevel}
                    </span>
                    <span className="category">
                      {formatCurrency(item.price)} each
                    </span>
                    <span className="category" style={{ fontSize: '0.8rem', color: '#dc3545' }}>
                      Urgent Restock
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data" style={{ padding: '20px' }}>
                <i className="bi-check-circle" style={{ color: '#28a745' }}></i>
                <p style={{ color: '#28a745' }}>All items are in stock!</p>
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="report-section">
            <h4>
              <i className="bi-exclamation-triangle" style={{ marginRight: '8px', color: '#ffc107' }}></i>
              Low Stock Alerts
            </h4>
            {products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length > 0 ? (
              <div className="alert-list">
                {products
                  .filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel)
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="alert-item" style={{ borderLeftColor: '#ffc107' }}>
                      <span className="product-name">{item.name}</span>
                      <span className="stock-info" style={{ color: '#ffc107', fontWeight: 'bold' }}>
                        {item.stockQuantity} / {item.minStockLevel}
                      </span>
                      <span className="category">
                        {formatCurrency(item.price)} each
                      </span>
                      <span className="category" style={{ fontSize: '0.8rem', color: '#ffc107' }}>
                        Restock Soon
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="no-data" style={{ padding: '20px' }}>
                <i className="bi-check-circle" style={{ color: '#28a745' }}></i>
                <p style={{ color: '#28a745' }}>No low stock alerts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryOverview;
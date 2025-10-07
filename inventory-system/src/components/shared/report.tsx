import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './css/report.css';

interface ReportItem {
  id: string;
  name: string;
  icon: string;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface Product {
  name: string;
  sales: number;
  units: number;
}

interface LowStockProduct {
  name: string;
  current: number;
  minimum: number;
  category: string;
}

interface Transaction {
  id: string;
  time: string;
  amount: number;
  items: number;
}

interface ReportData {
  totalSales?: number;
  totalTransactions?: number;
  averageTransaction?: number;
  topProducts?: Product[];
  totalProducts?: number;
  lowStockItems?: number;
  outOfStockItems?: number;
  totalValue?: number;
  lowStockProducts?: LowStockProduct[];
  todaySales?: number;
  todayTransactions?: number;
  weekSales?: number;
  monthSales?: number;
  recentTransactions?: Transaction[];
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Role-based report configurations
  const getAvailableReports = (): ReportItem[] => {
    const baseReports: Record<string, ReportItem[]> = {
      admin: [
        { id: 'sales-summary', name: 'Sales Summary', icon: 'bi-graph-up' },
        { id: 'inventory-overview', name: 'Inventory Overview', icon: 'bi-boxes' },
        { id: 'user-activity', name: 'User Activity', icon: 'bi-people' },
        { id: 'financial-report', name: 'Financial Report', icon: 'bi-currency-dollar' },
        { id: 'product-performance', name: 'Product Performance', icon: 'bi-bar-chart' },
        { id: 'system-analytics', name: 'System Analytics', icon: 'bi-speedometer2' }
      ],
      manager: [
        { id: 'sales-summary', name: 'Sales Summary', icon: 'bi-graph-up' },
        { id: 'inventory-overview', name: 'Inventory Overview', icon: 'bi-boxes' },
        { id: 'product-performance', name: 'Product Performance', icon: 'bi-bar-chart' },
        { id: 'staff-performance', name: 'Staff Performance', icon: 'bi-person-check' },
        { id: 'low-stock-alert', name: 'Low Stock Alert', icon: 'bi-exclamation-triangle' }
      ],
      cashier: [
        { id: 'my-sales', name: 'My Sales', icon: 'bi-receipt' },
        { id: 'daily-transactions', name: 'Daily Transactions', icon: 'bi-list-check' },
        { id: 'product-lookup', name: 'Product Lookup', icon: 'bi-search' }
      ]
    };

    return baseReports[user?.role?.toLowerCase() || 'cashier'] || baseReports.cashier;
  };

  // Mock data generators for different reports
  const generateMockData = (reportType: string): ReportData => {
    const mockData: Record<string, ReportData> = {
      'sales-summary': {
        totalSales: 125430.50,
        totalTransactions: 1247,
        averageTransaction: 100.58,
        topProducts: [
          { name: 'Wireless Headphones', sales: 15420, units: 154 },
          { name: 'Smartphone Case', sales: 8930, units: 298 },
          { name: 'USB Cable', sales: 6750, units: 450 }
        ]
      },
      'inventory-overview': {
        totalProducts: 1247,
        lowStockItems: 23,
        outOfStockItems: 5,
        totalValue: 245670.80,
        lowStockProducts: [
          { name: 'iPhone Charger', current: 5, minimum: 20, category: 'Electronics' },
          { name: 'Bluetooth Speaker', current: 2, minimum: 15, category: 'Electronics' },
          { name: 'Notebook', current: 8, minimum: 25, category: 'Stationery' }
        ]
      },
      'my-sales': {
        todaySales: 2340.50,
        todayTransactions: 23,
        weekSales: 12450.80,
        monthSales: 45230.20,
        recentTransactions: [
          { id: 'TXN001', time: '14:30', amount: 125.50, items: 3 },
          { id: 'TXN002', time: '14:15', amount: 89.99, items: 2 },
          { id: 'TXN003', time: '13:45', amount: 234.75, items: 5 }
        ]
      },
      'daily-transactions': {
        recentTransactions: Array.from({ length: 20 }, (_, i) => ({
          id: `TXN${String(i + 1).padStart(3, '0')}`,
          time: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000).toLocaleTimeString(),
          amount: parseFloat((Math.random() * 200 + 10).toFixed(2)),
          items: Math.floor(Math.random() * 5) + 1
        }))
      }
    };

    return mockData[reportType] || {};
  };

  const handleGenerateReport = async (): Promise<void> => {
    if (!selectedReport) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const data = generateMockData(selectedReport);
      setReportData(data);
      setLoading(false);
    }, 1500);
  };

  // Export Functions
  const handleExportPDF = async (): Promise<void> => {
    if (!reportData || !selectedReport) return;
    
    const reportName = getAvailableReports().find(r => r.id === selectedReport)?.name || 'Report';
    const fileName = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    try {
      // Method 1: Generate PDF via backend API (Recommended)
      const response = await fetch('/api/reports/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: selectedReport,
          reportData: reportData,
          reportName: reportName,
          dateRange: dateRange,
          user: user
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        return;
      }
    } catch (error) {
      console.log('PDF generation via API failed, trying client-side generation');
    }
    
    try {
      // Method 2: Client-side PDF generation using jsPDF
      if (typeof window !== 'undefined' && (window as any).jsPDF) {
        const { jsPDF } = (window as any);
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(79, 70, 229); // #4f46e5
        doc.text(reportName, 20, 30);
        
        // Add metadata
        doc.setFontSize(10);
        doc.setTextColor(102, 102, 102); // #666
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
        doc.text(`Date Range: ${dateRange.startDate} to ${dateRange.endDate}`, 20, 55);
        doc.text(`User: ${user?.firstName} ${user?.lastName} (${user?.role})`, 20, 65);
        
        let yPos = 85;
        
        // Add metrics
        if (reportData.totalSales) {
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text('Sales Summary', 20, yPos);
          yPos += 15;
          
          doc.setFontSize(10);
          doc.text(`Total Sales: ₱${reportData.totalSales.toLocaleString()}`, 25, yPos);
          yPos += 10;
          
          if (reportData.totalTransactions) {
            doc.text(`Total Transactions: ${reportData.totalTransactions.toLocaleString()}`, 25, yPos);
            yPos += 10;
          }
          
          if (reportData.averageTransaction) {
            doc.text(`Average Transaction: ₱${reportData.averageTransaction.toFixed(2)}`, 25, yPos);
            yPos += 15;
          }
        }
        
        // Add top products
        if (reportData.topProducts && reportData.topProducts.length > 0) {
          doc.setFontSize(14);
          doc.text('Top Products', 20, yPos);
          yPos += 15;
          
          doc.setFontSize(10);
          reportData.topProducts.forEach((product: any, index: number) => {
            if (yPos > 250) { // Add new page if needed
              doc.addPage();
              yPos = 30;
            }
            doc.text(`${index + 1}. ${product.name} - ₱${product.sales.toLocaleString()} (${product.units} units)`, 25, yPos);
            yPos += 10;
          });
        }
        
        // Save the PDF
        doc.save(fileName);
        return;
      }
    } catch (error) {
      console.log('Client-side PDF generation failed, falling back to print method');
    }
    
    // Method 3: Fallback - Open print dialog for manual PDF save
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = generatePDFContent(reportName, new Date().toLocaleDateString());
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        // Show instruction to user
        alert('Please select "Save as PDF" in the print dialog to download the PDF file.');
      }, 500);
    }
  };

  const handleExportExcel = (): void => {
    if (!reportData || !selectedReport) return;
    
    const reportName = getAvailableReports().find(r => r.id === selectedReport)?.name || 'Report';
    const csvContent = generateCSVContent();
    
    // Create and download CSV file (Excel-compatible)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (): void => {
    if (!reportData || !selectedReport) return;
    
    const reportName = getAvailableReports().find(r => r.id === selectedReport)?.name || 'Report';
    const dateStr = new Date().toLocaleDateString();
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = generatePrintContent(reportName, dateStr);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const generatePDFContent = (reportName: string, dateStr: string): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportName} - ${dateStr}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
          .header h1 { color: #4f46e5; margin: 0; }
          .header p { margin: 5px 0; color: #666; }
          .metrics { display: flex; justify-content: space-around; margin: 30px 0; }
          .metric { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .metric h3 { font-size: 24px; margin: 0; color: #4f46e5; }
          .metric p { margin: 5px 0; color: #666; }
          .section { margin: 30px 0; }
          .section h3 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .table th { background-color: #f8f9fa; font-weight: bold; }
          .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportName}</h1>
          <p>Generated on: ${dateStr}</p>
          <p>Date Range: ${dateRange.startDate} to ${dateRange.endDate}</p>
          <p>User: ${user?.firstName} ${user?.lastName} (${user?.role})</p>
        </div>
        ${generateReportHTML()}
        <div class="footer">
          <p>Inventory Management System - Confidential Report</p>
        </div>
      </body>
      </html>
    `;
  };

  const generatePrintContent = (reportName: string, dateStr: string): string => {
    return generatePDFContent(reportName, dateStr);
  };

  const generateReportHTML = (): string => {
    if (!reportData) return '';

    let html = '';

    // Add metrics section
    if (selectedReport === 'sales-summary') {
      html += `
        <div class="metrics">
          <div class="metric">
            <h3>₱${reportData.totalSales?.toLocaleString()}</h3>
            <p>Total Sales</p>
          </div>
          <div class="metric">
            <h3>${reportData.totalTransactions?.toLocaleString()}</h3>
            <p>Transactions</p>
          </div>
          <div class="metric">
            <h3>₱${reportData.averageTransaction?.toFixed(2)}</h3>
            <p>Avg Transaction</p>
          </div>
        </div>
        <div class="section">
          <h3>Top Products</h3>
          <table class="table">
            <thead>
              <tr><th>Product Name</th><th>Sales</th><th>Units Sold</th></tr>
            </thead>
            <tbody>
              ${reportData.topProducts?.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>₱${p.sales.toLocaleString()}</td>
                  <td>${p.units} units</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
        </div>
      `;
    } else if (selectedReport === 'inventory-overview') {
      html += `
        <div class="metrics">
          <div class="metric">
            <h3>${reportData.totalProducts?.toLocaleString()}</h3>
            <p>Total Products</p>
          </div>
          <div class="metric">
            <h3>${reportData.lowStockItems}</h3>
            <p>Low Stock Items</p>
          </div>
          <div class="metric">
            <h3>${reportData.outOfStockItems}</h3>
            <p>Out of Stock</p>
          </div>
          <div class="metric">
            <h3>₱${reportData.totalValue?.toLocaleString()}</h3>
            <p>Total Value</p>
          </div>
        </div>
        <div class="section">
          <h3>Low Stock Alert</h3>
          <table class="table">
            <thead>
              <tr><th>Product Name</th><th>Current Stock</th><th>Minimum Required</th><th>Category</th></tr>
            </thead>
            <tbody>
              ${reportData.lowStockProducts?.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.current}</td>
                  <td>${p.minimum}</td>
                  <td>${p.category}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
        </div>
      `;
    } else if (selectedReport === 'my-sales') {
      html += `
        <div class="metrics">
          <div class="metric">
            <h3>₱${reportData.todaySales?.toFixed(2)}</h3>
            <p>Today's Sales</p>
          </div>
          <div class="metric">
            <h3>${reportData.todayTransactions}</h3>
            <p>Today's Transactions</p>
          </div>
          <div class="metric">
            <h3>₱${reportData.weekSales?.toLocaleString()}</h3>
            <p>This Week</p>
          </div>
        </div>
        <div class="section">
          <h3>Recent Transactions</h3>
          <table class="table">
            <thead>
              <tr><th>Transaction ID</th><th>Time</th><th>Amount</th><th>Items</th></tr>
            </thead>
            <tbody>
              ${reportData.recentTransactions?.map(t => `
                <tr>
                  <td>${t.id}</td>
                  <td>${t.time}</td>
                  <td>₱${t.amount}</td>
                  <td>${t.items} items</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
        </div>
      `;
    }

    return html;
  };

  const generateCSVContent = (): string => {
    if (!reportData) return '';

    let csv = '';
    const reportName = getAvailableReports().find(r => r.id === selectedReport)?.name || 'Report';
    
    // Add header
    csv += `${reportName}\n`;
    csv += `Generated on: ${new Date().toLocaleDateString()}\n`;
    csv += `Date Range: ${dateRange.startDate} to ${dateRange.endDate}\n`;
    csv += `User: ${user?.firstName} ${user?.lastName} (${user?.role})\n\n`;

    if (selectedReport === 'sales-summary') {
      csv += 'SALES SUMMARY\n';
      csv += `Total Sales,₱${reportData.totalSales?.toLocaleString()}\n`;
      csv += `Total Transactions,${reportData.totalTransactions?.toLocaleString()}\n`;
      csv += `Average Transaction,₱${reportData.averageTransaction?.toFixed(2)}\n\n`;
      
      csv += 'TOP PRODUCTS\n';
      csv += 'Product Name,Sales,Units Sold\n';
      reportData.topProducts?.forEach(p => {
        csv += `"${p.name}",₱${p.sales.toLocaleString()},${p.units}\n`;
      });
    } else if (selectedReport === 'inventory-overview') {
      csv += 'INVENTORY OVERVIEW\n';
      csv += `Total Products,${reportData.totalProducts?.toLocaleString()}\n`;
      csv += `Low Stock Items,${reportData.lowStockItems}\n`;
      csv += `Out of Stock Items,${reportData.outOfStockItems}\n`;
      csv += `Total Value,₱${reportData.totalValue?.toLocaleString()}\n\n`;
      
      csv += 'LOW STOCK ALERT\n';
      csv += 'Product Name,Current Stock,Minimum Required,Category\n';
      reportData.lowStockProducts?.forEach(p => {
        csv += `"${p.name}",${p.current},${p.minimum},"${p.category}"\n`;
      });
    } else if (selectedReport === 'my-sales') {
      csv += 'MY SALES\n';
      csv += `Today's Sales,₱${reportData.todaySales?.toFixed(2)}\n`;
      csv += `Today's Transactions,${reportData.todayTransactions}\n`;
      csv += `This Week,₱${reportData.weekSales?.toLocaleString()}\n\n`;
      
      csv += 'RECENT TRANSACTIONS\n';
      csv += 'Transaction ID,Time,Amount,Items\n';
      reportData.recentTransactions?.forEach(t => {
        csv += `${t.id},"${t.time}",₱${t.amount},${t.items}\n`;
      });
    }

    return csv;
  };

  const renderReportContent = (): React.ReactElement | null => {
    if (!reportData) return null;

    switch (selectedReport) {
      case 'sales-summary':
        return (
          <div className="report-content">
            <div className="report-metrics">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-currency-dollar"></i>
                </div>
                <div className="metric-info">
                  <h3>₱{reportData.totalSales?.toLocaleString()}</h3>
                  <p>Total Sales</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-receipt"></i>
                </div>
                <div className="metric-info">
                  <h3>{reportData.totalTransactions?.toLocaleString()}</h3>
                  <p>Transactions</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-graph-up"></i>
                </div>
                <div className="metric-info">
                  <h3>₱{reportData.averageTransaction?.toFixed(2)}</h3>
                  <p>Avg Transaction</p>
                </div>
              </div>
            </div>
            
            <div className="report-sections">
              <div className="report-section">
                <h4>Top Products</h4>
                <div className="product-list">
                  {reportData.topProducts?.map((product, index) => (
                    <div key={index} className="product-item">
                      <span className="product-name">{product.name}</span>
                      <span className="product-sales">₱{product.sales.toLocaleString()}</span>
                      <span className="product-units">{product.units} units</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'inventory-overview':
        return (
          <div className="report-content">
            <div className="report-metrics">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-boxes"></i>
                </div>
                <div className="metric-info">
                  <h3>{reportData.totalProducts?.toLocaleString()}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              <div className="metric-card warning">
                <div className="metric-icon">
                  <i className="bi-exclamation-triangle"></i>
                </div>
                <div className="metric-info">
                  <h3>{reportData.lowStockItems}</h3>
                  <p>Low Stock</p>
                </div>
              </div>
              <div className="metric-card danger">
                <div className="metric-icon">
                  <i className="bi-x-circle"></i>
                </div>
                <div className="metric-info">
                  <h3>{reportData.outOfStockItems}</h3>
                  <p>Out of Stock</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-currency-dollar"></i>
                </div>
                <div className="metric-info">
                  <h3>₱{reportData.totalValue?.toLocaleString()}</h3>
                  <p>Total Value</p>
                </div>
              </div>
            </div>

            <div className="report-sections">
              <div className="report-section">
                <h4>Low Stock Alert</h4>
                <div className="alert-list">
                  {reportData.lowStockProducts?.map((product, index) => (
                    <div key={index} className="alert-item">
                      <span className="product-name">{product.name}</span>
                      <span className="stock-info">
                        Current: {product.current} | Min: {product.minimum}
                      </span>
                      <span className="category">{product.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'my-sales':
        return (
          <div className="report-content">
            <div className="report-metrics">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-calendar-day"></i>
                </div>
                <div className="metric-info">
                  <h3>₱{reportData.todaySales?.toFixed(2)}</h3>
                  <p>Today's Sales</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-receipt"></i>
                </div>
                <div className="metric-info">
                  <h3>{reportData.todayTransactions}</h3>
                  <p>Transactions</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-calendar-week"></i>
                </div>
                <div className="metric-info">
                  <h3>₱{reportData.weekSales?.toLocaleString()}</h3>
                  <p>This Week</p>
                </div>
              </div>
            </div>

            <div className="report-sections">
              <div className="report-section">
                <h4>Recent Transactions</h4>
                <div className="transaction-list">
                  {reportData.recentTransactions?.map((txn, index) => (
                    <div key={index} className="transaction-item">
                      <span className="txn-id">{txn.id}</span>
                      <span className="txn-time">{txn.time}</span>
                      <span className="txn-amount">₱{txn.amount}</span>
                      <span className="txn-items">{txn.items} items</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="report-content">
            <div className="no-data">
              <i className="bi-file-earmark-text"></i>
              <p>Report data will be displayed here</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="header-info">
          <h2 className="reports-title">
            <i className="bi-file-earmark-bar-graph"></i>
            Reports & Analytics
          </h2>
          <p className="reports-subtitle">
            {user?.role === 'admin' && 'Comprehensive business insights and analytics'}
            {user?.role === 'manager' && 'Operational reports and performance metrics'}
            {user?.role === 'cashier' && 'Personal sales performance and transaction history'}
          </p>
        </div>
      </div>

      <div className="reports-controls">
        <div className="control-group">
          <label htmlFor="report-select">Select Report</label>
          <select
            id="report-select"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="report-select"
          >
            <option value="">Choose a report...</option>
            {getAvailableReports().map(report => (
              <option key={report.id} value={report.id}>
                {report.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="start-date">Start Date</label>
          <input
            type="date"
            id="start-date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="date-input"
          />
        </div>

        <div className="control-group">
          <label htmlFor="end-date">End Date</label>
          <input
            type="date"
            id="end-date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="date-input"
          />
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={!selectedReport || loading}
          className="generate-button"
        >
          {loading ? (
            <>
              <i className="bi-arrow-repeat loading-spin"></i>
              Generating...
            </>
          ) : (
            <>
              <i className="bi-play-fill"></i>
              Generate Report
            </>
          )}
        </button>
      </div>

      <div className="reports-body">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">
              <i className="bi-arrow-repeat loading-spin"></i>
            </div>
            <p>Generating your report...</p>
          </div>
        ) : reportData ? (
          <div className="report-wrapper">
            <div className="report-header">
              <h3>
                {getAvailableReports().find(r => r.id === selectedReport)?.name}
              </h3>
              <div className="report-actions">
                <button className="action-button" onClick={handleExportPDF}>
                  <i className="bi-file-earmark-pdf"></i>
                  Download PDF
                </button>
                <button className="action-button" onClick={handleExportExcel}>
                  <i className="bi-file-earmark-excel"></i>
                  Download Excel
                </button>
                <button className="action-button" onClick={handlePrint}>
                  <i className="bi-printer"></i>
                  Print Report
                </button>
              </div>
            </div>
            {renderReportContent()}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="bi-file-earmark-bar-graph"></i>
            </div>
            <h3>No Report Selected</h3>
            <p>Choose a report type and date range to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../css/report.css';

// Extend jsPDF type to include autoTable properties
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface Transaction {
  id: string;
  date: string;
  time: string;
  cashier: string;
  items: number;
  total: number;
  paymentMethod: string;
  status: string;
  lineItems?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt?: string;
}

interface SalesMetrics {
  totalSales: number;
  totalTransactions: number;
  avgTransaction: number;
  todaysSales: number;
  topProducts: Array<{
    name: string;
    sales: number;
    units: number;
  }>;
  dailySales: Array<{
    day: string;
    sales: number;
  }>;
}

const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString()}`;
};

const formatCurrencyForPDF = (amount: number): string => {
  return `PHP ${amount.toLocaleString()}`;
};

// Fetch transactions from the same API as TransactionRecord
const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await fetch('/api/transactions');
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    const result = await response.json();
    
    // The backend returns { success: true, data: [...] } format
    const transactions = result.data || result;
    
    // Transform database data to match our Transaction interface
    return transactions.map((dbTransaction: any) => ({
      id: dbTransaction.transactionId,
      date: new Date(dbTransaction.createdAt).toLocaleDateString(),
      time: new Date(dbTransaction.createdAt).toLocaleTimeString(),
      cashier: dbTransaction.cashierName && dbTransaction.cashierName !== 'Unknown' 
               ? dbTransaction.cashierName
               : dbTransaction.cashier?.firstName && dbTransaction.cashier?.lastName
               ? `${dbTransaction.cashier.firstName} ${dbTransaction.cashier.lastName}`
               : dbTransaction.cashier?.username
               ? dbTransaction.cashier.username
               : 'Unknown Cashier',
      items: dbTransaction.items?.length || 0,
      total: dbTransaction.totalAmount,
      paymentMethod: dbTransaction.paymentMethod,
      status: dbTransaction.status === 'completed' ? 'Completed' : 
              dbTransaction.status === 'refunded' ? 'Refunded' : 'Pending',
      lineItems: dbTransaction.items?.map((item: any) => ({
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.unitPrice
      })) || [],
      createdAt: dbTransaction.createdAt
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Calculate sales metrics from transaction data
const calculateMetrics = (transactions: Transaction[]): SalesMetrics => {
  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = transactions.length;
  const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  
  // Calculate today's sales
  const today = new Date().toLocaleDateString();
  const todaysSales = transactions
    .filter(t => t.date === today)
    .reduce((sum, t) => sum + t.total, 0);
  
  // Calculate top products
  const productMap = new Map<string, { sales: number; units: number }>();
  
  transactions.forEach(transaction => {
    transaction.lineItems?.forEach(item => {
      const existing = productMap.get(item.name) || { sales: 0, units: 0 };
      productMap.set(item.name, {
        sales: existing.sales + (item.price * item.quantity),
        units: existing.units + item.quantity
      });
    });
  });
  
  const topProducts = Array.from(productMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
  
  // Calculate daily sales for last 7 days
  const dailySales = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString();
    const dayName = days[date.getDay()];
    
    const daySales = transactions
      .filter(t => t.date === dateStr)
      .reduce((sum, t) => sum + t.total, 0);
    
    dailySales.push({ day: dayName, sales: daySales });
  }
  
  return {
    totalSales,
    totalTransactions,
    avgTransaction,
    todaysSales,
    topProducts,
    dailySales
  };
};

const SalesSummaryReport: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalSales: 0,
    totalTransactions: 0,
    avgTransaction: 0,
    todaysSales: 0,
    topProducts: [],
    dailySales: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    const loadTransactionData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTransactions();
        setTransactions(data);
        setMetrics(calculateMetrics(data));
      } catch (err) {
        setError('Failed to load transaction data');
        console.error('Error loading transaction data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactionData();
  }, []);

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let yPosition = margin;

      // Header
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Sales Summary Report', margin, yPosition);
      yPosition += 8;

      // Subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Comprehensive sales analysis and transaction insights', margin, yPosition);
      yPosition += 15;

      // Company info and date
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();
      doc.text(`Generated on: ${currentDate} at ${currentTime}`, margin, yPosition);
      doc.text(`Total Transactions Analyzed: ${metrics.totalTransactions}`, pageWidth - margin - 80, yPosition);
      yPosition += 20;

      // Sales Metrics Summary
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Sales Overview', margin, yPosition);
      yPosition += 10;

      const summaryData = [
        ['Total Sales Revenue', formatCurrencyForPDF(metrics.totalSales)],
        ['Total Transactions', metrics.totalTransactions.toString()],
        ['Average Transaction Value', formatCurrencyForPDF(metrics.avgTransaction)],
        ['Today\'s Sales', formatCurrencyForPDF(metrics.todaysSales)]
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { 
          fillColor: [41, 128, 185], 
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11
        },
        bodyStyles: { fontSize: 10 },
        styles: { 
          fontSize: 10,
          cellPadding: 8
        },
        margin: { left: margin, right: margin }
      });

      yPosition = doc.lastAutoTable.finalY + 20;

      // Payment Method Breakdown
      const cashTransactions = transactions.filter(t => t.paymentMethod === 'cash').length;
      const cardTransactions = transactions.filter(t => t.paymentMethod === 'card').length;
      
      if (cashTransactions > 0 || cardTransactions > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Method Analysis', margin, yPosition);
        yPosition += 10;

        const paymentData = [
          ['Cash Transactions', cashTransactions.toString(), `${((cashTransactions / metrics.totalTransactions) * 100).toFixed(1)}%`],
          ['Card Transactions', cardTransactions.toString(), `${((cardTransactions / metrics.totalTransactions) * 100).toFixed(1)}%`]
        ];

        autoTable(doc, {
          startY: yPosition,
          head: [['Payment Method', 'Count', 'Percentage']],
          body: paymentData,
          theme: 'striped',
          headStyles: { 
            fillColor: [46, 204, 113], 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: { fontSize: 10 },
          margin: { left: margin, right: margin }
        });

        yPosition = doc.lastAutoTable.finalY + 20;
      }

      // Top Selling Products
      if (metrics.topProducts.length > 0) {
        // Check if we need a new page
        if (yPosition > pageHeight - 100) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Top Selling Products', margin, yPosition);
        yPosition += 10;

        const productsData = metrics.topProducts.map((product, index) => [
          `${index + 1}`,
          product.name,
          product.units.toString(),
          formatCurrencyForPDF(product.sales),
          formatCurrencyForPDF(product.sales / product.units)
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Rank', 'Product Name', 'Units Sold', 'Total Sales', 'Avg Price']],
          body: productsData,
          theme: 'striped',
          headStyles: { 
            fillColor: [230, 126, 34], 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: { fontSize: 9 },
          margin: { left: margin, right: margin }
        });

        yPosition = doc.lastAutoTable.finalY + 20;
      }

      // Daily Sales Trend
      if (metrics.dailySales.length > 0) {
        // Check if we need a new page
        if (yPosition > pageHeight - 120) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('7-Day Sales Trend', margin, yPosition);
        yPosition += 10;

        const dailySalesData = metrics.dailySales.map(day => [
          day.day,
          formatCurrencyForPDF(day.sales),
          day.sales === 0 ? 'No Sales' : 'Active'
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Day', 'Sales Amount', 'Status']],
          body: dailySalesData,
          theme: 'grid',
          headStyles: { 
            fillColor: [155, 89, 182], 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: { fontSize: 10 },
          margin: { left: margin, right: margin }
        });

        yPosition = doc.lastAutoTable.finalY + 20;
      }

      // Recent Transactions Summary (if space allows)
      if (transactions.length > 0 && yPosition < pageHeight - 100) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Recent Transactions Summary', margin, yPosition);
        yPosition += 10;

        const recentTransactions = transactions.slice(0, 10).map(transaction => [
          transaction.id,
          transaction.date,
          transaction.cashier,
          formatCurrencyForPDF(transaction.total),
          transaction.paymentMethod.toUpperCase(),
          transaction.status
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Transaction ID', 'Date', 'Cashier', 'Amount', 'Payment', 'Status']],
          body: recentTransactions,
          theme: 'striped',
          headStyles: { 
            fillColor: [52, 73, 94], 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: { fontSize: 8 },
          margin: { left: margin, right: margin }
        });
      }

      // Footer
      const totalPages = doc.internal.pages.length - 1; // -1 because pages array includes a null first element
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Sales Summary Report | Page ${i} of ${totalPages} | Generated by TINDAHAN Store Management System`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const fileName = `Sales_Summary_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="report-content">
        <div className="loading-state">
          <i className="bi-arrow-repeat spinning"></i>
          <span>Loading sales report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-content">
        <div className="error-state">
          <i className="bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      </div>
    );
  }
  const maxDailySales = Math.max(...metrics.dailySales.map(d => d.sales), 1);

  return (
    <div className="report-content">
      {/* Export Header */}
      <div className="export-header">
        <div className="export-info">
          <h3>Sales Summary Report</h3>
          <p>Real-time data from transaction history</p>
        </div>
        <div className="export-actions">
          <button 
            className={`export-btn ${isExporting ? 'exporting' : ''}`}
            onClick={exportToPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <i className="bi-arrow-clockwise loading-spin"></i>
                Generating PDF...
              </>
            ) : (
              <>
                <i className="bi-file-earmark-pdf"></i>
                Export to PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-currency-dollar"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(metrics.totalSales)}</h3>
            <p>Total Sales</p>
            <div className="metric-detail">{transactions.length} transactions</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-receipt"></i>
          </div>
          <div className="metric-info">
            <h3>{metrics.totalTransactions.toLocaleString()}</h3>
            <p>Total Transactions</p>
            <div className="metric-detail">All time</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-graph-up"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(metrics.avgTransaction)}</h3>
            <p>Avg Transaction</p>
            <div className="metric-detail">Per transaction</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-calendar-day"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(metrics.todaysSales)}</h3>
            <p>Today's Sales</p>
            <div className="metric-detail">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Top Selling Products</h4>
          <div className="product-list">
            {metrics.topProducts.length > 0 ? (
              metrics.topProducts.map((product, index) => (
                <div key={index} className="product-item">
                  <span className="product-name">{product.name}</span>
                  <span className="product-sales">{formatCurrency(product.sales)}</span>
                  <span className="product-units">{product.units} units</span>
                </div>
              ))
            ) : (
              <div className="no-data">
                <i className="bi-box"></i>
                <span>No product sales data available</span>
              </div>
            )}
          </div>
        </div>

        <div className="report-section">
          <h4>Sales Trend (Last 7 Days)</h4>
          <div className="line-chart">
            <div className="chart-bars">
              {metrics.dailySales.map((day, index) => (
                <div 
                  key={index}
                  className="bar" 
                  style={{ 
                    height: maxDailySales > 0 ? `${(day.sales / maxDailySales) * 100}%` : '0%' 
                  }} 
                  data-value={formatCurrency(day.sales)}
                  title={`${day.day}: ${formatCurrency(day.sales)}`}
                ></div>
              ))}
            </div>
            <div className="chart-labels">
              {metrics.dailySales.map((day, index) => (
                <span key={index}>{day.day}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Recent Transaction Summary</h4>
          <div className="transaction-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Cash Transactions:</span>
                <span className="stat-value">
                  {transactions.filter(t => t.paymentMethod === 'cash').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Card Transactions:</span>
                <span className="stat-value">
                  {transactions.filter(t => t.paymentMethod === 'card').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completed:</span>
                <span className="stat-value">
                  {transactions.filter(t => t.status === 'Completed').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Items Sold:</span>
                <span className="stat-value">
                  {transactions.reduce((sum, t) => sum + t.items, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesSummaryReport;

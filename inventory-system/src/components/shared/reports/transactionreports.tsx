import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../../contexts/AuthContext';
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

interface TransactionMetrics {
  totalTransactions: number;
  totalSales: number;
  avgTransaction: number;
  todaysTransactions: number;
  todaysSales: number;
  weeklyTransactions: number;
  weeklySales: number;
  monthlyTransactions: number;
  monthlySales: number;
  paymentBreakdown: {
    cash: number;
    card: number;
  };
  hourlyDistribution: Array<{
    hour: string;
    count: number;
    sales: number;
  }>;
  topCashiers: Array<{
    name: string;
    transactions: number;
    sales: number;
    avgTransaction: number;
    percentage: number;
  }>;
  recentTransactions: Transaction[];
}

const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString()}`;
};

const formatCurrencyForPDF = (amount: number): string => {
  return `PHP ${amount.toLocaleString()}`;
};

const TransactionReport: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<TransactionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactionMetrics();
  }, [user]);

  const fetchTransactionMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch transactions based on user role
      let url = '/api/transactions';
      if (user && user.role && user.role.toString().toUpperCase() === 'CASHIER') {
        url += `?cashierId=${user.id}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const result = await response.json();
      const transactions = result.data || result;

      // Calculate metrics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

      const todaysTransactions = transactions.filter((t: any) => 
        new Date(t.createdAt) >= today
      );

      const weeklyTransactions = transactions.filter((t: any) => 
        new Date(t.createdAt) >= weekAgo
      );

      const monthlyTransactions = transactions.filter((t: any) => 
        new Date(t.createdAt) >= monthAgo
      );

      // Payment method breakdown
      const cashTransactions = transactions.filter((t: any) => 
        t.paymentMethod?.toLowerCase() === 'cash'
      );
      const cardTransactions = transactions.filter((t: any) => 
        t.paymentMethod?.toLowerCase() === 'card'
      );

      // Hourly distribution
      const hourlyData: { [key: string]: { count: number; sales: number } } = {};
      todaysTransactions.forEach((t: any) => {
        const hour = new Date(t.createdAt).getHours();
        const hourKey = `${hour}:00`;
        if (!hourlyData[hourKey]) {
          hourlyData[hourKey] = { count: 0, sales: 0 };
        }
        hourlyData[hourKey].count++;
        hourlyData[hourKey].sales += t.totalAmount;
      });

      // Top cashiers (for admin/manager view)
      const cashierData: { [key: string]: { transactions: number; sales: number } } = {};
      if (user?.role?.toString().toUpperCase() !== 'CASHIER') {
        transactions.forEach((t: any) => {
          const cashierName = t.cashierName || t.cashier?.firstName + ' ' + t.cashier?.lastName || 'Unknown';
          if (!cashierData[cashierName]) {
            cashierData[cashierName] = { transactions: 0, sales: 0 };
          }
          cashierData[cashierName].transactions++;
          cashierData[cashierName].sales += t.totalAmount;
        });
      }

      const calculatedMetrics: TransactionMetrics = {
        totalTransactions: transactions.length,
        totalSales: transactions.reduce((sum: number, t: any) => sum + t.totalAmount, 0),
        avgTransaction: transactions.length > 0 ? 
          transactions.reduce((sum: number, t: any) => sum + t.totalAmount, 0) / transactions.length : 0,
        todaysTransactions: todaysTransactions.length,
        todaysSales: todaysTransactions.reduce((sum: number, t: any) => sum + t.totalAmount, 0),
        weeklyTransactions: weeklyTransactions.length,
        weeklySales: weeklyTransactions.reduce((sum: number, t: any) => sum + t.totalAmount, 0),
        monthlyTransactions: monthlyTransactions.length,
        monthlySales: monthlyTransactions.reduce((sum: number, t: any) => sum + t.totalAmount, 0),
        paymentBreakdown: {
          cash: cashTransactions.reduce((sum: number, t: any) => sum + t.totalAmount, 0),
          card: cardTransactions.reduce((sum: number, t: any) => sum + t.totalAmount, 0)
        },
        hourlyDistribution: Object.entries(hourlyData).map(([hour, data]) => ({
          hour,
          count: data.count,
          sales: data.sales
        })).sort((a, b) => a.hour.localeCompare(b.hour)),
        topCashiers: Object.entries(cashierData).map(([name, data]) => ({
          name,
          transactions: data.transactions,
          sales: data.sales,
          avgTransaction: data.transactions > 0 ? data.sales / data.transactions : 0,
          percentage: transactions.length > 0 ? (data.transactions / transactions.length) * 100 : 0
        })).sort((a, b) => b.sales - a.sales).slice(0, 5),
        recentTransactions: transactions
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map((t: any) => ({
            id: t.transactionId,
            date: new Date(t.createdAt).toLocaleDateString(),
            time: new Date(t.createdAt).toLocaleTimeString(),
            cashier: t.cashierName || (t.cashier ? `${t.cashier.firstName} ${t.cashier.lastName}` : 'System'),
            items: t.items?.length || 0,
            total: t.totalAmount,
            paymentMethod: t.paymentMethod,
            status: t.status,
            lineItems: t.items?.map((item: any) => ({
              name: item.product?.name || 'Unknown Product',
              quantity: item.quantity,
              price: item.unitPrice
            })) || []
          }))
      };

      setMetrics(calculatedMetrics);
    } catch (err) {
      console.error('Error fetching transaction metrics:', err);
      setError('Failed to load transaction data');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!metrics) return;

    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 20;

      // Professional Header with Company Branding
      doc.setFontSize(24);
      doc.setTextColor(41, 128, 185);
      doc.text('TINDAHAN Store', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 8;
      doc.setFontSize(16);
      doc.setTextColor(52, 73, 94);
      doc.text('Transaction Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 6;
      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });
      
      if (user?.role?.toString().toUpperCase() === 'CASHIER') {
        yPosition += 4;
        doc.text(`Cashier Report: ${user.firstName} ${user.lastName}`, pageWidth / 2, yPosition, { align: 'center' });
      }

      // Add separator line
      yPosition += 10;
      doc.setDrawColor(189, 195, 199);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 15;

      // Transaction Overview
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Transaction Overview', 20, yPosition);
      yPosition += 15;

      const overviewData = [
        ['Total Transactions', metrics.totalTransactions.toString()],
        ['Total Sales', formatCurrencyForPDF(metrics.totalSales)],
        ['Average Transaction', formatCurrencyForPDF(metrics.avgTransaction)],
        ['Today\'s Transactions', metrics.todaysTransactions.toString()],
        ['Today\'s Sales', formatCurrencyForPDF(metrics.todaysSales)],
        ['Weekly Transactions', metrics.weeklyTransactions.toString()],
        ['Weekly Sales', formatCurrencyForPDF(metrics.weeklySales)]
      ];

      autoTable(doc, {
        head: [['Metric', 'Value']],
        body: overviewData,
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 }
      });

      yPosition = doc.lastAutoTable.finalY + 20;

      // Payment Method Breakdown
      doc.setFontSize(16);
      doc.text('Payment Method Breakdown', 20, yPosition);
      yPosition += 15;

      const paymentData = [
        ['Cash', formatCurrencyForPDF(metrics.paymentBreakdown.cash)],
        ['Card', formatCurrencyForPDF(metrics.paymentBreakdown.card)]
      ];

      autoTable(doc, {
        head: [['Payment Method', 'Total Sales']],
        body: paymentData,
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 10 }
      });

      yPosition = doc.lastAutoTable.finalY + 20;

      // Cashier Performance Analysis (for admin/manager)
      if (user?.role?.toString().toUpperCase() !== 'CASHIER' && metrics.topCashiers.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(52, 73, 94);
        doc.text('Cashier Performance Analysis', 20, yPosition);
        yPosition += 15;

        const cashierData = metrics.topCashiers.map(cashier => [
          cashier.name,
          cashier.transactions.toString(),
          formatCurrencyForPDF(cashier.sales),
          formatCurrencyForPDF(cashier.avgTransaction),
          `${cashier.percentage.toFixed(1)}%`
        ]);

        autoTable(doc, {
          head: [['Cashier Name', 'Total Transactions', 'Total Sales', 'Avg Transaction', 'Share %']],
          body: cashierData,
          startY: yPosition,
          theme: 'striped',
          headStyles: { 
            fillColor: [155, 89, 182],
            textColor: 255,
            fontSize: 11,
            fontStyle: 'bold'
          },
          styles: { 
            fontSize: 10,
            cellPadding: 4
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        });

        yPosition = doc.lastAutoTable.finalY + 20;
      }

      // Recent Transactions
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.text('Recent Transactions', 20, yPosition);
      yPosition += 15;

      const transactionData = metrics.recentTransactions.slice(0, 15).map(transaction => [
        transaction.id,
        transaction.date,
        transaction.time,
        transaction.cashier,
        transaction.items.toString(),
        formatCurrencyForPDF(transaction.total),
        transaction.paymentMethod,
        transaction.status
      ]);

      autoTable(doc, {
        head: [['Transaction ID', 'Date', 'Time', 'Cashier', 'Items', 'Total', 'Payment', 'Status']],
        body: transactionData,
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] },
        styles: { fontSize: 8 }
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.height - 10);
        doc.text('TINDAHAN Store - Transaction Report', 20, doc.internal.pageSize.height - 10);
      }

      doc.save(`transaction-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="report-content">
        <div className="loading-state">
          <i className="bi-arrow-clockwise loading-spin"></i>
          <p>Loading transaction data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-content">
        <div className="error-state">
          <i className="bi-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchTransactionMetrics} className="retry-btn">
            <i className="bi-arrow-clockwise"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="report-content">
        <div className="empty-state">
          <i className="bi-receipt"></i>
          <p>No transaction data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-report-container">
      {/* Header Section */}
      <div className="transaction-report-header">
        <div className="header-info">
          <h1 className="report-title">
            <i className="bi-receipt"></i>
            {user?.role?.toString().toUpperCase() === 'CASHIER' ? 'My Transaction Report' : 'Transaction Report'}
          </h1>
          <p className="report-subtitle">
            {user?.role?.toString().toUpperCase() === 'CASHIER' 
              ? 'Your personal transaction analytics and performance metrics' 
              : 'Comprehensive transaction analytics and cashier performance overview'
            }
          </p>
          <div className="report-meta">
            <span className="meta-item">
              <i className="bi-calendar3"></i>
              Generated: {new Date().toLocaleDateString()}
            </span>
            <span className="meta-item">
              <i className="bi-clock"></i>
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={exportToPDF}
            disabled={isExporting}
            className="export-btn"
          >
            {isExporting ? (
              <>
                <i className="bi-arrow-clockwise loading-spin"></i>
                Generating PDF...
              </>
            ) : (
              <>
                <i className="bi-file-earmark-pdf"></i>
                Export PDF
              </>
            )}
          </button>
          <button 
            onClick={fetchTransactionMetrics}
            disabled={isLoading}
            className="refresh-btn"
          >
            <i className={`bi-arrow-clockwise ${isLoading ? 'loading-spin' : ''}`}></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-calendar-day"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(metrics.todaysSales)}</h3>
            <p>Today's Sales</p>
            <div className="metric-trend positive">
              {metrics.todaysTransactions} transactions
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-calendar-week"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(metrics.weeklySales)}</h3>
            <p>This Week</p>
            <div className="metric-trend positive">
              {metrics.weeklyTransactions} transactions
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-calendar-month"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(metrics.monthlySales)}</h3>
            <p>This Month</p>
            <div className="metric-trend positive">
              {metrics.monthlyTransactions} transactions
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-graph-up"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(metrics.avgTransaction)}</h3>
            <p>Avg Transaction</p>
            <div className="metric-trend neutral">
              {metrics.totalTransactions} total
            </div>
          </div>
        </div>
      </div>

      {/* Report Sections */}
      <div className="report-sections">
        {/* Recent Transactions */}
        <div className="report-section">
          <h4>Recent Transactions</h4>
          <div className="transaction-list">
            {metrics.recentTransactions.slice(0, 8).map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <span className="txn-id">{transaction.id}</span>
                <span className="txn-time">{transaction.time}</span>
                <span className="txn-cashier">{transaction.cashier}</span>
                <span className="txn-amount">{formatCurrency(transaction.total)}</span>
                <span className="txn-items">{transaction.items} items</span>
                <span className={`txn-status ${transaction.status.toLowerCase()}`}>
                  {transaction.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="report-section">
          <h4>Payment Methods</h4>
          <div className="payment-breakdown">
            <div className="payment-item">
              <div className="payment-info">
                <span className="payment-method">
                  <i className="bi-cash"></i> Cash
                </span>
                <span className="payment-amount">{formatCurrency(metrics.paymentBreakdown.cash)}</span>
              </div>
              <div className="payment-bar">
                <div 
                  className="payment-fill cash" 
                  style={{ 
                    width: `${(metrics.paymentBreakdown.cash / (metrics.paymentBreakdown.cash + metrics.paymentBreakdown.card)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="payment-item">
              <div className="payment-info">
                <span className="payment-method">
                  <i className="bi-credit-card"></i> Card
                </span>
                <span className="payment-amount">{formatCurrency(metrics.paymentBreakdown.card)}</span>
              </div>
              <div className="payment-bar">
                <div 
                  className="payment-fill card" 
                  style={{ 
                    width: `${(metrics.paymentBreakdown.card / (metrics.paymentBreakdown.cash + metrics.paymentBreakdown.card)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Distribution */}
        {metrics.hourlyDistribution.length > 0 && (
          <div className="report-section">
            <h4>Today's Hourly Activity</h4>
            <div className="hourly-chart">
              <div className="chart-bars">
                {metrics.hourlyDistribution.map((hour) => {
                  const maxCount = Math.max(...metrics.hourlyDistribution.map(h => h.count));
                  const height = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
                  return (
                    <div 
                      key={hour.hour} 
                      className="hour-bar" 
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${hour.hour}: ${hour.count} transactions, ${formatCurrency(hour.sales)}`}
                    >
                      <span className="hour-value">{hour.count}</span>
                    </div>
                  );
                })}
              </div>
              <div className="chart-labels">
                {metrics.hourlyDistribution.map((hour) => (
                  <span key={hour.hour}>{hour.hour}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cashier Performance Analysis (for admin/manager view) */}
        {user?.role?.toString().toUpperCase() !== 'CASHIER' && metrics.topCashiers.length > 0 && (
          <div className="report-section cashier-performance-section">
            <div className="section-header">
              <h4>
                <i className="bi-trophy"></i>
                Cashier Performance Analysis
              </h4>
              <p className="section-subtitle">Top performing cashiers ranked by sales volume</p>
            </div>
            
            <div className="cashier-performance-grid">
              {metrics.topCashiers.map((cashier, index) => (
                <div key={cashier.name} className={`cashier-card rank-${index + 1}`}>
                  <div className="card-header">
                    <div className="rank-badge">
                      <span className="rank-number">#{index + 1}</span>
                      {index === 0 && <i className="bi-trophy-fill trophy-gold"></i>}
                      {index === 1 && <i className="bi-award-fill trophy-silver"></i>}
                      {index === 2 && <i className="bi-award trophy-bronze"></i>}
                    </div>
                    <div className="cashier-info">
                      <h5 className="cashier-name">{cashier.name}</h5>
                      <span className="cashier-title">Sales Associate</span>
                    </div>
                  </div>
                  
                  <div className="performance-metrics">
                    <div className="metric-item">
                      <div className="metric-icon">
                        <i className="bi-receipt"></i>
                      </div>
                      <div className="metric-details">
                        <span className="metric-value">{cashier.transactions}</span>
                        <span className="metric-label">Transactions</span>
                      </div>
                    </div>
                    
                    <div className="metric-item">
                      <div className="metric-icon">
                        <i className="bi-currency-dollar"></i>
                      </div>
                      <div className="metric-details">
                        <span className="metric-value">{formatCurrency(cashier.sales)}</span>
                        <span className="metric-label">Total Sales</span>
                      </div>
                    </div>
                    
                    <div className="metric-item">
                      <div className="metric-icon">
                        <i className="bi-graph-up"></i>
                      </div>
                      <div className="metric-details">
                        <span className="metric-value">{formatCurrency(cashier.avgTransaction)}</span>
                        <span className="metric-label">Avg Transaction</span>
                      </div>
                    </div>
                    
                    <div className="metric-item">
                      <div className="metric-icon">
                        <i className="bi-pie-chart"></i>
                      </div>
                      <div className="metric-details">
                        <span className="metric-value">{cashier.percentage.toFixed(1)}%</span>
                        <span className="metric-label">Market Share</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="performance-bar">
                    <div 
                      className="performance-fill" 
                      style={{ width: `${Math.min(cashier.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionReport;

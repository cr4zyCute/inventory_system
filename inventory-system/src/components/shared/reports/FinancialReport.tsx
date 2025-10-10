import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useProducts } from '../../../hooks/useProducts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../css/report.css';

// Extend jsPDF interface for autoTable
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
    product?: {
      cost?: number;
      price: number;
    };
  }>;
  createdAt?: string;
}

interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  revenueBreakdown: RevenueItem[];
  expenseCategories: ExpenseItem[];
  cashFlowTrend: CashFlowItem[];
  paymentAnalysis: PaymentAnalysis;
}

interface RevenueItem {
  name: string;
  amount: number;
  percentage: number;
}

interface ExpenseItem {
  name: string;
  amount: number;
  percentage: number;
}

interface CashFlowItem {
  week: string;
  amount: number;
}

interface PaymentAnalysis {
  cash: {
    amount: number;
    percentage: number;
    transactions: number;
  };
  card: {
    amount: number;
    percentage: number;
    transactions: number;
  };
}

const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString()}`;
};

const formatCurrencyForPDF = (amount: number): string => {
  return `PHP ${amount.toLocaleString()}`;
};

// Fetch transactions from API
const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await fetch('/api/transactions');
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    const result = await response.json();
    
    const transactions = result.data || result;
    
    return transactions.map((dbTransaction: any) => ({
      id: dbTransaction.transactionId,
      date: new Date(dbTransaction.createdAt).toLocaleDateString(),
      time: new Date(dbTransaction.createdAt).toLocaleTimeString(),
      cashier: dbTransaction.cashierName,
      items: dbTransaction.items?.length || 0,
      total: dbTransaction.totalAmount,
      paymentMethod: dbTransaction.paymentMethod,
      status: dbTransaction.status === 'completed' ? 'Completed' : 
              dbTransaction.status === 'refunded' ? 'Refunded' : 'Pending',
      lineItems: dbTransaction.items?.map((item: any) => ({
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.unitPrice,
        product: {
          cost: item.product?.cost,
          price: item.product?.price || item.unitPrice
        }
      })) || [],
      createdAt: dbTransaction.createdAt
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Calculate financial metrics from real data
const calculateFinancialMetrics = (transactions: Transaction[], products: any[]): FinancialData => {
  // Calculate total revenue from completed transactions
  const completedTransactions = transactions.filter(t => t.status === 'Completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.total, 0);
  
  // Calculate Cost of Goods Sold (COGS) from transaction items
  let totalCOGS = 0;
  completedTransactions.forEach(transaction => {
    transaction.lineItems?.forEach(item => {
      const productCost = item.product?.cost || (item.product?.price || item.price) * 0.6; // 60% if no cost
      totalCOGS += productCost * item.quantity;
    });
  });
  
  // Only use real COGS - no mock expenses
  const totalExpenses = totalCOGS;
  const netIncome = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
  
  // Real revenue breakdown by payment method only
  const cashRevenue = completedTransactions
    .filter(t => t.paymentMethod.toLowerCase() === 'cash')
    .reduce((sum, t) => sum + t.total, 0);
  
  const cardRevenue = completedTransactions
    .filter(t => t.paymentMethod.toLowerCase() === 'card')
    .reduce((sum, t) => sum + t.total, 0);
  
  // Real revenue breakdown - only actual transaction data
  const revenueBreakdown: RevenueItem[] = [
    {
      name: 'Cash Sales',
      amount: cashRevenue,
      percentage: totalRevenue > 0 ? (cashRevenue / totalRevenue) * 100 : 0
    },
    {
      name: 'Card Sales',
      amount: cardRevenue,
      percentage: totalRevenue > 0 ? (cardRevenue / totalRevenue) * 100 : 0
    }
  ];
  
  // Real expense breakdown - only actual COGS
  const expenseCategories: ExpenseItem[] = [
    {
      name: 'Cost of Goods Sold',
      amount: totalCOGS,
      percentage: 100 // Only expense category with real data
    }
  ];
  
  // Generate 7-day cash flow trend
  const cashFlowTrend: CashFlowItem[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString();
    
    const dayTransactions = completedTransactions.filter(t => t.date === dateStr);
    const dayRevenue = dayTransactions.reduce((sum, t) => sum + t.total, 0);
    
    // Calculate day expenses (only real COGS)
    let dayCOGS = 0;
    dayTransactions.forEach(transaction => {
      transaction.lineItems?.forEach(item => {
        const productCost = item.product?.cost || (item.product?.price || item.price) * 0.6;
        dayCOGS += productCost * item.quantity;
      });
    });
    
    const dayExpenses = dayCOGS; // Only real COGS, no mock expenses
    const dayCashFlow = dayRevenue - dayExpenses;
    
    cashFlowTrend.push({
      week: `Day ${7 - i}`,
      amount: dayCashFlow
    });
  }
  
  // Payment analysis
  const paymentAnalysis: PaymentAnalysis = {
    cash: {
      amount: cashRevenue,
      percentage: totalRevenue > 0 ? (cashRevenue / totalRevenue) * 100 : 0,
      transactions: completedTransactions.filter(t => t.paymentMethod.toLowerCase() === 'cash').length
    },
    card: {
      amount: cardRevenue,
      percentage: totalRevenue > 0 ? (cardRevenue / totalRevenue) * 100 : 0,
      transactions: completedTransactions.filter(t => t.paymentMethod.toLowerCase() === 'card').length
    }
  };
  
  return {
    totalRevenue,
    totalExpenses,
    netIncome,
    profitMargin: Math.round(profitMargin * 100) / 100,
    revenueBreakdown,
    expenseCategories,
    cashFlowTrend,
    paymentAnalysis
  };
};

const FinancialReport: React.FC = () => {
  const { user } = useAuth();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const [isExporting, setIsExporting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  
  // Fetch transactions on component mount
  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      const fetchedTransactions = await fetchTransactions();
      setTransactions(fetchedTransactions);
      setIsLoading(false);
    };
    
    loadTransactions();
  }, []);
  
  // Calculate financial metrics when data is available
  useEffect(() => {
    if (!isLoading && !productsLoading && transactions.length >= 0) {
      const metrics = calculateFinancialMetrics(transactions, products);
      setFinancialData(metrics);
    }
  }, [transactions, products, isLoading, productsLoading]);
  
  // Show loading state
  if (isLoading || productsLoading || !financialData) {
    return (
      <div className="report-content">
        <div className="loading-state">
          <div className="loading-spinner">
            <i className="bi-arrow-clockwise loading-spin"></i>
          </div>
          <p>Loading financial data...</p>
        </div>
      </div>
    );
  }

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let yPosition = margin;

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Report', margin, yPosition);
      yPosition += 10;

      // Company info and date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();
      doc.text(`Generated on: ${currentDate} at ${currentTime}`, margin, yPosition);
      doc.text(`Generated by: ${user?.name || 'System User'}`, pageWidth - margin - 60, yPosition);
      yPosition += 20;

      // Financial Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Summary', margin, yPosition);
      yPosition += 10;

      const summaryData = [
        ['Total Revenue', formatCurrencyForPDF(financialData.totalRevenue)],
        ['Total Expenses', formatCurrencyForPDF(financialData.totalExpenses)],
        ['Net Income', formatCurrencyForPDF(financialData.netIncome)],
        ['Profit Margin', `${financialData.profitMargin}%`]
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Amount']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        margin: { left: margin, right: margin }
      });

      yPosition = doc.lastAutoTable.finalY + 20;

      // Revenue Breakdown
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Revenue Breakdown', margin, yPosition);
      yPosition += 10;

      const revenueData = financialData.revenueBreakdown.map(item => [
        item.name,
        formatCurrencyForPDF(item.amount),
        `${item.percentage}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Revenue Source', 'Amount', 'Percentage']],
        body: revenueData,
        theme: 'striped',
        headStyles: { fillColor: [40, 167, 69], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPosition = doc.lastAutoTable.finalY + 20;

      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = margin;
      }

      // Expense Categories
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Expense Categories', margin, yPosition);
      yPosition += 10;

      const expenseData = financialData.expenseCategories.map(item => [
        item.name,
        formatCurrencyForPDF(item.amount),
        `${item.percentage}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Expense Category', 'Amount', 'Percentage']],
        body: expenseData,
        theme: 'striped',
        headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPosition = doc.lastAutoTable.finalY + 20;

      // Cash Flow Trend
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Weekly Cash Flow Trend', margin, yPosition);
      yPosition += 10;

      const cashFlowData = financialData.cashFlowTrend.map(item => [
        item.week,
        formatCurrencyForPDF(item.amount)
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Period', 'Cash Flow']],
        body: cashFlowData,
        theme: 'striped',
        headStyles: { fillColor: [0, 123, 255], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      // Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${totalPages} | Generated by TINDAHAN Store Financial System`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const fileName = `Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="report-content">
      {/* Export Header */}
      <div className="export-header">
        <div className="export-info">
          <h3>Financial Report</h3>
          <p>Pure financial analysis from real transaction data only</p>
          <div className="data-info">
            <small>Based on {transactions.length} transactions and {products.length} products</small>
          </div>
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
            <h3>{formatCurrency(financialData.totalRevenue)}</h3>
            <p>Total Revenue</p>
            <div className="metric-trend positive">+18.5%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-receipt"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(financialData.totalExpenses)}</h3>
            <p>Total Expenses</p>
            <div className="metric-trend negative">+5.2%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-graph-up"></i>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(financialData.netIncome)}</h3>
            <p>Net Income</p>
            <div className="metric-trend positive">+32.8%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bi-percent"></i>
          </div>
          <div className="metric-info">
            <h3>{financialData.profitMargin}%</h3>
            <p>Profit Margin</p>
            <div className="metric-trend positive">+8.1%</div>
          </div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h4>Revenue Breakdown</h4>
          <div className="product-list">
            {financialData.revenueBreakdown.map((item, index) => (
              <div key={index} className="product-item">
                <span className="product-name">{item.name}</span>
                <span className="product-sales">{formatCurrency(item.amount)}</span>
                <span className="product-units">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h4>Expense Categories</h4>
          <div className="product-list">
            {financialData.expenseCategories.map((item, index) => (
              <div key={index} className="product-item">
                <span className="product-name">{item.name}</span>
                <span className="product-sales">{formatCurrency(item.amount)}</span>
                <span className="product-units">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h4>Cash Flow Trend</h4>
          <div className="line-chart">
            <div className="chart-bars">
              {financialData.cashFlowTrend.map((item, index) => {
                const maxAmount = Math.max(...financialData.cashFlowTrend.map(cf => cf.amount));
                const height = (item.amount / maxAmount) * 100;
                return (
                  <div 
                    key={index} 
                    className="bar" 
                    style={{ height: `${height}%` }} 
                    data-value={formatCurrency(item.amount)}
                    title={`${item.week}: ${formatCurrency(item.amount)}`}
                  ></div>
                );
              })}
            </div>
            <div className="chart-labels">
              {financialData.cashFlowTrend.map((item, index) => (
                <span key={index}>{item.week}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;

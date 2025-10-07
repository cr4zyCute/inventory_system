import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  useSalesReport, 
  useInventoryReport, 
  useUserSalesReport, 
  useDailyTransactionsReport,
  useDashboardAnalytics 
} from '../../hooks/useReports';
import jsPDF from 'jspdf';
import './css/report.css';

interface ReportType {
  id: string;
  name: string;
  icon: string;
}

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

interface SalesReportData {
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  topProducts: Product[];
}

interface InventoryReportData {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  lowStockProducts: LowStockProduct[];
}

interface UserSalesReportData {
  totalSales: number;
  totalTransactions: number;
  todaySales: number;
  todayTransactions: number;
  weekSales: number;
  recentTransactions: Transaction[];
}

type ReportData = SalesReportData | InventoryReportData | UserSalesReportData;

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // API hooks for different reports
  const salesReport = useSalesReport(dateRange);
  const inventoryReport = useInventoryReport();
  const userSalesReport = useUserSalesReport(dateRange);
  const dailyTransactionsReport = useDailyTransactionsReport(dateRange);
  const dashboardAnalytics = useDashboardAnalytics();

  // Get current report data based on selected report
  const getCurrentReportData = () => {
    switch (selectedReport) {
      case 'sales-summary':
        return salesReport.data;
      case 'inventory-overview':
        return inventoryReport.data;
      case 'my-sales':
        return userSalesReport.data;
      case 'daily-transactions':
        return dailyTransactionsReport.data;
      default:
        return null;
    }
  };

  // Get loading state for current report
  const getCurrentLoadingState = () => {
    switch (selectedReport) {
      case 'sales-summary':
        return salesReport.isLoading;
      case 'inventory-overview':
        return inventoryReport.isLoading;
      case 'my-sales':
        return userSalesReport.isLoading;
      case 'daily-transactions':
        return dailyTransactionsReport.isLoading;
      default:
        return false;
    }
  };

  const reportData = getCurrentReportData();
  const loading = getCurrentLoadingState();

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

  // Trigger report generation by refetching data
  const handleGenerateReport = async (): Promise<void> => {
    if (!selectedReport) return;
    
    setReportGenerated(true);
    
    // Refetch the appropriate report data
    switch (selectedReport) {
      case 'sales-summary':
        await salesReport.refetch();
        break;
      case 'inventory-overview':
        await inventoryReport.refetch();
        break;
      case 'my-sales':
        await userSalesReport.refetch();
        break;
      case 'daily-transactions':
        await dailyTransactionsReport.refetch();
        break;
    }
  };

  // Reset report generated state when report selection changes
  React.useEffect(() => {
    setReportGenerated(false);
  }, [selectedReport]);

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
      const doc = new jsPDF();
        
      // Add centered title (matching print UI)
      doc.setFontSize(24);
      doc.setTextColor(79, 70, 229); // Purple color
      const titleWidth = doc.getTextWidth(reportName);
      doc.text(reportName, (210 - titleWidth) / 2, 30);
      
      // Add centered metadata
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102); // Gray color
      
      const generatedText = `Generated on: ${new Date().toLocaleDateString()}`;
      const generatedWidth = doc.getTextWidth(generatedText);
      doc.text(generatedText, (210 - generatedWidth) / 2, 45);
      
      const dateRangeText = `Date Range: ${dateRange.startDate} to ${dateRange.endDate}`;
      const dateRangeWidth = doc.getTextWidth(dateRangeText);
      doc.text(dateRangeText, (210 - dateRangeWidth) / 2, 55);
      
      const userText = `User: ${user?.firstName} ${user?.lastName} (${user?.role})`;
      const userWidth = doc.getTextWidth(userText);
      doc.text(userText, (210 - userWidth) / 2, 65);
      
      // Add horizontal line under header
      doc.setDrawColor(0, 0, 0);
      doc.line(20, 75, 190, 75);
      
      let yPos = 95;
      
      // Helper function to draw metrics cards (exactly like print UI)
      const drawMetricsCards = (metrics: Array<{value: string, label: string}>, startY: number): number => {
        const totalWidth = 170;
        const cardWidth = (totalWidth - 20) / 3; // 3 cards with spacing
        const cardHeight = 30;
        const cardSpacing = 10;
        const startX = 20;
        let currentY = startY;
        
        metrics.forEach((metric, index) => {
          const xPos = startX + (index * (cardWidth + cardSpacing));
          
          // Draw card border (matching print UI)
          doc.setFillColor(255, 255, 255); // White background
          doc.setDrawColor(200, 200, 200); // Light gray border
          doc.setLineWidth(0.5);
          doc.rect(xPos, currentY, cardWidth, cardHeight, 'FD');
          
          // Draw metric value (large purple text)
          doc.setFontSize(16);
          doc.setTextColor(79, 70, 229); // Purple color
          doc.setFont('helvetica', 'bold');
          const valueWidth = doc.getTextWidth(metric.value);
          doc.text(metric.value, xPos + (cardWidth - valueWidth) / 2, currentY + 12);
          
          // Draw metric label (smaller gray text)
          doc.setFontSize(9);
          doc.setTextColor(102, 102, 102); // Gray color
          doc.setFont('helvetica', 'normal');
          const labelWidth = doc.getTextWidth(metric.label);
          doc.text(metric.label, xPos + (cardWidth - labelWidth) / 2, currentY + 22);
        });
        
        return currentY + cardHeight + 20;
      };

      // Helper function to draw table (exactly matching print UI)
      const drawTable = (headers: string[], rows: string[][], startY: number, title?: string): number => {
        let currentY = startY;
        
        // Add section title if provided
        if (title) {
          doc.setFontSize(14);
          doc.setTextColor(51, 51, 51); // Dark gray
          doc.setFont('helvetica', 'normal');
          doc.text(title, 20, currentY);
          
          // Add underline (matching print UI)
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(20, currentY + 3, 190, currentY + 3);
          currentY += 20;
        }
        
        // Table settings
        const startX = 20;
        const tableWidth = 170;
        const colWidths = headers.length === 3 ? [80, 45, 45] : [tableWidth / headers.length, tableWidth / headers.length, tableWidth / headers.length];
        const rowHeight = 12;
        
        // Draw table border
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(startX, currentY, tableWidth, rowHeight + (rows.length * rowHeight), 'S');
        
        // Draw header row
        doc.setFillColor(248, 249, 250); // Light gray background
        doc.rect(startX, currentY, tableWidth, rowHeight, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        
        let xPos = startX;
        headers.forEach((header, index) => {
          doc.text(header, xPos + 5, currentY + 8);
          // Draw vertical lines
          if (index < headers.length - 1) {
            doc.line(xPos + colWidths[index], currentY, xPos + colWidths[index], currentY + rowHeight + (rows.length * rowHeight));
          }
          xPos += colWidths[index];
        });
        currentY += rowHeight;
        
        // Draw horizontal line after header
        doc.line(startX, currentY, startX + tableWidth, currentY);
        
        // Draw data rows
        doc.setFont('helvetica', 'normal');
        rows.forEach((row, rowIndex) => {
          xPos = startX;
          row.forEach((cell, cellIndex) => {
            doc.text(cell, xPos + 5, currentY + 8);
            xPos += colWidths[cellIndex];
          });
          currentY += rowHeight;
          
          // Draw horizontal line after each row (except last)
          if (rowIndex < rows.length - 1) {
            doc.setDrawColor(230, 230, 230); // Lighter gray for row separators
            doc.line(startX, currentY, startX + tableWidth, currentY);
            doc.setDrawColor(200, 200, 200); // Reset to border color
          }
          
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 30;
          }
        });
        
        return currentY + 20;
      };

      // Add content based on report type (matching print UI exactly)
      if (selectedReport === 'sales-summary') {
        const salesData = reportData as SalesReportData;
        // Sales Summary Metrics Cards
        if (salesData.totalSales) {
          const metrics = [
            { value: `P${salesData.totalSales.toLocaleString()}`, label: 'Total Sales' },
            { value: `${salesData.totalTransactions?.toLocaleString() || 'N/A'}`, label: 'Transactions' },
            { value: `P${salesData.averageTransaction?.toFixed(2) || 'N/A'}`, label: 'Avg Transaction' }
          ];
          
          yPos = drawMetricsCards(metrics, yPos);
        }
        
        // Top Products Table
        if (salesData.topProducts && salesData.topProducts.length > 0) {
          const headers = ['Product Name', 'Sales', 'Units Sold'];
          const rows = salesData.topProducts.map((product: any) => [
            product.name,
            `P${product.sales.toLocaleString()}`,
            `${product.units} units`
          ]);
          
          yPos = drawTable(headers, rows, yPos, 'Top Products');
        }
      } else if (selectedReport === 'inventory-overview') {
        const inventoryData = reportData as InventoryReportData;
        // Inventory Overview Metrics Cards
        const metrics = [
          { value: `${inventoryData.totalProducts?.toLocaleString() || 'N/A'}`, label: 'Total Products' },
          { value: `${inventoryData.lowStockItems || 'N/A'}`, label: 'Low Stock Items' },
          { value: `${inventoryData.outOfStockItems || 'N/A'}`, label: 'Out of Stock' },
          { value: `P${inventoryData.totalValue?.toLocaleString() || 'N/A'}`, label: 'Total Value' }
        ];
        
        yPos = drawMetricsCards(metrics, yPos);
        
        // Low Stock Products Table
        if (inventoryData.lowStockProducts && inventoryData.lowStockProducts.length > 0) {
          const headers = ['Product Name', 'Current Stock', 'Minimum Required', 'Category'];
          const rows = inventoryData.lowStockProducts.map((product: any) => [
            product.name,
            `${product.current}`,
            `${product.minimum}`,
            product.category
          ]);
          
          yPos = drawTable(headers, rows, yPos, 'Low Stock Alert');
        }
      } else if (selectedReport === 'my-sales' || selectedReport === 'daily-transactions') {
        const userSalesData = reportData as UserSalesReportData;
        // Sales/Transaction Metrics Cards
        const metrics = [
          { value: `P${userSalesData.todaySales?.toFixed(2) || 'N/A'}`, label: 'Today\'s Sales' },
          { value: `${userSalesData.todayTransactions || 'N/A'}`, label: 'Today\'s Transactions' },
          { value: `P${userSalesData.weekSales?.toLocaleString() || 'N/A'}`, label: 'This Week' }
        ];
        
        yPos = drawMetricsCards(metrics, yPos);
        
        // Recent Transactions Table
        if (userSalesData.recentTransactions && userSalesData.recentTransactions.length > 0) {
          const headers = ['Transaction ID', 'Time', 'Amount', 'Items'];
          const rows = userSalesData.recentTransactions.map((txn: any) => [
            txn.id,
            txn.time,
            `P${txn.amount}`,
            `${txn.items} items`
          ]);
          
          yPos = drawTable(headers, rows, yPos, 'Recent Transactions');
        }
      }
      
      // Add footer (matching print UI)
      const pageHeight = 297; // A4 height in mm
      doc.setFontSize(9);
      doc.setTextColor(102, 102, 102); // Gray color
      doc.setFont('helvetica', 'normal');
      
      const footerText = 'Inventory Management System - Confidential Report';
      const footerWidth = doc.getTextWidth(footerText);
      doc.text(footerText, (210 - footerWidth) / 2, pageHeight - 20);
      
      // Save the PDF
      doc.save(fileName);
      return;
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
      const salesData = reportData as SalesReportData;
      html += `
        <div class="metrics">
          <div class="metric">
            <h3>₱${salesData.totalSales?.toLocaleString()}</h3>
            <p>Total Sales</p>
          </div>
          <div class="metric">
            <h3>${salesData.totalTransactions?.toLocaleString()}</h3>
            <p>Transactions</p>
          </div>
          <div class="metric">
            <h3>₱${salesData.averageTransaction?.toFixed(2)}</h3>
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
              ${salesData.topProducts?.map(p => `
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
      const inventoryData = reportData as InventoryReportData;
      html += `
        <div class="metrics">
          <div class="metric">
            <h3>${inventoryData.totalProducts?.toLocaleString()}</h3>
            <p>Total Products</p>
          </div>
          <div class="metric">
            <h3>${inventoryData.lowStockItems}</h3>
            <p>Low Stock Items</p>
          </div>
          <div class="metric">
            <h3>${inventoryData.outOfStockItems}</h3>
            <p>Out of Stock</p>
          </div>
          <div class="metric">
            <h3>₱${inventoryData.totalValue?.toLocaleString()}</h3>
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
              ${inventoryData.lowStockProducts?.map(p => `
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
      const userSalesData = reportData as UserSalesReportData;
      html += `
        <div class="metrics">
          <div class="metric">
            <h3>₱${userSalesData.todaySales?.toFixed(2)}</h3>
            <p>Today's Sales</p>
          </div>
          <div class="metric">
            <h3>${userSalesData.todayTransactions}</h3>
            <p>Today's Transactions</p>
          </div>
          <div class="metric">
            <h3>₱${userSalesData.weekSales?.toLocaleString()}</h3>
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
              ${userSalesData.recentTransactions?.map(t => `
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
      const salesData = reportData as SalesReportData;
      csv += 'SALES SUMMARY\n';
      csv += `Total Sales,₱${salesData.totalSales?.toLocaleString()}\n`;
      csv += `Total Transactions,${salesData.totalTransactions?.toLocaleString()}\n`;
      csv += `Average Transaction,₱${salesData.averageTransaction?.toFixed(2)}\n\n`;
      
      csv += 'TOP PRODUCTS\n';
      csv += 'Product Name,Sales,Units Sold\n';
      salesData.topProducts?.forEach(p => {
        csv += `"${p.name}",₱${p.sales.toLocaleString()},${p.units}\n`;
      });
    } else if (selectedReport === 'inventory-overview') {
      const inventoryData = reportData as InventoryReportData;
      csv += 'INVENTORY OVERVIEW\n';
      csv += `Total Products,${inventoryData.totalProducts?.toLocaleString()}\n`;
      csv += `Low Stock Items,${inventoryData.lowStockItems}\n`;
      csv += `Out of Stock Items,${inventoryData.outOfStockItems}\n`;
      csv += `Total Value,₱${inventoryData.totalValue?.toLocaleString()}\n\n`;
      
      csv += 'LOW STOCK ALERT\n';
      csv += 'Product Name,Current Stock,Minimum Required,Category\n';
      inventoryData.lowStockProducts?.forEach(p => {
        csv += `"${p.name}",${p.current},${p.minimum},"${p.category}"\n`;
      });
    } else if (selectedReport === 'my-sales') {
      const userSalesData = reportData as UserSalesReportData;
      csv += 'MY SALES\n';
      csv += `Today's Sales,₱${userSalesData.todaySales?.toFixed(2)}\n`;
      csv += `Today's Transactions,${userSalesData.todayTransactions}\n`;
      csv += `This Week,₱${userSalesData.weekSales?.toLocaleString()}\n\n`;
      
      csv += 'RECENT TRANSACTIONS\n';
      csv += 'Transaction ID,Time,Amount,Items\n';
      userSalesData.recentTransactions?.forEach(t => {
        csv += `${t.id},"${t.time}",₱${t.amount},${t.items}\n`;
      });
    }

    return csv;
  };

  const renderReportContent = (): React.ReactElement | null => {
    if (!reportData) return null;

    switch (selectedReport) {
      case 'sales-summary': {
        const salesData = reportData as SalesReportData;
        return (
          <div className="report-content">
            <div className="report-metrics">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-currency-dollar"></i>
                </div>
                <div className="metric-info">
                  <h3>₱{salesData.totalSales?.toLocaleString()}</h3>
                  <p>Total Sales</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-receipt"></i>
                </div>
                <div className="metric-info">
                  <h3>{salesData.totalTransactions?.toLocaleString()}</h3>
                  <p>Transactions</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-graph-up"></i>
                </div>
                <div className="metric-info">
                  <h3>₱{salesData.averageTransaction?.toFixed(2)}</h3>
                  <p>Avg Transaction</p>
                </div>
              </div>
            </div>
            
            <div className="report-sections">
              <div className="report-section">
                <h4>Top Products</h4>
                <div className="product-list">
                  {salesData.topProducts?.map((product, index) => (
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
      }

      case 'inventory-overview': {
        const inventoryData = reportData as InventoryReportData;
        return (
          <div className="report-content">
            <div className="report-metrics">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-boxes"></i>
                </div>
                <div className="metric-info">
                  <h3>{inventoryData.totalProducts?.toLocaleString()}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              <div className="metric-card warning">
                <div className="metric-icon">
                  <i className="bi-exclamation-triangle"></i>
                </div>
                <div className="metric-info">
                  <h3>{inventoryData.lowStockItems}</h3>
                  <p>Low Stock</p>
                </div>
              </div>
              <div className="metric-card danger">
                <div className="metric-icon">
                  <i className="bi-x-circle"></i>
                </div>
                <div className="metric-info">
                  <h3>{inventoryData.outOfStockItems}</h3>
                  <p>Out of Stock</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-currency-dollar"></i>
                </div>
                <div className="metric-info">
                  <h3>₱{inventoryData.totalValue?.toLocaleString()}</h3>
                  <p>Total Value</p>
                </div>
              </div>
            </div>

            <div className="report-sections">
              <div className="report-section">
                <h4>Low Stock Alert</h4>
                <div className="alert-list">
                  {inventoryData.lowStockProducts?.map((product, index) => (
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
      }

      case 'my-sales': {
        const userSalesData = reportData as UserSalesReportData;
        return (
          <div className="report-content">
            <div className="report-metrics">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-calendar-day"></i>
                </div>
                <div className="metric-info">
                  <h3>₱{userSalesData.todaySales?.toFixed(2)}</h3>
                  <p>Today's Sales</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-receipt"></i>
                </div>
                <div className="metric-info">
                  <h3>{userSalesData.todayTransactions}</h3>
                  <p>Transactions</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-calendar-week"></i>
                </div>
                <div className="metric-info">
                  <h3>₱{userSalesData.weekSales?.toLocaleString()}</h3>
                  <p>This Week</p>
                </div>
              </div>
            </div>

            <div className="report-sections">
              <div className="report-section">
                <h4>Recent Transactions</h4>
                <div className="transaction-list">
                  {userSalesData.recentTransactions?.map((txn, index) => (
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
      }

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
        ) : reportGenerated && selectedReport ? (
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
            {reportData ? renderReportContent() : (
              <div className="no-data-message">
                <i className="bi-exclamation-circle"></i>
                <h4>No Data Available</h4>
                <p>Unable to load report data. Please try again or check your date range.</p>
                <button onClick={handleGenerateReport} className="retry-button">
                  <i className="bi-arrow-repeat"></i>
                  Retry
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="analytics-dashboard">
            <div className="dashboard-header">
              <h3>Business Analytics Overview</h3>
              <p>Real-time insights and performance metrics</p>
            </div>
            
            {/* Key Metrics Cards */}
            <div className="dashboard-metrics">
              <div className="metric-card">
                <div className="metric-icon">
                <i className="bi bi-cash-stack"></i>
                </div>
                <div className="metric-info">
                  <h3>P{dashboardAnalytics.data?.totalRevenue?.toLocaleString() || '0'}</h3>
                  <p>Total Revenue</p>
                  <span className="metric-trend positive">+12.5%</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-cart"></i>
                </div>
                <div className="metric-info">
                  <h3>{dashboardAnalytics.data?.totalOrders?.toLocaleString() || '0'}</h3>
                  <p>Total Orders</p>
                  <span className="metric-trend positive">+8.3%</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-people"></i>
                </div>
                <div className="metric-info">
                  <h3>{dashboardAnalytics.data?.activeCustomers?.toLocaleString() || '0'}</h3>
                  <p>Active Customers</p>
                  <span className="metric-trend positive">+15.2%</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi-boxes"></i>
                </div>
                <div className="metric-info">
                  <h3>{dashboardAnalytics.data?.productsSold?.toLocaleString() || '0'}</h3>
                  <p>Products Sold</p>
                  <span className="metric-trend negative">-2.1%</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="dashboard-charts">
              <div className="chart-container">
                <div className="chart-header">
                  <h4>Sales Trend (Last 7 Days)</h4>
                </div>
                <div className="chart-content">
                  <div className="line-chart">
                    <div className="chart-bars">
                      {dashboardAnalytics.data?.salesTrend?.map((day, index) => {
                        const maxSales = Math.max(...(dashboardAnalytics.data?.salesTrend?.map(d => d.sales) || [1]));
                        const height = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
                        return (
                          <div 
                            key={index}
                            className="bar" 
                            style={{height: `${Math.max(height, 5)}%`}} 
                            data-value={`P${day.sales.toLocaleString()}`}
                          ></div>
                        );
                      }) || Array.from({length: 7}, (_, i) => (
                        <div key={i} className="bar" style={{height: '20%'}} data-value="P0"></div>
                      ))}
                    </div>
                    <div className="chart-labels">
                      {dashboardAnalytics.data?.salesTrend?.map((day, index) => (
                        <span key={index}>{day.date}</span>
                      )) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <span key={index}>{day}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-header">
                  <h4>Top Product Categories</h4>
                </div>
                <div className="chart-content">
                  <div className="donut-chart">
                    <div className="donut-center">
                      <span className="donut-value">100%</span>
                      <span className="donut-label">Total</span>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#000000'}}></div>
                      <span>Electronics (45%)</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#666666'}}></div>
                      <span>Clothing (30%)</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#999999'}}></div>
                      <span>Books (15%)</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#cccccc'}}></div>
                      <span>Others (10%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-activity">
              <div className="activity-header">
                <h4>Recent Activity</h4>
                <span className="activity-time">Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">
                    <i className="bi-cart-plus"></i>
                  </div>
                  <div className="activity-content">
                    <p><strong>New order received</strong></p>
                    <span>Order #1247 - ₱1,250.00</span>
                  </div>
                  <div className="activity-time">2 min ago</div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <i className="bi-exclamation-triangle"></i>
                  </div>
                  <div className="activity-content">
                    <p><strong>Low stock alert</strong></p>
                    <span>iPhone Charger - 5 units remaining</span>
                  </div>
                  <div className="activity-time">5 min ago</div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <i className="bi-person-plus"></i>
                  </div>
                  <div className="activity-content">
                    <p><strong>New customer registered</strong></p>
                    <span>John Doe joined the system</span>
                  </div>
                  <div className="activity-time">12 min ago</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

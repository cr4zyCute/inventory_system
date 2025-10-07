import { Controller, Post, Body, HttpException, HttpStatus, Get, Query, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  async getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      if (!startDate || !endDate) {
        throw new HttpException('Start date and end date are required', HttpStatus.BAD_REQUEST);
      }
      
      const reportData = await this.reportsService.getSalesReport(startDate, endDate);
      return {
        success: true,
        data: reportData,
      };
    } catch (error) {
      console.error('Sales report error:', error);
      throw new HttpException('Failed to generate sales report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('inventory-overview')
  async getInventoryReport() {
    try {
      const reportData = await this.reportsService.getInventoryReport();
      return {
        success: true,
        data: reportData,
      };
    } catch (error) {
      console.error('Inventory report error:', error);
      throw new HttpException('Failed to generate inventory report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('my-sales/:userId')
  async getUserSalesReport(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      if (!startDate || !endDate) {
        throw new HttpException('Start date and end date are required', HttpStatus.BAD_REQUEST);
      }
      
      const reportData = await this.reportsService.getUserSalesReport(userId, startDate, endDate);
      return {
        success: true,
        data: reportData,
      };
    } catch (error) {
      console.error('User sales report error:', error);
      throw new HttpException('Failed to generate user sales report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('daily-transactions')
  async getDailyTransactionsReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      if (!startDate || !endDate) {
        throw new HttpException('Start date and end date are required', HttpStatus.BAD_REQUEST);
      }
      
      const reportData = await this.reportsService.getDailyTransactionsReport(startDate, endDate);
      return {
        success: true,
        data: reportData,
      };
    } catch (error) {
      console.error('Daily transactions report error:', error);
      throw new HttpException('Failed to generate daily transactions report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('dashboard-analytics')
  async getDashboardAnalytics() {
    try {
      const analyticsData = await this.reportsService.getDashboardAnalytics();
      return {
        success: true,
        data: analyticsData,
      };
    } catch (error) {
      console.error('Dashboard analytics error:', error);
      throw new HttpException('Failed to get dashboard analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  @Post('generate-pdf')
  async generatePDF(@Body() reportData: any) {
    try {
      // Server-side PDF generation is not implemented
      // The frontend handles PDF generation using jsPDF
      throw new HttpException(
        'Server-side PDF generation not available. Use client-side generation.', 
        HttpStatus.NOT_IMPLEMENTED
      );
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new HttpException('Failed to generate PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  private generateReportHTML(data: any): string {
    const { reportName, reportData, dateRange, user } = data;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            color: #333; 
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #4f46e5; 
            padding-bottom: 20px; 
          }
          .header h1 { 
            color: #4f46e5; 
            margin: 0; 
            font-size: 28px;
          }
          .header p { 
            margin: 5px 0; 
            color: #666; 
          }
          .metrics { 
            display: flex; 
            justify-content: space-around; 
            margin: 30px 0; 
            flex-wrap: wrap;
          }
          .metric { 
            text-align: center; 
            padding: 20px; 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            min-width: 150px;
            margin: 10px;
          }
          .metric h3 { 
            font-size: 24px; 
            margin: 0; 
            color: #4f46e5; 
          }
          .metric p { 
            margin: 5px 0; 
            color: #666; 
          }
          .section { 
            margin: 30px 0; 
          }
          .section h3 { 
            color: #333; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 10px; 
          }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
          }
          .table th, .table td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #ddd; 
          }
          .table th { 
            background-color: #f8f9fa; 
            font-weight: bold; 
          }
          .footer { 
            margin-top: 50px; 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print { 
            body { margin: 0; } 
            .header { page-break-after: avoid; }
            .metric { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportName}</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Date Range: ${dateRange.startDate} to ${dateRange.endDate}</p>
          <p>User: ${user?.firstName} ${user?.lastName} (${user?.role})</p>
        </div>
        
        ${this.generateMetricsHTML(reportData)}
        ${this.generateDataTablesHTML(reportData, data.reportType)}
        
        <div class="footer">
          <p>Inventory Management System - Confidential Report</p>
          <p>Generated automatically on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  }
  
  private generateMetricsHTML(reportData: any): string {
    if (!reportData) return '';
    
    let metricsHTML = '<div class="metrics">';
    
    // Add metrics based on available data
    if (reportData.totalSales) {
      metricsHTML += `
        <div class="metric">
          <h3>₱${reportData.totalSales.toLocaleString()}</h3>
          <p>Total Sales</p>
        </div>
      `;
    }
    
    if (reportData.totalTransactions) {
      metricsHTML += `
        <div class="metric">
          <h3>${reportData.totalTransactions.toLocaleString()}</h3>
          <p>Transactions</p>
        </div>
      `;
    }
    
    if (reportData.totalProducts) {
      metricsHTML += `
        <div class="metric">
          <h3>${reportData.totalProducts.toLocaleString()}</h3>
          <p>Total Products</p>
        </div>
      `;
    }
    
    if (reportData.totalValue) {
      metricsHTML += `
        <div class="metric">
          <h3>₱${reportData.totalValue.toLocaleString()}</h3>
          <p>Total Value</p>
        </div>
      `;
    }
    
    metricsHTML += '</div>';
    return metricsHTML;
  }
  
  private generateDataTablesHTML(reportData: any, reportType: string): string {
    if (!reportData) return '';
    
    let tablesHTML = '';
    
    // Top Products Table
    if (reportData.topProducts && reportData.topProducts.length > 0) {
      tablesHTML += `
        <div class="section">
          <h3>Top Products</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Sales</th>
                <th>Units Sold</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      reportData.topProducts.forEach((product: any) => {
        tablesHTML += `
          <tr>
            <td>${product.name}</td>
            <td>₱${product.sales.toLocaleString()}</td>
            <td>${product.units} units</td>
          </tr>
        `;
      });
      
      tablesHTML += `
            </tbody>
          </table>
        </div>
      `;
    }
    
    // Low Stock Products Table
    if (reportData.lowStockProducts && reportData.lowStockProducts.length > 0) {
      tablesHTML += `
        <div class="section">
          <h3>Low Stock Alert</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Current Stock</th>
                <th>Minimum Required</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      reportData.lowStockProducts.forEach((product: any) => {
        tablesHTML += `
          <tr>
            <td>${product.name}</td>
            <td>${product.current}</td>
            <td>${product.minimum}</td>
            <td>${product.category}</td>
          </tr>
        `;
      });
      
      tablesHTML += `
            </tbody>
          </table>
        </div>
      `;
    }
    
    // Recent Transactions Table
    if (reportData.recentTransactions && reportData.recentTransactions.length > 0) {
      tablesHTML += `
        <div class="section">
          <h3>Recent Transactions</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Time</th>
                <th>Amount</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      reportData.recentTransactions.forEach((transaction: any) => {
        tablesHTML += `
          <tr>
            <td>${transaction.id}</td>
            <td>${transaction.time}</td>
            <td>₱${transaction.amount}</td>
            <td>${transaction.items} items</td>
          </tr>
        `;
      });
      
      tablesHTML += `
            </tbody>
          </table>
        </div>
      `;
    }
    
    return tablesHTML;
  }
}

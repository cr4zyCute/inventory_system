import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { OverviewDashboard } from "./ReportPlaceholders";
import SalesSummaryReport from "./reports/SalesSummaryReport";
import InventoryOverview from "./reports/InventoryOverview";
import UserActivityReport from "./reports/UserActivityReport";
import FinancialReport from "./reports/FinancialReport";
import ProductPerformanceReport from "./reports/ProductPerformanceReport";
import SystemAnalyticsReport from "./reports/SystemAnalyticsReport";
import MySalesReport from "./reports/MySalesReport";
import DailyTransactionsReport from "./reports/DailyTransactionsReport";
import "./css/report.css";

interface ReportItem {
  id: string;
  name: string;
  icon: string;
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0]
  });

  const getAvailableReports = (): ReportItem[] => {
    const baseReports: Record<string, ReportItem[]> = {
      admin: [
        { id: "sales-summary", name: "Sales Summary", icon: "bi-graph-up" },
        { id: "inventory-overview", name: "Inventory Overview", icon: "bi-boxes" },
        { id: "user-activity", name: "User Activity", icon: "bi-people" },
        { id: "financial-report", name: "Financial Report", icon: "bi-currency-dollar" },
        { id: "product-performance", name: "Product Performance", icon: "bi-bar-chart" },
        { id: "system-analytics", name: "System Analytics", icon: "bi-speedometer2" }
      ],
      manager: [
        { id: "sales-summary", name: "Sales Summary", icon: "bi-graph-up" },
        { id: "inventory-overview", name: "Inventory Overview", icon: "bi-boxes" },
        { id: "product-performance", name: "Product Performance", icon: "bi-bar-chart" },
        { id: "staff-performance", name: "Staff Performance", icon: "bi-person-check" },
        { id: "low-stock-alert", name: "Low Stock Alert", icon: "bi-exclamation-triangle" }
      ],
      cashier: [
        { id: "my-sales", name: "My Sales", icon: "bi-receipt" },
        { id: "daily-transactions", name: "Daily Transactions", icon: "bi-list-check" },
        { id: "product-lookup", name: "Product Lookup", icon: "bi-search" }
      ]
    };

    return baseReports[user?.role?.toLowerCase() || "cashier"] || baseReports.cashier;
  };

  const handleGenerateReport = () => {
    if (!selectedReport) return;
    setReportGenerated(true);
  };

  useEffect(() => {
    setReportGenerated(false);
  }, [selectedReport, dateRange.startDate, dateRange.endDate]);

  const handleExportPDF = () => {
    alert("Export to PDF will be available once live data is connected.");
  };

  const handleExportExcel = () => {
    alert("Export to Excel will be available once live data is connected.");
  };

  const handlePrint = () => {
    alert("Print report will be available once live data is connected.");
  };

  const renderReportContent = (): React.ReactElement => {
    // Show overview dashboard when no report is selected
    if (!selectedReport) {
      return <OverviewDashboard />;
    }

    // Show placeholder message when report is selected but not generated
    if (!reportGenerated) {
      return (
        <div className="report-content">
          <div className="no-data">
            <i className="bi-clipboard-data"></i>
            <p>Click "Generate Report" to view the selected report.</p>
          </div>
        </div>
      );
    }

    switch (selectedReport) {
      case "sales-summary":
        return <SalesSummaryReport />;
      case "inventory-overview":
        return <InventoryOverview />;
      case "user-activity":
        return <UserActivityReport />;
      case "financial-report":
        return <FinancialReport />;
      case "product-performance":
        return <ProductPerformanceReport />;
      case "system-analytics":
        return <SystemAnalyticsReport />;
      case "my-sales":
        return <MySalesReport />;
      case "daily-transactions":
        return <DailyTransactionsReport />;
      default:
        return (
          <div className="report-content">
            <div className="no-data">
              <i className="bi-file-earmark-text"></i>
              <p>Select a report to preview its layout.</p>
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
            {user?.role === "admin" && "Comprehensive business insights and analytics"}
            {user?.role === "manager" && "Operational reports and performance metrics"}
            {user?.role === "cashier" && "Personal sales performance and transaction history"}
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
            {getAvailableReports().map((report) => (
              <option key={report.id} value={report.id}>
                {report.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Date Range</label>
          <div className="date-range" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              className="date-input"
            />
            <span style={{ color: '#000000', fontWeight: 600 }}>to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              className="date-input"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          className="generate-button"
          disabled={!selectedReport}
        >
          <i className="bi-play-fill"></i>
          Generate Report
        </button>
      </div>



      <div className="reports-body">
        {renderReportContent()}
      </div>
    </div>
  );
};

export default Reports;

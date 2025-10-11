// Export all cashier components and types
export { default as BarcodeScanner } from './BarcodeScanner';
export { default as CashierPage } from './CashierPage';
export { default as CashierDashboardAnalytics } from './CashierDashboardAnalytics';
export { default as TransactionHistory } from './TransactionRecord.tsx';
export * from './types';

// Re-export for convenience
export type { 
  Product, 
  ScannedItem, 
  ScanResult, 
  CartSummary, 
  ScannerConfig, 
  PaymentResult,
  ScannerStatus,
  PaymentMethod,
  Transaction,
  TransactionStatus,
  PaymentFilter
} from './types';

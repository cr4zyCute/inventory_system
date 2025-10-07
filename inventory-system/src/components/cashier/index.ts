// Export all cashier components and types
export { default as BarcodeScanner } from './BarcodeScanner';
export { default as CashierPage } from './CashierPage';
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
  PaymentMethod 
} from './types';

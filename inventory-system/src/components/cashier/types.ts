// Type definitions for the cashier system

export interface Product {
  id?: string;
  barcode: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  description?: string;
}

export interface ScannedItem {
  id: string;
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  timestamp: Date;
  subtotal?: number;
}

export interface ScanResult {
  decodedText: string;
  result: any;
}

export interface CartSummary {
  items: ScannedItem[];
  totalItems: number;
  totalAmount: number;
  tax?: number;
  discount?: number;
}

export interface ScannerConfig {
  fps: number;
  qrbox: { width: number; height: number };
  aspectRatio: number;
  disableFlip: boolean;
  showTorchButtonIfSupported: boolean;
  showZoomSliderIfSupported: boolean;
  defaultZoomValueIfSupported: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  amount: number;
  timestamp: Date;
  error?: string;
}

export type ScannerStatus = 'idle' | 'scanning' | 'paused' | 'error';

export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'other';

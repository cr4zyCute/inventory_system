import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BarcodeScanner from './BarcodeScanner';
import './BarcodeScanner.css';
import './CashierPage.css';

interface ScannedItem {
  id: string;
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  timestamp: Date;
}

interface Product {
  barcode: string;
  name: string;
  price: number;
  stock: number;
}

interface CashierPageProps {
  onBackToHome?: () => void;
}

const CashierPage: React.FC<CashierPageProps> = ({ onBackToHome }) => {
  const { user, logout } = useAuth();
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [scanMessage, setScanMessage] = useState<string>('');
  const [total, setTotal] = useState<number>(0);

  // Mock product database - replace with actual API call
  const mockProducts: Product[] = [
    { barcode: '1234567890123', name: 'Sample Product 1', price: 10.99, stock: 50 },
    { barcode: '9876543210987', name: 'Sample Product 2', price: 25.50, stock: 30 },
    { barcode: '5555555555555', name: 'Test Item', price: 5.00, stock: 100 },
  ];

  const findProductByBarcode = (barcode: string): Product | null => {
    return mockProducts.find(product => product.barcode === barcode) || null;
  };

  const handleScanSuccess = useCallback((decodedText: string, _decodedResult: any) => {
    console.log('Scanned:', decodedText);
    setLastScannedCode(decodedText);
    
    // Find product in database
    const product = findProductByBarcode(decodedText);
    
    if (product) {
      // Check if item already exists in cart
      const existingItemIndex = scannedItems.findIndex(item => item.barcode === decodedText);
      
      if (existingItemIndex >= 0) {
        // Update quantity
        const updatedItems = [...scannedItems];
        updatedItems[existingItemIndex].quantity += 1;
        setScannedItems(updatedItems);
        setScanMessage(`Added another ${product.name} to cart`);
      } else {
        // Add new item
        const newItem: ScannedItem = {
          id: Date.now().toString(),
          barcode: decodedText,
          name: product.name,
          price: product.price,
          quantity: 1,
          timestamp: new Date()
        };
        setScannedItems(prev => [...prev, newItem]);
        setScanMessage(`Added ${product.name} to cart`);
      }
      
      // Calculate new total
      const newTotal = scannedItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0) + product.price;
      setTotal(newTotal);
      
    } else {
      setScanMessage(`Product not found for barcode: ${decodedText}`);
    }
    
    // Clear message after 3 seconds
    setTimeout(() => setScanMessage(''), 3000);
  }, [scannedItems]);

  const handleScanError = useCallback((error: string) => {
    console.log('Scan error:', error);
  }, []);

  const toggleScanner = () => {
    setIsScannerActive(!isScannerActive);
    if (!isScannerActive) {
      setScanMessage('Scanner activated - point camera at barcode');
    } else {
      setScanMessage('Scanner deactivated');
    }
  };

  const removeItem = (id: string) => {
    const updatedItems = scannedItems.filter(item => item.id !== id);
    setScannedItems(updatedItems);
    
    // Recalculate total
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    
    const updatedItems = scannedItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setScannedItems(updatedItems);
    
    // Recalculate total
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  };

  const clearCart = () => {
    setScannedItems([]);
    setTotal(0);
    setScanMessage('Cart cleared');
  };

  const processCheckout = () => {
    if (scannedItems.length === 0) {
      setScanMessage('Cart is empty');
      return;
    }
    
    // Here you would integrate with your payment system
    alert(`Processing payment for $${total.toFixed(2)}`);
    clearCart();
    setScanMessage('Transaction completed successfully');
  };

  return (
    <div className="cashier-page">
      <div className="cashier-header">
        <div className="header-left">
          {onBackToHome && (
            <button onClick={onBackToHome} className="back-btn">
              ← Back to Home
            </button>
          )}
          <div className="header-info">
            <h1>🛒 Cashier System</h1>
            <p>Welcome, <strong>{user?.name}</strong> - Scan barcodes to add items to cart</p>
          </div>
        </div>
        <button onClick={logout} className="logout-btn">
          🚪 Logout
        </button>
      </div>

      <div className="cashier-content">
        <div className="scanner-section">
          <div className="scanner-controls">
            <button 
              onClick={toggleScanner}
              className={`scanner-toggle ${isScannerActive ? 'active' : ''}`}
            >
              {isScannerActive ? '📷 Stop Scanner' : '📱 Start Scanner'}
            </button>
          </div>

          {scanMessage && (
            <div className="scan-message">
              {scanMessage}
            </div>
          )}

          {lastScannedCode && (
            <div className="last-scan">
              Last scanned: <code>{lastScannedCode}</code>
            </div>
          )}

          {isScannerActive && (
            <BarcodeScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
              isActive={isScannerActive}
            />
          )}
        </div>

        <div className="cart-section">
          <div className="cart-header">
            <h2>Shopping Cart ({scannedItems.length} items)</h2>
            <button onClick={clearCart} className="clear-cart-btn">
              🗑️ Clear Cart
            </button>
          </div>

          <div className="cart-items">
            {scannedItems.length === 0 ? (
              <div className="empty-cart">
                <p>Cart is empty. Scan items to add them.</p>
              </div>
            ) : (
              scannedItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p className="barcode">Barcode: {item.barcode}</p>
                    <p className="price">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="qty-btn"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>
                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="remove-btn"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="total-section">
              <h3>Total: ${total.toFixed(2)}</h3>
            </div>
            <button 
              onClick={processCheckout}
              className="checkout-btn"
              disabled={scannedItems.length === 0}
            >
              💳 Process Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierPage;

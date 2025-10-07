import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../shared/Sidebar';
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
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('pos');
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [scanMessage, setScanMessage] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [manualBarcode, setManualBarcode] = useState<string>('');

  // Mock product database - matches seeded data
  const mockProducts: Product[] = [
    { barcode: '1234567890123', name: 'Premium Coffee Beans', price: 15.99, stock: 50 },
    { barcode: '9876543210987', name: 'Organic Milk', price: 4.99, stock: 30 },
    { barcode: '5555555555555', name: 'Fresh Bread', price: 3.49, stock: 25 },
    { barcode: '1111111111111', name: 'Energy Drink', price: 2.99, stock: 100 },
    { barcode: '049000132601', name: 'Scanned Product', price: 5.99, stock: 20 },
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

  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleScanSuccess(manualBarcode.trim(), null);
      setManualBarcode('');
    }
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

  const handleSidebarItemClick = (itemId: string) => {
    setActiveSection(itemId);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'pos':
      case 'dashboard':
        return (
          <div className="cashier-content">
            <div className="scanner-section">
              <div className="scanner-controls">
                <button 
                  onClick={toggleScanner}
                  className={`scanner-toggle ${isScannerActive ? 'active' : ''}`}
                >
                  {isScannerActive ? <><i className="bi-camera-video"></i> Stop Scanner</> : <><i className="bi-upc-scan"></i> Start Scanner</>}
                </button>
              </div>

              {/* Manual Barcode Input */}
              <div className="manual-input-section">
                <h3><i className="bi-pencil"></i> Manual Barcode Entry</h3>
                <form onSubmit={handleManualBarcodeSubmit} className="manual-barcode-form">
                  <div className="input-group">
                    <input
                      type="text"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      placeholder="Enter barcode manually (e.g., 1234567890123)"
                      className="barcode-input"
                      pattern="[0-9]*"
                      title="Please enter numbers only"
                    />
                    <button 
                      type="submit" 
                      className="add-btn"
                      disabled={!manualBarcode.trim()}
                    >
                      <i className="bi-plus-circle"></i> Add Item
                    </button>
                  </div>
                </form>
                <p className="input-hint">
                  <i className="bi-lightbulb"></i> Tip: You can type or paste barcodes here if scanning isn't working
                </p>
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
                  <i className="bi-trash"></i> Clear Cart
                </button>
              </div>

              <div className="cart-items">
                {scannedItems.length === 0 ? (
                  <div className="empty-cart">
                    <p>Cart is empty. Scan barcodes or enter them manually to add items.</p>
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
                            <i className="bi-dash"></i>
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="qty-btn"
                          >
                            <i className="bi-plus"></i>
                          </button>
                        </div>
                        <div className="item-total">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="remove-btn"
                        >
                          <i className="bi-x-circle"></i>
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
                  <i className="bi-credit-card"></i> Process Payment
                </button>
              </div>
            </div>
          </div>
        );
      case 'scanner':
        return (
          <section className="content-section">
            <h2><i className="bi-upc-scan"></i> Barcode Scanner</h2>
            <p>Advanced barcode scanning tools and settings.</p>
            <div className="placeholder-content">
              <p>Advanced scanner interface will be implemented here.</p>
            </div>
          </section>
        );
      case 'quick-sale':
        return (
          <section className="content-section">
            <h2><i className="bi-lightning"></i> Quick Sale</h2>
            <p>Fast checkout for common items and quick transactions.</p>
            <div className="placeholder-content">
              <p>Quick sale interface will be implemented here.</p>
            </div>
          </section>
        );
      case 'transactions':
        return (
          <section className="content-section">
            <h2><i className="bi-credit-card"></i> Transactions</h2>
            <p>View transaction history and payment records.</p>
            <div className="placeholder-content">
              <p>Transaction history interface will be implemented here.</p>
            </div>
          </section>
        );
      default:
        return (
          <section className="content-section">
            <h2>Page Not Found</h2>
            <p>The requested section could not be found.</p>
          </section>
        );
    }
  };

  return (
    <div className="cashier-page">
      <Sidebar 
        activeItem={activeSection}
        onItemClick={handleSidebarItemClick}
      />
      <div className="dashboard-content">
        <div className="cashier-header">
          <div className="header-left">
            {onBackToHome && (
              <button onClick={onBackToHome} className="back-btn">
                <i className="bi-arrow-left"></i> Back to Home
              </button>
            )}
            <div className="header-info">
              <h1><i className="bi-cart3"></i> Cashier System</h1>
              <p>Welcome, <strong>{user?.firstName} {user?.lastName}</strong> - Scan barcodes to add items to cart</p>
            </div>
          </div>
        </div>

        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default CashierPage;

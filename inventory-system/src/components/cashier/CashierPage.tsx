import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../shared/Sidebar';
import BarcodeScanner from './BarcodeScanner';
// @ts-ignore - JSX component
import PhoneScanner from './scan.jsx';
// @ts-ignore - JSX component
import TransactionDisplay from './transaction.jsx';
import TransactionHistory from './TransactionRecord';
import Reports from '../shared/report';
import ProfilePage from '../admin/ProfilePage';
import Settings from '../settings/Settings';
import CashierDashboardAnalytics from './CashierDashboardAnalytics';
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
  
  // Note: onBackToHome and user are available for future use
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [scanMessage, setScanMessage] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [manualBarcode, setManualBarcode] = useState<string>('');
  const lastScanTime = useRef<number>(0);
  const lastScannedBarcode = useRef<string>('');

  // Fetch product from backend database
  const findProductByBarcode = async (barcode: string): Promise<Product | null> => {
    try {
      const response = await fetch(`http://localhost:3000/products/barcode/${barcode}`);
      if (response.ok) {
        const product = await response.json();
        return {
          barcode: product.barcode,
          name: product.name,
          price: product.price,
          stock: product.stockQuantity
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  };

  const handleScanSuccess = useCallback(async (decodedText: string, _decodedResult: any) => {
    const now = Date.now();
    const DUPLICATE_THRESHOLD = 1500; // 1.5 seconds to prevent duplicate scans
    
    // Prevent duplicate scans
    if (lastScannedBarcode.current === decodedText && 
        (now - lastScanTime.current) < DUPLICATE_THRESHOLD) {
      console.log('Duplicate scan prevented');
      return;
    }
    
    lastScanTime.current = now;
    lastScannedBarcode.current = decodedText;
    
    console.log('Scanned:', decodedText);
    setLastScannedCode(decodedText);
    setScanMessage('Looking up product...');
    
    // Find product in backend database
    const product = await findProductByBarcode(decodedText);
    
    if (product) {
      setScannedItems(currentItems => {
        // Check if item already exists in cart
        const existingItemIndex = currentItems.findIndex(item => item.barcode === decodedText);
        
        let updatedItems;
        if (existingItemIndex >= 0) {
          // Update quantity for existing item
          updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += 1;
          setScanMessage(`Added another ${product.name} (Qty: ${updatedItems[existingItemIndex].quantity})`);
        } else {
          // Add new item
          const newItem: ScannedItem = {
            id: `${decodedText}-${Date.now()}`,
            barcode: decodedText,
            name: product.name,
            price: product.price,
            quantity: 1,
            timestamp: new Date()
          };
          updatedItems = [...currentItems, newItem];
          setScanMessage(`Added ${product.name} to cart`);
        }
        
        // Calculate new total with updated items
        const newTotal = updatedItems.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);
        setTotal(newTotal);
        
        return updatedItems;
      });
      
    } else {
      setScanMessage(`Product not found for barcode: ${decodedText}`);
    }
    
    // Clear message after 3 seconds
    setTimeout(() => setScanMessage(''), 3000);
  }, []);

  const handleScanError = useCallback((error: string) => {
    console.log('Scan error:', error);
  }, []);

  const toggleScanner = () => {
    setIsScannerActive(!isScannerActive);
    if (!isScannerActive) {
      setScanMessage('Scanner activated - Ready to scan');
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

  const handleQuantityInputChange = (id: string, value: string) => {
    const newQuantity = parseInt(value) || 0;
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const clearCart = () => {
    setScannedItems([]);
    setTotal(0);
    setScanMessage('Cart cleared');
  };

  const handleManualBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      await handleScanSuccess(manualBarcode.trim(), null);
      setManualBarcode('');
    }
  };

  const processCheckout = async () => {
    if (scannedItems.length === 0) {
      setScanMessage('Cart is empty');
      return;
    }
    
    try {
      setScanMessage('Processing transaction...');
      
      // Get product IDs by barcode for each item
      const itemsWithProductIds = await Promise.all(
        scannedItems.map(async (item) => {
          try {
            const response = await fetch(`/api/products/barcode/${item.barcode}`);
            if (response.ok) {
              const result = await response.json();
              const product = result.data || result;
              return {
                productId: product.id, // Use the actual database product ID
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity
              };
            } else {
              console.warn(`Product not found for barcode: ${item.barcode}`);
              return null;
            }
          } catch (error) {
            console.error(`Error fetching product for barcode ${item.barcode}:`, error);
            return null;
          }
        })
      );

      // Filter out any null items (products not found)
      const validItems = itemsWithProductIds.filter(item => item !== null);
      
      if (validItems.length === 0) {
        setScanMessage('Error: No valid products found');
        return;
      }

      // Prepare transaction data with cashier information
      const transactionData = {
        transactionId: `TXN-${Date.now()}`,
        totalAmount: total,
        paymentMethod: 'cash',
        status: 'completed',
        cashierId: user?.id,
        cashierName: user ? `${user.firstName} ${user.lastName}` : 'Unknown Cashier',
        items: validItems
      };

      console.log('💾 Saving transaction:', transactionData);

      // Save transaction to database
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Transaction saved successfully:', result);
        setScanMessage('Transaction completed successfully');
        clearCart();
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save transaction:', errorText);
        setScanMessage('Error saving transaction. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error processing checkout:', error);
      setScanMessage('Error processing transaction. Please try again.');
    }
  };

  const handleSidebarItemClick = (itemId: string) => {
    setActiveSection(itemId);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'pos':
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
                        <p className="price">₱{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="item-controls">
                        <div className="quantity-section">
                          <div className="quantity-header">
                            <span className="quantity-label">Qty: {item.quantity}</span>
                            <div className="quantity-badge">
                              <span className="qty-number">{item.quantity}</span>
                              <span className="qty-unit">pcs</span>
                            </div>
                          </div>
                          <div className="quantity-controls">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="qty-btn decrease"
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                              className="quantity-input"
                              min="1"
                              max="999"
                            />
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="qty-btn increase"
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="item-total">
                          <span className="total-label">Subtotal:</span>
                          <span className="total-amount">₱{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="remove-btn"
                          title="Remove item from cart"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="cart-footer">
                <div className="total-section">
                  <h3>Total: ₱{total.toFixed(2)}</h3>
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
      case 'dashboard':
        return <CashierDashboardAnalytics />;
      case 'transactions':
        return <TransactionHistory />;
      case 'phone-scanner':
        return <PhoneScanner />;
      case 'transaction-display':
        return <TransactionDisplay />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <Settings />;
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


        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default CashierPage;
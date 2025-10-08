import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './CashierPage.css';
import './css/transactionview.css';

const TransactionDisplay = () => {
  const { user } = useAuth();
  const [scannedItems, setScannedItems] = useState([]);
  const [realtimeScans, setRealtimeScans] = useState([]);
  const [total, setTotal] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('waiting');
  const [manualBarcode, setManualBarcode] = useState('');
  const [lastProcessedScanId, setLastProcessedScanId] = useState(null);
  const [processedLocalScans, setProcessedLocalScans] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState(null);
  const [lastScanTimestamp, setLastScanTimestamp] = useState(null);
  const [componentInitTime, setComponentInitTime] = useState(null);

  // Product database - this should connect to your actual API
  const findProductByBarcode = async (barcode) => {
    console.log('🔍 Looking up barcode:', barcode);
    
    try {
      // Try to fetch from API first
      const response = await fetch(`/api/products/barcode/${barcode}`);
      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📦 API Response data:', result);
        
        // The API returns { success: true, data: product, message: "..." }
        if (result.success && result.data) {
          console.log('✅ Product found in database:', result.data);
          return result.data;
        }
      } else {
        console.warn('❌ API returned error status:', response.status);
        const errorText = await response.text();
        console.warn('Error details:', errorText);
      }
    } catch (error) {
      console.warn('🚫 API not available, using mock data:', error);
    }

    // Fallback to mock data (same as your current system)
    const mockProducts = [
      { barcode: '1234567890123', name: 'Premium Coffee Beans', price: 15.99, stock: 50 },
      { barcode: '9876543210987', name: 'Organic Milk', price: 4.99, stock: 30 },
      { barcode: '5555555555555', name: 'Fresh Bread', price: 3.49, stock: 25 },
      { barcode: '1111111111111', name: 'Energy Drink', price: 2.99, stock: 100 },
      { barcode: '049000132601', name: 'Scanned Product', price: 5.99, stock: 20 },
    ];
    
    return mockProducts.find(product => product.barcode === barcode) || null;
  };

  // Play buzz sound when scanning
  const playBuzzSound = () => {
    try {
      // Create a short buzz sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz buzz
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
      console.log('🔊 Played scan buzz sound');
    } catch (error) {
      console.warn('🔇 Could not play buzz sound:', error);
    }
  };

  // Handle new barcode scans from phone with cooldown
  const handleNewScan = useCallback(async (scanData) => {
    console.log('📱 Received scan data:', scanData);
    const { barcode, timestamp, deviceType } = scanData;
    
    const currentTime = Date.now();
    const scanTime = new Date(timestamp).getTime();
    
    // CRITICAL: Only process scans that are newer than component initialization
    if (componentInitTime && scanTime < componentInitTime) {
      console.log('🚫 Ignoring old scan from before component initialization:', {
        scanTime: new Date(scanTime).toISOString(),
        initTime: new Date(componentInitTime).toISOString(),
        barcode
      });
      return;
    }
    
    // Cooldown logic: prevent same barcode within 2 seconds
    if (lastScannedBarcode === barcode && lastScanTimestamp) {
      const timeSinceLastScan = currentTime - lastScanTimestamp;
      if (timeSinceLastScan < 2000) { // 2 second cooldown
        console.log('⏸️ Scan cooldown active, ignoring rapid scan:', { 
          barcode, 
          timeSinceLastScan: `${timeSinceLastScan}ms` 
        });
        return;
      }
    }
    
    // Update cooldown tracking
    setLastScannedBarcode(barcode);
    setLastScanTimestamp(currentTime);
    
    setLastScanTime(new Date(timestamp));
    setConnectionStatus('connected');
    
    // Play buzz sound
    playBuzzSound();
    
    // Add to realtime scans list
    setRealtimeScans(prev => [
      { barcode, timestamp, deviceType, id: Date.now() },
      ...prev.slice(0, 9) // Keep last 10 scans
    ]);

    // Find product and add to cart
    console.log('🔍 Looking up product for scanned barcode:', barcode);
    const product = await findProductByBarcode(barcode);
    
    if (product) {
      // ALWAYS add as a new separate item (1 scan = 1 new item)
      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID for each scan
        barcode,
        name: product.name,
        price: product.price,
        quantity: 1, // Always 1 per scan
        timestamp: new Date(timestamp),
        scannedBy: deviceType
      };
      
      console.log('➕ Adding new item to cart:', newItem);
      setScannedItems(prev => [...prev, newItem]);
    }
  }, [lastScannedBarcode, lastScanTimestamp, componentInitTime]);

  // Comprehensive API testing function
  const runDiagnostics = async () => {
    console.log('🔍 === STARTING COMPREHENSIVE DIAGNOSTICS ===');
    
    // Test both proxy and direct backend
    const proxyTests = [
      { name: 'Proxy - Basic API', url: '/api/products', expected: 'Product list' },
      { name: 'Proxy - Health Check', url: '/api/health', expected: 'Health status' },
      { name: 'Proxy - Product Test', url: '/api/products/test', expected: 'Controller test' },
      { name: 'Proxy - Barcode Lookup', url: '/api/products/barcode/1234567890123', expected: 'Product or 404' }
    ];
    
    const directTests = [
      { name: 'Direct - Basic API', url: 'http://localhost:3000/api/products', expected: 'Product list' },
      { name: 'Direct - Health Check', url: 'http://localhost:3000/api/health', expected: 'Health status' },
      { name: 'Direct - Product Test', url: 'http://localhost:3000/api/products/test', expected: 'Controller test' }
    ];
    
    console.log('📡 Testing via Vite Proxy...');
    for (const test of proxyTests) {
      try {
        console.log(`🧪 Testing ${test.name}: ${test.url}`);
        const response = await fetch(test.url);
        const result = await response.json();
        console.log(`${response.ok ? '✅' : '❌'} ${test.name}: Status ${response.status}`, result);
      } catch (error) {
        console.error(`❌ ${test.name} FAILED:`, error);
      }
    }
    
    console.log('🔗 Testing Direct Backend Connection...');
    for (const test of directTests) {
      try {
        console.log(`🧪 Testing ${test.name}: ${test.url}`);
        const response = await fetch(test.url, { mode: 'cors' });
        const result = await response.json();
        console.log(`${response.ok ? '✅' : '❌'} ${test.name}: Status ${response.status}`, result);
      } catch (error) {
        console.error(`❌ ${test.name} FAILED:`, error);
      }
    }
    
    console.log('🔍 === DIAGNOSTICS COMPLETE ===');
  };

  // Initialize component with completely clean state
  useEffect(() => {
    const initializeComponent = async () => {
      console.log('🚀 Initializing Transaction Display - FORCING CLEAN STATE');
      
      // AGGRESSIVELY CLEAR ALL DATA
      localStorage.clear(); // Clear ALL localStorage, not just 'latestScan'
      sessionStorage.clear(); // Clear session storage too
      
      // Reset ALL component state
      setProcessedLocalScans(new Set());
      setScannedItems([]);
      setRealtimeScans([]);
      setTotal(0);
      setLastProcessedScanId(null);
      setLastScannedBarcode(null);
      setLastScanTimestamp(null);
      setLastScanTime(null);
      setConnectionStatus('waiting');
      
      console.log('🧹 AGGRESSIVELY cleared ALL storage and state');

      // Test API connection
      try {
        console.log('🔌 Testing API connection...');
        const response = await fetch('/api/products');
        if (response.ok) {
          const result = await response.json();
          console.log('✅ API connection successful:', result);
        } else {
          console.warn('⚠️ API connection failed with status:', response.status);
        }
      } catch (error) {
        console.warn('❌ API connection test failed:', error);
      }
      
      // Mark as initialized after a longer delay to ensure everything is clean
      setTimeout(() => {
        const initTime = Date.now();
        setComponentInitTime(initTime);
        setIsInitialized(true);
        console.log('✅ Component initialized and ready for NEW scans only');
        console.log('🚫 Will ignore any old scan data from previous sessions');
        console.log('⏰ Component init time:', new Date(initTime).toISOString());
      }, 2000); // Increased to 2 seconds
    };
    
    initializeComponent();
  }, []);

  // Poll backend for cross-device scans (only logs when there's new data)
  const pollCrossDeviceScans = async () => {
    try {
      const response = await fetch('/api/products/scans-realtime/cashier-session');
      if (response.ok) {
        const result = await response.json();
        const scans = result.data || [];
        
        // Process new scans that we haven't seen before
        const newScans = scans.filter(scan => 
          !lastProcessedScanId || scan.id > lastProcessedScanId
        );
        
        if (newScans.length > 0) {
          console.log('📡 Computer: Received new cross-device scans:', newScans);
          
          // Process each new scan
          for (const scan of newScans) {
            await handleNewScan({
              barcode: scan.barcode,
              timestamp: scan.timestamp,
              deviceType: scan.deviceType
            });
          }
          
          // Update the last processed scan ID
          const latestScan = scans[scans.length - 1];
          if (latestScan) {
            setLastProcessedScanId(latestScan.id);
          }
        }
        // No logging when there are no new scans - keeps console clean
      }
    } catch (error) {
      // Only log errors occasionally to avoid spam
      if (Math.random() < 0.1) {
        console.warn('📡 Computer: Failed to poll cross-device scans:', error);
      }
    }
  };

  // Listen for barcode scan events (only after initialization)
  useEffect(() => {
    if (!isInitialized) {
      console.log('⏳ Waiting for initialization before starting scan monitoring');
      return;
    }

    console.log('🎯 Starting scan monitoring - component is initialized');

    const handleScanEvent = (event) => {
      console.log('📱 Received custom event scan:', event.detail);
      handleNewScan(event.detail);
    };

    // Listen for custom events from phone scanner (same device)
    window.addEventListener('newBarcodeScan', handleScanEvent);

    // Check localStorage for new scans (only when there's actually data)
    let lastCheckedLocalStorage = null;
    
    const checkLocalStorage = () => {
      const latestScan = localStorage.getItem('latestScan');
      
      // If no scan data or same as last check, skip silently
      if (!latestScan || latestScan === lastCheckedLocalStorage) {
        return;
      }
      
      lastCheckedLocalStorage = latestScan;
      
      try {
        const scanData = JSON.parse(latestScan);
        const scanKey = `${scanData.barcode}-${scanData.timestamp}`;
        
        // Check if we've already processed this exact scan
        if (processedLocalScans.has(scanKey)) {
          console.log('⏭️ Already processed this localStorage scan:', scanKey);
          return;
        }
        
        const scanTime = new Date(scanData.timestamp);
        const timeDiff = Date.now() - scanTime.getTime();
        const isRecentScan = timeDiff < 5000; // Only 5 seconds window for real-time
        
        console.log('💾 New localStorage scan found:', scanData);
        console.log('⏰ Time difference (ms):', timeDiff);
        
        if (isRecentScan) {
          console.log('✅ Processing new scan from localStorage');
          
          // Mark this scan as processed
          setProcessedLocalScans(prev => new Set([...prev, scanKey]));
          
          handleNewScan(scanData);
        } else {
          console.log('⏭️ Skipping old scan:', { timeDiff, scanKey });
        }
      } catch (error) {
        console.error('❌ Error parsing scan data:', error);
      }
    };

    // Check localStorage every 1 second for real-time response
    const localStorageInterval = setInterval(checkLocalStorage, 1000);
    
    // Poll for cross-device scans every 2 seconds for real-time response
    const crossDeviceInterval = setInterval(pollCrossDeviceScans, 2000);
    
    // Initial poll
    pollCrossDeviceScans();

    return () => {
      window.removeEventListener('newBarcodeScan', handleScanEvent);
      clearInterval(localStorageInterval);
      clearInterval(crossDeviceInterval);
    };
  }, [handleNewScan, lastProcessedScanId, processedLocalScans, isInitialized]);

  // Calculate total whenever items change (each scan = 1 item)
  useEffect(() => {
    const newTotal = scannedItems.reduce((sum, item) => 
      sum + item.price, 0 // Each item is quantity 1
    );
    setTotal(newTotal);
  }, [scannedItems]);

  const removeItem = (id) => {
    setScannedItems(prev => prev.filter(item => item.id !== id));
  };

  // Each scan is a separate item, so we only need remove functionality

  const clearCart = () => {
    setScannedItems([]);
    setRealtimeScans([]);
  };

  const handleManualBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;

    console.log('  Manual barcode entry:', manualBarcode);
    
    // Create scan data similar to phone scanner
    const scanData = {
      barcode: manualBarcode.trim(),
      timestamp: new Date().toISOString(),
      deviceType: 'manual'
    };

    // Process the manual barcode entry (includes buzz sound)
    await handleNewScan(scanData);
    
    // Clear the input
    setManualBarcode('');
  };

  const processCheckout = () => {
    if (scannedItems.length === 0) {
      alert('Cart is empty');
      return;
    }
    
    alert(`Processing payment for ₱${total.toFixed(2)}`);
    clearCart();
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'waiting': return '#FF9800';
      default: return '#f44336';
    }
  };

  return (
    <div className="transaction-display">

      {/* Manual Barcode Input Section */}
      <div className="manual-barcode-section">
        <h3><i className="bi-keyboard"></i> Manual Barcode Entry</h3>
        <form onSubmit={handleManualBarcodeSubmit}>
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Enter barcode manually (e.g., 48000014700028)"
            pattern="[0-9]*"
            title="Please enter numbers only"
          />
          <button 
            type="submit" 
            disabled={!manualBarcode.trim()}
          >
            <i className="bi-plus-circle"></i> Add Item
          </button>
        </form>
        <p><i className="bi-lightbulb"></i> Tip: You can type or paste barcodes here for testing or when the scanner isn't working</p>
      </div>

      <div className="display-grid">
        {/* Real-time Scan Feed */}
        <div className="scan-feed">
          <h3><i className="bi-phone"></i> Live Scan Feed</h3>
          {realtimeScans.length === 0 ? (
            <p className="no-scans">No scans yet. Start scanning with your phone!</p>
          ) : (
            <div className="scan-list">
              {realtimeScans.map(scan => (
                <div key={scan.id} className="scan-item">
                  <div className="scan-barcode">{scan.barcode}</div>
                  <div className="scan-time">
                    {new Date(scan.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="scan-device">
                    {scan.deviceType === 'manual' ? '  Manual' : '📱 Phone'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shopping Cart */}
        <div className="cart-section">
          <div className="cart-header">
            <h3><i className="bi-cart"></i> Shopping Cart ({scannedItems.length} items)</h3>
            <button onClick={clearCart} className="clear-cart-btn">
              <i className="bi-trash"></i> Clear Cart
            </button>
          </div>

          <div className="cart-items">
            {scannedItems.length === 0 ? (
              <div className="empty-cart">
                <p>Cart is empty. Scan items with your phone to add them here.</p>
              </div>
            ) : (
              scannedItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p className="barcode">{item.barcode}</p>
                    <p className="price">₱{item.price.toFixed(2)}</p>
                    <p className="scanned-by">
                      {item.scannedBy === 'manual' ? '  Added manually' : '📱 Scanned by phone'} at {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="item-controls">
                    <div className="item-total">
                      ₱{item.price.toFixed(2)}
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
              <h3><i className="bi-currency-dollar"></i> Total: ₱{total.toFixed(2)}</h3>
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

    </div>
  );
};

export default TransactionDisplay;
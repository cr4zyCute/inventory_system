import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Receipt from './Receipt';
import './CashierPage.css';
import './css/transactionview.css';
import scanBeepSound from './Barcode scanner beep sound (sound effect).mp3';

const TransactionDisplay = () => {
  const { user } = useAuth();
  const [scannedItems, setScannedItems] = useState([]);
  const [realtimeScans, setRealtimeScans] = useState([]);
  const [total, setTotal] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('waiting');
  const [manualBarcode, setManualBarcode] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [lastProcessedScanId, setLastProcessedScanId] = useState(null);
  const [processedLocalScans, setProcessedLocalScans] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState(null);
  const [lastScanTimestamp, setLastScanTimestamp] = useState(null);
  const [componentInitTime, setComponentInitTime] = useState(null);
  
  // UNIFIED SCAN DEDUPLICATION SYSTEM
  const [globalProcessedScans, setGlobalProcessedScans] = useState(new Map());
  const SCAN_COOLDOWN_MS = 3000; // 3 seconds cooldown for same barcode
  const ENABLE_CROSS_DEVICE_POLLING = false; // Disable cross-device polling to prevent auto-scans
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptItems, setReceiptItems] = useState([]);
  const [receiptTotal, setReceiptTotal] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  const scanSoundRef = useRef(null);

  // Calculate total and reset payment fields when cart changes
  useEffect(() => {
    const newTotal = scannedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
    
    // Reset payment fields when cart is empty
    if (scannedItems.length === 0) {
      setPaymentAmount('');
      setChangeAmount(0);
    }
  }, [scannedItems]);

  // Real-time debounced search function
  const performSearch = async (searchTerm) => {
    console.log('🔍 performSearch called with:', searchTerm);
    
    if (!searchTerm || searchTerm.length < 1) {
      console.log('❌ Search term too short or empty');
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    // Show immediate feedback for single character
    if (searchTerm.length === 1) {
      console.log('⏳ Single character, showing loading state');
      setIsSearching(true);
      setShowDropdown(true);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    console.log('🔍 Real-time searching for:', searchTerm);
    console.log('📡 Making API call to:', `/api/products/search?q=${encodeURIComponent(searchTerm)}`);
    
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchTerm)}`);
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📦 API Response data:', result);
        
        if (result.success && result.data) {
          const products = result.data.slice(0, 8); // Limit to 8 results for better UX
          console.log('✅ Found products:', products.length, products);
          setSearchResults(products);
          setShowDropdown(true);
          setSelectedIndex(-1); // Reset selection
        } else {
          console.log('❌ API returned no data or unsuccessful');
          setSearchResults([]);
          setShowDropdown(searchTerm.length >= 2); // Show "no results" for 2+ chars
        }
      } else {
        console.warn('❌ Search API error status:', response.status);
        const errorText = await response.text();
        console.warn('❌ Error details:', errorText);
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('🚫 Search API network error:', error);
      setSearchResults([]);
      setShowDropdown(false);
    }

    setIsSearching(false);
    console.log('✅ Search completed');
  };

  // Debounced search to avoid too many API calls
  const searchProducts = (searchTerm) => {
    console.log('🕐 searchProducts called with:', searchTerm);
    
    // Clear previous timer
    if (searchDebounceTimer) {
      console.log('⏰ Clearing previous timer');
      clearTimeout(searchDebounceTimer);
    }

    // Set new timer for debounced search
    console.log('⏰ Setting new timer for 200ms debounce');
    const timer = setTimeout(() => {
      console.log('⏰ Timer fired, calling performSearch');
      performSearch(searchTerm);
    }, 200); // 200ms debounce for real-time feel

    setSearchDebounceTimer(timer);
  };

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
      console.warn('🚫 API not available:', error);
    }

    // If API fails or product not found, return null so item is skipped
    console.log('❌ Product not found for barcode:', barcode);
    return null;
  };

  // Play buzz sound when scanning
  const playBuzzSound = () => {
    try {
      if (!scanSoundRef.current) {
        scanSoundRef.current = new Audio(scanBeepSound);
        scanSoundRef.current.preload = 'auto';
        scanSoundRef.current.volume = 0.8;
      }

      const sound = scanSoundRef.current.cloneNode(true);
      sound.volume = 0.8;
      sound.play().catch(error => {
        console.warn('🔇 Could not play scan sound:', error);
      });

      console.log('🔊 Played custom scan sound');
    } catch (error) {
      console.warn('🔇 Could not initialize scan sound:', error);
    }
  };

  // UNIFIED SCAN DEDUPLICATION - Prevents all duplicate scans
  const isValidNewScan = useCallback((barcode, timestamp) => {
    const currentTime = Date.now();
    const scanTime = new Date(timestamp).getTime();
    
    // Create unique scan identifier
    const scanId = `${barcode}-${timestamp}`;
    
    // Check if we've already processed this exact scan
    if (globalProcessedScans.has(scanId)) {
      console.log('🚫 DUPLICATE BLOCKED: Exact scan already processed:', scanId);
      return false;
    }
    
    // Check cooldown for same barcode (prevent rapid scans of same item)
    const lastScanTime = globalProcessedScans.get(barcode);
    if (lastScanTime && (currentTime - lastScanTime) < SCAN_COOLDOWN_MS) {
      console.log('🚫 COOLDOWN BLOCKED: Same barcode scanned too recently:', barcode);
      return false;
    }
    
    // Check if scan is too old (ignore old scans from previous sessions)
    if (componentInitTime && scanTime < componentInitTime) {
      console.log('🚫 OLD SCAN BLOCKED: Scan predates component initialization:', scanId);
      return false;
    }
    
    // Mark scan as processed
    setGlobalProcessedScans(prev => {
      const newMap = new Map(prev);
      newMap.set(scanId, currentTime); // Track exact scan
      newMap.set(barcode, currentTime); // Track barcode for cooldown
      return newMap;
    });
    
    console.log('✅ SCAN VALIDATED: Processing new scan:', scanId);
    return true;
  }, [globalProcessedScans, componentInitTime, SCAN_COOLDOWN_MS]);

  // Handle new barcode scans from phone with unified deduplication
  const handleNewScan = useCallback(async (scanData) => {
    console.log('📱 ===== HANDLE NEW SCAN CALLED =====');
    console.log('📱 Received scan data:', scanData);
    const { barcode, timestamp, deviceType } = scanData;
    
    console.log('🔍 About to validate scan...');
    // UNIFIED VALIDATION - Single point of truth for all scan sources
    if (!isValidNewScan(barcode, timestamp)) {
      console.log('❌ Scan validation FAILED - scan blocked');
      return; // Scan blocked by deduplication system
    }
    
    console.log('✅ Scan validation PASSED - continuing...');
    // Update tracking (old logic kept for compatibility)
    setLastScannedBarcode(barcode);
    setLastScanTimestamp(Date.now());
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
    
    if (!product) {
      console.warn('🚫 Skipping unknown product, nothing added to cart for barcode:', barcode);
      return;
    }

    // Check if product already exists in cart
    setScannedItems(prev => {
      const existingItemIndex = prev.findIndex(item => item.barcode === barcode);
      
      if (existingItemIndex >= 0) {
        // Product exists, increase quantity
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
          lastScanned: new Date(timestamp) // Track when last scanned
        };
        console.log(`➕ Increased quantity for ${product.name}: ${updatedItems[existingItemIndex].quantity}`);
        return updatedItems;
      } else {
        // New product, add to cart
        const newItem = {
          id: `${barcode}-${Date.now()}`, // Use barcode-based ID for consistency
          barcode,
          name: product.name,
          price: product.price,
          quantity: 1,
          timestamp: new Date(timestamp),
          lastScanned: new Date(timestamp),
          scannedBy: deviceType
        };
        console.log('➕ Adding new product to cart:', newItem);
        return [...prev, newItem];
      }
    });
  }, [isValidNewScan]);

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
      
      // CLEAR ONLY SCAN-RELATED DATA (preserve authentication)
      localStorage.removeItem('latestScan'); // Only clear scan data
      localStorage.removeItem('scanHistory'); // Clear any scan history
      localStorage.removeItem('lastProcessedScan'); // Clear processed scan tracking
      // DO NOT clear authentication data (inventory_auth_state, inventory_auth_expiry)
      
      // Reset ALL component state
      setProcessedLocalScans(new Set());
      setGlobalProcessedScans(new Map()); // Clear unified deduplication system
      setScannedItems([]);
      setRealtimeScans([]);
      setTotal(0);
      setLastProcessedScanId(null);
      setLastScannedBarcode(null);
      setLastScanTimestamp(null);
      setLastScanTime(null);
      setConnectionStatus('waiting');
      
      console.log('🧹 Cleared scan-related storage and state (preserved authentication)');

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

  // Poll backend for cross-device scans (with strict filtering)
  const pollCrossDeviceScans = async () => {
    try {
      const response = await fetch('/api/products/scans-realtime/cashier-session');
      if (response.ok) {
        const result = await response.json();
        const scans = result.data || [];
        
        // STRICT FILTERING: Only process scans that are very recent and haven't been processed
        const currentTime = Date.now();
        const recentScans = scans.filter(scan => {
          const scanTime = new Date(scan.timestamp).getTime();
          const timeDiff = currentTime - scanTime;
          
          // Only consider scans from the last 10 seconds AND newer than component init
          const isRecent = timeDiff < 10000; // 10 seconds
          const isNewerThanInit = !componentInitTime || scanTime > componentInitTime;
          const isNewerThanLastProcessed = !lastProcessedScanId || scan.id > lastProcessedScanId;
          
          return isRecent && isNewerThanInit && isNewerThanLastProcessed;
        });
        
        if (recentScans.length > 0) {
          console.log('📡 Computer: Received new cross-device scans:', recentScans);
          
          // Process each recent scan through unified validation
          for (const scan of recentScans) {
            await handleNewScan({
              barcode: scan.barcode,
              timestamp: scan.timestamp,
              deviceType: scan.deviceType || 'cross-device'
            });
          }
          
          // Update the last processed scan ID
          const latestScan = recentScans[recentScans.length - 1];
          if (latestScan) {
            setLastProcessedScanId(latestScan.id);
          }
        }
      }
    } catch (error) {
      // Only log errors occasionally to avoid spam
      if (Math.random() < 0.1) {
        console.warn('📡 Computer: Failed to poll cross-device scans:', error);
      }
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // Cleanup search timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  // Listen for barcode scan events (only after initialization)
  useEffect(() => {
    if (!isInitialized) {
      console.log('⏳ Waiting for initialization before starting scan monitoring');
      return;
    }

    console.log('🎯 Starting scan monitoring - component is initialized');

    const handleScanEvent = (event) => {
      console.log('📱 ===== SCAN EVENT RECEIVED =====');
      console.log('📱 Event detail:', event.detail);
      console.log('📱 Calling handleNewScan...');
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
        
        // CRITICAL: Only process very recent scans (within last 5 seconds)
        const scanTime = new Date(scanData.timestamp).getTime();
        const currentTime = Date.now();
        const scanAge = currentTime - scanTime;
        if (scanAge > 5000) {
          console.log('💾 Ignoring old localStorage scan (age: ' + scanAge + 'ms)');
          return;
        }
        
        console.log('💾 New localStorage scan found:', scanData);
        
        // Use unified validation system
        handleNewScan(scanData);
      } catch (error) {
        console.error('❌ Error parsing scan data:', error);
      }
    };

    // Enable localStorage polling with reduced frequency to catch phone scans
    const localStorageInterval = setInterval(checkLocalStorage, 2000); // Check every 2 seconds
    console.log('💾 localStorage polling ENABLED - checking every 2 seconds');
    
    // Track last processed backend scan to prevent duplicates
    let lastProcessedBackendScan = null;
    
    // Poll backend for scans since scanner is sending there directly
    const pollBackendScans = async () => {
      try {
        const response = await fetch('/api/products/scans-realtime/cashier-session');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.length > 0) {
            const latestScan = result.data[result.data.length - 1];
            
            // Create unique identifier for this scan
            const scanId = `${latestScan.barcode}-${latestScan.timestamp}`;
            
            // Skip if this is the same scan we processed last time
            if (lastProcessedBackendScan === scanId) {
              return; // Same scan, don't process again
            }
            
            // Skip if we've already processed this scan before
            if (globalProcessedScans.has(scanId)) {
              lastProcessedBackendScan = scanId;
              return;
            }
            
            // Only process very recent scans (within last 10 seconds)
            const scanTime = new Date(latestScan.timestamp).getTime();
            const currentTime = Date.now();
            const scanAge = currentTime - scanTime;
            if (scanAge > 10000) {
              console.log('📡 Ignoring old backend scan (age: ' + scanAge + 'ms)');
              return;
            }
            
            console.log('📡 New backend scan found:', latestScan);
            lastProcessedBackendScan = scanId;
            
            // Process the new scan
            console.log('📡 Processing backend scan:', latestScan);
            handleNewScan({
              barcode: latestScan.barcode,
              timestamp: latestScan.timestamp,
              deviceType: latestScan.deviceType || 'phone'
            });
          }
        }
      } catch (error) {
        console.warn('📡 Backend polling failed:', error);
      }
    };

    // Enable backend polling with proper deduplication to catch phone scans
    const backendInterval = setInterval(pollBackendScans, 3000); // Check every 3 seconds
    console.log('📡 Backend scan polling ENABLED - with unified deduplication');

    // Keep original cross-device polling disabled
    let crossDeviceInterval = null;
    if (ENABLE_CROSS_DEVICE_POLLING) {
      crossDeviceInterval = setInterval(pollCrossDeviceScans, 2000);
      pollCrossDeviceScans();
      console.log('📡 Cross-device polling ENABLED');
    } else {
      console.log('📡 Cross-device polling DISABLED - preventing auto-scans');
    }

    return () => {
      window.removeEventListener('newBarcodeScan', handleScanEvent);
      if (localStorageInterval) {
        clearInterval(localStorageInterval);
      }
      if (backendInterval) {
        clearInterval(backendInterval);
      }
      if (crossDeviceInterval) {
        clearInterval(crossDeviceInterval);
      }
    };
  }, [isInitialized]);

  // Remove item function
  const removeItem = (id) => {
    setScannedItems(prev => prev.filter(item => item.id !== id));
  };

  // Quantity control functions
  const increaseQuantity = (id) => {
    setScannedItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setScannedItems(prev => 
      prev.map(item => 
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const clearCart = () => {
    setScannedItems([]);
    setRealtimeScans([]);
  };

  const handleManualBarcodeChange = (e) => {
    const value = e.target.value;
    console.log('⌨️ Input changed to:', value);
    setManualBarcode(value);
    
    // Trigger real-time search immediately
    console.log('🚀 Triggering search for:', value);
    searchProducts(value);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleProductSelect(searchResults[selectedIndex]);
        } else if (manualBarcode.trim()) {
          handleManualBarcodeSubmit(e);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleProductSelect = async (product) => {
    // Create scan data using the selected product's barcode
    const scanData = {
      barcode: product.barcode,
      timestamp: new Date().toISOString(),
      deviceType: 'manual'
    };

    // Process the selected product (includes buzz sound)
    await handleNewScan(scanData);
    
    // Clear the input and hide dropdown
    setManualBarcode('');
    setSearchResults([]);
    setShowDropdown(false);
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
    
    // Clear the input and hide dropdown
    setManualBarcode('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const processCheckout = async () => {
    if (scannedItems.length === 0) {
      alert('Cart is empty');
      return;
    }
    
    try {
      console.log('💳 Processing checkout with user:', user);
      
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
        alert('Error: No valid products found in database');
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

      console.log('💾 Saving transaction data:', transactionData);

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
        
        // Show receipt after successful save
        setReceiptItems([...scannedItems]);
        setReceiptTotal(total);
        setShowReceipt(true);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save transaction:', errorText);
        alert('Error saving transaction. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error processing checkout:', error);
      alert('Error processing transaction. Please try again.');
    }
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setReceiptItems([]);
    setReceiptTotal(0);
  };

  const handleReceiptPrint = async () => {
    // Clear cart after successful print
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
      <div className="transaction-layout">
        {/* Left Side - Cart Table */}
        <div className="cart-table-section">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th style={{display: 'none'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scannedItems.length === 0 ? (
                <tr>
              
                </tr>
              ) : (
                scannedItems.map((item) => (
                  <tr key={item.id} className="cart-row">
                    <td className="barcode-cell">{item.barcode}</td>
                    <td className="product-cell">{item.name}</td>
                    <td className="price-cell">₱{item.price.toFixed(2)}</td>
                    <td className="quantity-cell">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => decreaseQuantity(item.id)}
                          className="qty-btn"
                          disabled={item.quantity <= 1}
                        >
                          <i className="bi-dash"></i>
                        </button>
                        <span className="qty-display">{item.quantity}</span>
                        <button 
                          onClick={() => increaseQuantity(item.id)}
                          className="qty-btn"
                        >
                          <i className="bi-plus"></i>
                        </button>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="remove-btn"
                        title="Remove item"
                      >
                        <i className="bi-x-circle"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right Side - Search and Payment */}
        <div className="right-side-container">
          {/* Manual Barcode Entry Section */}
          <div className="manual-barcode-section">
            <h3><i className="bi-upc-scan"></i> Manual Barcode Entry</h3>
            <div className="search-container">
              <i className="bi-search search-icon"></i>
              <input
                type="text"
                value={manualBarcode}
                onChange={handleManualBarcodeChange}
                onKeyDown={handleKeyDown}
                placeholder="Search by name, barcode, or description..."
                title="Search by barcode or product name - Use arrow keys to navigate"
                autoComplete="off"
                spellCheck="false"
                className="search-input"
              />
              {searchResults.length > 0 && (
                <div className="search-results-count">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </div>
              )}
              {manualBarcode && (
                <button
                  onClick={() => {
                    setManualBarcode('');
                    setSearchResults([]);
                    setShowDropdown(false);
                  }}
                  className="search-clear-button"
                  title="Clear search"
                >
                  <i className="bi-x"></i>
                </button>
              )}
              <form onSubmit={handleManualBarcodeSubmit} style={{ display: 'none' }}>
                <button type="submit" disabled={!manualBarcode.trim()}>Add</button>
              </form>

              {/* Search Results Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="search-dropdown">
                  <div className="dropdown-header">
                    <i className="bi-search"></i>
                    <span>Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="dropdown-results">
                    {searchResults.map((product, index) => (
                      <div
                        key={product.id}
                        className={`dropdown-item ${index === selectedIndex ? 'selected' : ''}`}
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="product-info">
                          <div className="product-name">
                            <i className="bi-box"></i>
                            <span>{product.name}</span>
                          </div>
                          <div className="product-details">
                            <span className="product-barcode">
                              <i className="bi-upc"></i> {product.barcode}
                            </span>
                            <span className="product-price">
                              <i className="bi-currency-dollar"></i> ₱{product.price?.toFixed(2) || '0.00'}
                            </span>
                        
                          </div>
                        </div>
                     
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No results message */}
              {showDropdown && searchResults.length === 0 && manualBarcode.length >= 2 && !isSearching && (
                <div className="search-dropdown">
                  <div className="dropdown-item no-results">
                    <i className="bi-exclamation-circle"></i>
                    <span>No products found for "{manualBarcode}"</span>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {isSearching && showDropdown && (
                <div className="search-dropdown">
                  <div className="dropdown-item loading">
                    <i className="bi-arrow-clockwise spinning"></i>
                    <span>Searching products...</span>
                  </div>
                </div>
              )}

              {/* Type to search hint */}
              {showDropdown && manualBarcode.length === 1 && (
                <div className="search-dropdown">
                  <div className="dropdown-item no-results">
                    <i className="bi-keyboard"></i>
                    <span>Keep typing to search products...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Section */}
          <div className="payment-section-right">
            <div className="total-display">
              <h2>Total: <span className="total-amount">₱{total.toFixed(2)}</span></h2>
            </div>
            
            <div className="payment-input-section">
              <div className="amount-received-group">
                <label htmlFor="amountReceived">
                  <i className="bi-cash"></i> Amount Received
                </label>
                <input
                  id="amountReceived"
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    const payment = parseFloat(e.target.value) || 0;
                    const change = payment - total;
                    setChangeAmount(change > 0 ? change : 0);
                  }}
                  placeholder="0"
                  className="amount-input"
                />
              </div>
              
              <div className="change-display-section">
                <div className="change-info">
                  <i className="bi-arrow-return-left"></i>
                  <span>Change: </span>
                  <span className={`change-value ${changeAmount >= 0 ? 'positive' : 'negative'}`}>
                    ₱{changeAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={processCheckout}
                className="process-payment-btn"
                disabled={scannedItems.length === 0 || !paymentAmount || parseFloat(paymentAmount) < total}
              >
                <i className="bi-credit-card"></i> Process Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <Receipt
          items={receiptItems}
          total={receiptTotal}
          paymentAmount={parseFloat(paymentAmount) || 0}
          changeAmount={changeAmount}
          onClose={handleReceiptClose}
          onPrint={handleReceiptPrint}
        />
      )}

    </div>
  );
};

export default TransactionDisplay;
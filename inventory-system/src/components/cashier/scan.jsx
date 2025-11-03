import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './BarcodeScanner.css';

const PhoneScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scanMessage, setScanMessage] = useState('Tap to start scanning');
  const [lastScanned, setLastScanned] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scannerStopped, setScannerStopped] = useState(false); // Prevent auto-restart
  
  const mountedRef = useRef(true);
  const scannerRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const lastScannedCodeRef = useRef('');
  const isProcessingScanRef = useRef(false);
  const scannerId = 'phone-scanner-container';
  
  // Debounce settings
  const SCAN_DEBOUNCE_TIME = 3000; // 3 seconds between scans

  useEffect(() => {
    mountedRef.current = true;
    
    // Global scan detection - catch any scans happening outside our callback
    console.log('📱 Setting up global scan detection...');
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      if (args[0] && args[0].includes('/api/products/scan-realtime')) {
        console.log('🚨 GLOBAL: Detected scan-realtime API call!', args);
        console.log('🚨 Call stack:', new Error().stack);
      }
      return originalFetch.apply(this, args);
    };
    
    // Auto-start scanner when component mounts
    setTimeout(() => {
      if (mountedRef.current) {
        console.log('📱 Auto-starting scanner on mount');
        startScanner();
      }
    }, 1000);
    
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    console.log('📱 ===== FORCE STOPPING SCANNER =====');
    
    if (scannerRef.current) {
      try {
        console.log('📱 Calling scanner.stop()...');
        await scannerRef.current.stop();
        console.log('📱 Scanner stopped');
      } catch (error) {
        console.warn('📱 stopScanner stop failed:', error);
      }

      try {
        console.log('📱 Calling scanner.clear()...');
        await scannerRef.current.clear();
        console.log('📱 Scanner cleared');
      } catch (error) {
        console.warn('📱 stopScanner clear failed:', error);
      }

      scannerRef.current = null;
      console.log('📱 Scanner ref set to null');
    }

    if (mountedRef.current) {
      setIsScanning(false);
      setTorchEnabled(false);
      setScannerStopped(true); // CRITICAL: Prevent auto-restart
      console.log('📱 Scanner state set to stopped');
    }
    
    isProcessingScanRef.current = false;
    
    console.log('📱 ===== SCANNER COMPLETELY STOPPED =====');
  };

  const startScanner = async (forceRestart = false) => {
    if (!mountedRef.current) return;
    
    // CRITICAL: Don't restart if scanner was manually stopped
    if (scannerStopped && !forceRestart) {
      console.log('📱 Scanner was stopped, not restarting automatically');
      return;
    }

    if (scannerRef.current) {
      await stopScanner();
    }

    
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!mountedRef.current) return;

    console.log('📱 Initializing Html5Qrcode instance with container:', scannerId);

    // Create the Html5Qrcode instance
    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: function(viewfinderWidth, viewfinderHeight) {
        const minEdgePercentage = 0.9;
        const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return {
          width: qrboxSize,
          height: qrboxSize
        };
      },
      aspectRatio: 1.0,
      disableFlip: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    };

    const onScanSuccess = async (decodedText) => {
      console.log('📱 ===== ON SCAN SUCCESS CALLED =====');
      console.log('📱 Barcode detected:', decodedText);

      if (isProcessingScanRef.current) {
        console.log('📱 Scan ignored - already processing previous barcode');
        return;
      }
      isProcessingScanRef.current = true;

      if (!mountedRef.current) {
        console.log('📱 Component not mounted, returning');
        isProcessingScanRef.current = false;
        return;
      }

      // Debounce mechanism - prevent rapid consecutive scans
      const currentTime = Date.now();
      const timeSinceLastScan = currentTime - lastScanTimeRef.current;
      
      // Prevent duplicate scans of the same code within debounce time
      if (lastScannedCodeRef.current === decodedText && timeSinceLastScan < SCAN_DEBOUNCE_TIME) {
        console.log('📱 Duplicate scan ignored (debounce):', decodedText);
        isProcessingScanRef.current = false;
        return;
      }
      
      // Update last scan tracking
      lastScanTimeRef.current = currentTime;
      lastScannedCodeRef.current = decodedText;

      console.log('📱 Successful scan detected, processing:', decodedText);
      
      // IMMEDIATELY stop scanner to prevent continuous scanning
      console.log('📱 Stopping scanner immediately...');
      await stopScanner();
      
      setScanMessage('📱 Scan captured - Processing item...');
      setLastScanned(decodedText);
      setError('');

      try {
        console.log('📱 Fetching product details...');
        const productDetails = await fetchProductDetails(decodedText);

        if (!productDetails) {
          console.warn('📱 Unknown product scanned, skipping display');
          setScanMessage('⚠️ Unknown product – not added');
          setError('');
          setScannedProduct(null);
          return;
        }

        setScannedProduct(productDetails);

        console.log('📱 Sending scan data to transaction...');
        await sendScanData(decodedText);
        console.log('📱 Scan data sent successfully');

        setShowSuccessModal(true);
      } catch (err) {
        console.error('📱 Error in scan processing:', err);
        setError('Failed to send scan data');
      } finally {
        await restartScannerAfterProcessing();
        isProcessingScanRef.current = false;
      }
    };

    const onScanError = (errorMessage) => {
      if (!mountedRef.current) return;
      console.log('📱 Scanner error:', errorMessage);
      if (!errorMessage.includes('NotFoundException') &&
          !errorMessage.includes('No QR code found') &&
          !errorMessage.includes('QR code parse error')) {
        console.error('📱 Scanner error:', errorMessage);
        setError(`Scanner error: ${errorMessage}`);
      }
    };

    try {
      console.log('📱 Starting Html5Qrcode with callbacks...');
      console.log('📱 onScanSuccess function:', typeof onScanSuccess);
      console.log('📱 onScanError function:', typeof onScanError);
      
      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        onScanSuccess,
        onScanError
      );
      
      console.log('📱 Html5Qrcode started successfully');

      if (!mountedRef.current) {
        await stopScanner();
        return;
      }

      setIsScanning(true);
      setScanMessage('📱 Scanner ready - aim at next barcode');
      setScannerStopped(false);
      isProcessingScanRef.current = false;

    } catch (error) {
      if (mountedRef.current) {
        setError(`Failed to start scanner: ${error.message}`);
        setScanMessage('📱 Tap to start scanning');
      }
    }
  };

  const toggleTorch = async () => {
    if (scannerRef.current) {
      try {
        const capabilities = await scannerRef.current.getRunningTrackCapabilities();
        if (capabilities && capabilities.torch) {
          const newTorchState = !torchEnabled;
          await scannerRef.current.applyVideoConstraints({
            advanced: [{ torch: newTorchState }]
          });
          setTorchEnabled(newTorchState);
        } else if (mountedRef.current) {
          setError('Torch not supported on this device');
        }
      } catch (error) {
        console.error('Torch toggle failed:', error);
        if (mountedRef.current) {
          setError('Failed to toggle torch');
        }
      }
    }
  };

  const handleBackButton = () => {
    stopScanner();
    window.location.href = '/cashier';
  };

  // Fetch product details for modal display
  const fetchProductDetails = async (barcode) => {
    try {
      const response = await fetch(`/api/products/barcode/${barcode}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          return result.data;
        }
      }
    } catch (error) {
      console.warn('Could not fetch product details:', error);
    }
    
    return null;
  };

  const sendScanData = async (barcode) => {
    console.log('📱 ===== SEND SCAN DATA CALLED =====');
    console.log('📱 Phone Scanner: Sending scan data for barcode:', barcode);
    
    try {
      // Store in localStorage for same-device sync
      const scanData = {
        barcode,
        timestamp: new Date().toISOString(),
        deviceType: 'phone'
      };
      
      console.log('📱 Phone Scanner: Storing in localStorage:', scanData);
      localStorage.setItem('latestScan', JSON.stringify(scanData));
      
      // Trigger custom event for same-device updates
      console.log('📱 Phone Scanner: Dispatching custom event');
      window.dispatchEvent(new CustomEvent('newBarcodeScan', { 
        detail: scanData 
      }));

      // CRITICAL: Send to backend API for cross-device sync
      console.log('📱 Phone Scanner: Sending to backend for cross-device sync');
      const response = await fetch('/api/products/scan-realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          barcode,
          timestamp: scanData.timestamp,
          deviceType: 'phone',
          sessionId: 'cashier-session' // Simple session identifier
        }),
      });

      if (response.ok) {
        console.log('📱 Phone Scanner: Successfully sent to backend for cross-device sync');
      } else {
        console.warn('📱 Phone Scanner: Backend API not available for cross-device sync');
      }
    } catch (error) {
      console.warn('📱 Phone Scanner: Cross-device sync failed:', error);
    }
  };

  const restartScannerAfterProcessing = async () => {
    try {
      setScannerStopped(false);
      await startScanner(true);
    } catch (error) {
      console.error('📱 Failed to restart scanner after processing:', error);
      if (mountedRef.current) {
        setError('Failed to restart scanner');
        setScanMessage('📱 Tap to start scanning');
      }
    }
  };

  const toggleScanner = async () => {
    if (isScanning) {
      await stopScanner();
      if (mountedRef.current) {
        setScanMessage('📱 Scanner stopped - Tap to start again');
      }
    } else {
      // Reset the stopped flag when manually starting
      setScannerStopped(false);
      await startScanner(true);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setScannedProduct(null);
    setScanMessage('📱 Scanner ready - aim at next barcode');
  };

  return (
    <div className="mobile-scanner-fullscreen">
      {/* Top Header with Back Button */}
      <div className="scanner-top-header">
        <button 
          className="back-button"
          onClick={handleBackButton}
          title="Back to Dashboard"
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className="scanner-title">
          <i className="bi bi-upc-scan me-2"></i>
          Barcode Scanner
        </div>
        <button 
          className={`torch-button ${torchEnabled ? 'active' : ''}`}
          onClick={toggleTorch}
          title={torchEnabled ? 'Turn off torch' : 'Turn on torch'}
        >
          <i className={`bi ${torchEnabled ? 'bi-lightbulb-fill' : 'bi-lightbulb'}`}></i>
        </button>
      </div>

      {/* Full Screen Scanner Area */}
      <div className="scanner-fullscreen-area">
        {/* HTML5 QR Code Scanner - full screen */}
        <div 
          id={scannerId}
          className="html5-scanner-fullscreen"
        />
        
        {/* Scanner Overlay */}
        <div className="scanner-overlay">
          {/* Corner brackets */}
          <div className="corner-bracket top-left"></div>
          <div className="corner-bracket top-right"></div>
          <div className="corner-bracket bottom-left"></div>
          <div className="corner-bracket bottom-right"></div>
          
          {/* Animated scanning line */}
          <div className={`scanning-line ${isScanning ? 'active' : ''}`}></div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="scanner-bottom-controls">
        {/* Status Messages */}
        {scanMessage && (
          <div className="scan-message-fullscreen success">
            <i className="bi bi-check-circle-fill me-2"></i>
            {scanMessage}
          </div>
        )}

        {error && (
          <div className="scan-message-fullscreen error">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {/* Last Scanned Info */}
        {lastScanned && (
          <div className="last-scanned-info">
            <i className="bi bi-qr-code me-2"></i>
            <span>Last Scanned: {lastScanned}</span>
          </div>
        )}

        {/* Main Control Button */}
        <button 
          onClick={toggleScanner}
          className={`scanner-main-button ${isScanning ? 'scanning' : 'stopped'}`}
        >
          {isScanning ? (
            <>
              <i className="bi bi-stop-circle-fill me-2"></i>
              <span>Stop Scanning</span>
            </>
          ) : (
            <>
              <i className="bi bi-play-circle-fill me-2"></i>
              <span>Start Scanner</span>
            </>
          )}
        </button>

        {/* Debug Info */}
        <div style={{ 
          color: 'rgba(255,255,255,0.6)', 
          fontSize: '10px', 
          textAlign: 'center',
          marginTop: '10px'
        }}>
          <div>Container ID: {scannerId}</div>
          <div>Scanner Active: {isScanning ? 'Yes' : 'No'}</div>
          <div>Component Mounted: {mountedRef.current ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && scannedProduct && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '350px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', color: '#28a745' }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h2 style={{ 
              color: '#28a745', 
              marginBottom: '16px',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              <i className="bi bi-bag-check me-2"></i>
              Successfully Scanned!
            </h2>
            <div style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                margin: '0 0 8px 0',
                color: '#2c3e50',
                fontSize: '18px'
              }}>
                {scannedProduct.name}
              </h3>
              <p style={{ 
                margin: '0 0 4px 0',
                color: '#6c757d',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <i className="bi bi-upc"></i>
                {scannedProduct.barcode}
              </p>
              <p style={{ 
                margin: 0,
                color: '#28a745',
                fontSize: '20px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <i className="bi bi-currency-dollar"></i>
                {scannedProduct.price?.toFixed(2) || '0.00'}
              </p>
            </div>
            <button
              onClick={handleModalClose}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <i className="bi bi-arrow-right-circle"></i>
              Continue Scanning
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneScanner;
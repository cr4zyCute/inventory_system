import React, { useEffect, useRef, useState, useId } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanError?: (error: string) => void;
  isActive: boolean;
}

interface ScannerConfig {
  fps: number;
  qrbox: { width: number; height: number };
  aspectRatio: number;
  disableFlip: boolean;
  supportedScanTypes: any[];
  showTorchButtonIfSupported: boolean;
  showZoomSliderIfSupported: boolean;
  defaultZoomValueIfSupported: number;
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: boolean;
  };
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  isActive
}) => {
  const uniqueId = useId();
  const containerId = `barcode-scanner-container-${uniqueId.replace(/:/g, '-')}`;
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const mountedRef = useRef(true);
  const lastScanRef = useRef<{ barcode: string; timestamp: number } | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    
    if (isActive && !isScanning) {
      startScanner();
    } else if (!isActive && isScanning) {
      stopScanner();
    }

    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanner = async () => {
    if (scannerRef.current) {
      await stopScanner();
    }

    // Wait a bit to ensure DOM is ready and previous scanner is cleaned up
    setTimeout(async () => {
      if (!mountedRef.current) return;

      try {
        // Check if the container element exists
        const containerElement = document.getElementById(containerId);
        if (!containerElement) {
          console.error('Scanner container not found:', containerId);
          setError('Scanner container not found. Please refresh the page.');
          return;
        }

        // Check camera permissions
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop()); // Stop the test stream
          console.log('✅ Camera permission granted');
        } catch (permError: any) {
          console.error('❌ Camera permission denied:', permError);
          setError('Camera access denied. Please allow camera permissions in your browser settings.');
          return;
        }

        const config: ScannerConfig = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        };

        console.log('🎥 Initializing scanner with config:', config);

        const scanner = new Html5QrcodeScanner(
          containerId,
          config,
          false
        );

        const onScanSuccessHandler = (decodedText: string, decodedResult: any) => {
          if (!mountedRef.current) return;
          
          const now = Date.now();
          const SCAN_COOLDOWN = 3000; // 3 second cooldown between same barcode scans
          
          // Check if this is a duplicate scan within the cooldown period
          if (lastScanRef.current) {
            const timeDiff = now - lastScanRef.current.timestamp;
            const isSameBarcode = lastScanRef.current.barcode === decodedText;
            
            if (isSameBarcode && timeDiff < SCAN_COOLDOWN) {
              console.log(`🚫 Duplicate scan ignored - cooldown active (${timeDiff}ms since last scan)`);
              return; // Ignore duplicate scan
            }
          }
          
          // Update last scan info
          lastScanRef.current = {
            barcode: decodedText,
            timestamp: now
          };
          
          console.log(`✅ Processing new scan: ${decodedText}`);
          setError('');
          
          // Stop scanner immediately after successful scan to prevent rapid-fire scanning
          stopScanner();
          
          onScanSuccess(decodedText, decodedResult);
        };

        const onScanErrorHandler = (errorMessage: string) => {
          if (!mountedRef.current) return;
          // Don't show continuous scanning errors to avoid spam
          if (!errorMessage.includes('NotFoundException')) {
            console.warn('Scanner error:', errorMessage);
            // Only show critical errors to user
            if (errorMessage.includes('NotAllowedError') || 
                errorMessage.includes('NotFoundError') ||
                errorMessage.includes('NotReadableError')) {
              setError(errorMessage);
              onScanError?.(errorMessage);
            }
          }
        };

        console.log('🎥 Rendering scanner...');
        scanner.render(onScanSuccessHandler, onScanErrorHandler);
        scannerRef.current = scanner;
        setIsScanning(true);
        setError('');
        console.log('✅ Scanner started successfully');
      } catch (err: any) {
        console.error('❌ Failed to start scanner:', err);
        setError(`Failed to start scanner: ${err.message || 'Unknown error'}`);
        setIsScanning(false);
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    
    // Reset last scan info
    lastScanRef.current = null;
    
    setIsScanning(false);
    setError('');
  };

  return (
    <div className="barcode-scanner">
      <div className="scanner-header">
        <h3>Barcode Scanner</h3>
        <p>Position the barcode within the scanning area</p>
        {isScanning && (
          <div className="scanner-status">
            <span className="status-indicator active"></span>
            <span>Scanner Active</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="scanner-error">
          <p><i className="bi-exclamation-triangle"></i> <strong>Error:</strong> {error}</p>
          {error.includes('Camera access denied') && (
            <div className="error-help">
              <p><strong>How to fix:</strong></p>
              <ol>
                <li>Click the camera icon in your browser's address bar</li>
                <li>Select "Allow" for camera access</li>
                <li>Refresh the page and try again</li>
              </ol>
            </div>
          )}
        </div>
      )}
      
      <div 
        id={containerId}
        className="scanner-container"
        style={{
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto',
          minHeight: error ? '0' : '300px'
        }}
      />
      
      {!error && (
        <div className="scanner-instructions">
          <p><i className="bi-phone"></i> <strong>Mobile Tips:</strong></p>
          <ul>
            <li>Hold your phone steady</li>
            <li>Ensure good lighting</li>
            <li>Keep barcode within the frame</li>
            <li>Use torch button if needed</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;

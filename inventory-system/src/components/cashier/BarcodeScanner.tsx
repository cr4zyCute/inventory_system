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

  const startScanner = () => {
    if (scannerRef.current) {
      stopScanner();
    }

    // Wait a bit to ensure DOM is ready and previous scanner is cleaned up
    setTimeout(() => {
      if (!mountedRef.current) return;

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
          setError(errorMessage);
          onScanError?.(errorMessage);
        }
      };

      scanner.render(onScanSuccessHandler, onScanErrorHandler);
      scannerRef.current = scanner;
      setIsScanning(true);
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
      </div>
      
      {error && (
        <div className="scanner-error">
          <p>Error: {error}</p>
        </div>
        
      )}
      
      <div 
        id={containerId}
        className="scanner-container"
        style={{
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto'
        }}
      />
      
      <div className="scanner-instructions">
        <p><i className="bi-phone"></i> <strong>Mobile Tips:</strong></p>
        <ul>
          <li>Hold your phone steady</li>
          <li>Ensure good lighting</li>
          <li>Keep barcode within the frame</li>
          <li>Use torch button if needed</li>
        </ul>
      </div>
    </div>
  );
};

export default BarcodeScanner;

import React, { useEffect, useRef, useState } from 'react';
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
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isActive && !isScanning) {
      startScanner();
    } else if (!isActive && isScanning) {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive]);

  const startScanner = () => {
    if (scannerRef.current) {
      stopScanner();
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

    const scanner = new Html5QrcodeScanner(
      "barcode-scanner-container",
      config,
      false
    );

    const onScanSuccessHandler = (decodedText: string, decodedResult: any) => {
      setError('');
      onScanSuccess(decodedText, decodedResult);
    };

    const onScanErrorHandler = (errorMessage: string) => {
      // Don't show continuous scanning errors to avoid spam
      if (!errorMessage.includes('NotFoundException')) {
        setError(errorMessage);
        onScanError?.(errorMessage);
      }
    };

    scanner.render(onScanSuccessHandler, onScanErrorHandler);
    scannerRef.current = scanner;
    setIsScanning(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
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
        id="barcode-scanner-container" 
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

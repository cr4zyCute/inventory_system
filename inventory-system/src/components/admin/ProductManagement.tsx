import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductForm from './ProductForm';
import Toast from '../shared/Toast';
import { TableSkeleton, Skeleton } from '../common/skeletonLoading';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useUpdateProductStatus } from '../../hooks/useProducts';
import { useInventoryActivity } from '../../hooks/useInventoryActivity';
import { useAuth } from '../../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
// Note: Using cashier-style localStorage + API approach instead of scan queue hooks
import BarcodeScanner from '../cashier/BarcodeScanner';
import './css/productmanagement.css';

interface Product {
  id: string;
  barcode: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stockQuantity: number;
  minStockLevel: number;
  categoryId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ProductManagement: React.FC = () => {
  // Auth and activity logging
  const { user } = useAuth();
  const { logActivity } = useInventoryActivity();
  const queryClient = useQueryClient();
  
  // TanStack Query hooks
  const { data: products = [], isLoading, error: queryError } = useProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const updateStatusMutation = useUpdateProductStatus();

  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(10);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [showScanModal, setShowScanModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [prefillBarcode, setPrefillBarcode] = useState<string | undefined>(undefined);
  const [showPhoneSuccessModal, setShowPhoneSuccessModal] = useState<boolean>(false);
  const [phoneScannedBarcode, setPhoneScannedBarcode] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const lastProcessedTimestampRef = useRef<string | null>(null);

  // Refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      setToast({ message: 'Products refreshed successfully!', type: 'success' });
    } catch (error) {
      console.error('Error refreshing products:', error);
      setToast({ message: 'Failed to refresh products', type: 'error' });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, setToast]);

  // Handle query error
  useEffect(() => {
    if (queryError) {
      setError('Failed to fetch products. Please check if the backend is running.');
    } else {
      setError(null);
    }
  }, [queryError]);

  // Listen for barcode scans (same approach as cashier)
  useEffect(() => {
    console.log('💻 Computer: Starting scan monitoring for ProductManagement');

    const handleNewScan = async (scanData: { barcode: string; timestamp: string; deviceType?: string }) => {
      console.log('💻 Computer: Received scan:', scanData);
      const { barcode, timestamp } = scanData;
      
      // Skip if already processed
      if (lastProcessedTimestampRef.current === timestamp) {
        console.log('💻 Computer: Scan already processed, skipping');
        return;
      }
      
      // Mark as processed
      lastProcessedTimestampRef.current = timestamp;

      console.log('💻 Computer: Checking if barcode exists:', barcode);

      // Check if product with this barcode already exists
      const existingProduct = products?.find(product => product.barcode === barcode);
      
      if (existingProduct) {
        console.log('💻 Computer: Product exists, adding to stock:', existingProduct.name);
        
        try {
          // Automatically increment stock quantity by 1
          await updateProductMutation.mutateAsync({
            id: existingProduct.id,
            data: {
              stockQuantity: existingProduct.stockQuantity + 1
            }
          });

          // Log the activity
          logActivity({
            type: 'SCAN_ADD',
            productName: existingProduct.name,
            productBarcode: existingProduct.barcode,
            details: {
              quantityAdded: 1,
              oldStock: existingProduct.stockQuantity,
              newStock: existingProduct.stockQuantity + 1
            },
            user: user?.name || 'Unknown User',
            method: 'SCAN'
          });

          // Show success toast
          setToast({
            message: `Successfully added 1 unit to "${existingProduct.name}" (Stock: ${existingProduct.stockQuantity + 1})`,
            type: 'success'
          });

          console.log('💻 Computer: Stock updated successfully');
        } catch (error) {
          console.error('💻 Computer: Failed to update stock:', error);
          setToast({
            message: `Failed to update stock for "${existingProduct.name}"`,
            type: 'error'
          });
        }
      } else {
        console.log('💻 Computer: New product, opening form with barcode:', barcode);

        // Auto-open product form with scanned barcode for new products
        setPrefillBarcode(barcode);
        setSelectedProduct(null);
        setIsEditing(false);
        setShowProductModal(true);

        // Show toast notification
        setToast({
          message: `New barcode scanned: ${barcode}`,
          type: 'info'
        });
      }
    };

    // Listen for custom events from phone scanner (same device)
    const handleScanEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('💻 Computer: Received custom event scan:', customEvent.detail);
      handleNewScan(customEvent.detail);
    };

    window.addEventListener('newBarcodeScan', handleScanEvent);

    // Check localStorage for new scans (same device)
    let lastCheckedLocalStorage: string | null = null;
    
    const checkLocalStorage = () => {
      const latestScan = localStorage.getItem('latestScan');
      
      if (!latestScan || latestScan === lastCheckedLocalStorage) {
        return;
      }
      
      lastCheckedLocalStorage = latestScan;
      
      try {
        const scanData = JSON.parse(latestScan);
        const scanTime = new Date(scanData.timestamp);
        const timeDiff = Date.now() - scanTime.getTime();
        const isRecentScan = timeDiff < 5000; // Only 5 seconds window
        
        console.log('💻 Computer: New localStorage scan found:', scanData);
        
        if (isRecentScan) {
          console.log('💻 Computer: Processing new scan from localStorage');
          handleNewScan(scanData);
        }
      } catch (error) {
        console.error('💻 Computer: Error parsing scan data:', error);
      }
    };

    // Poll for cross-device scans (ngrok/API)
    const pollCrossDeviceScans = async () => {
      try {
        const response = await fetch('/api/products/scans-realtime/product-management');
        if (response.ok) {
          const result = await response.json();
          const scans = result.data || [];
          
          if (scans.length > 0) {
            console.log('💻 Computer: Received cross-device scans:', scans);
            const latestScan = scans[scans.length - 1];
            handleNewScan({
              barcode: latestScan.barcode,
              timestamp: latestScan.timestamp,
              deviceType: latestScan.deviceType
            });
          }
        }
      } catch (error) {
        // Silently fail for cross-device polling
      }
    };

    // Check localStorage every 1 second
    const localStorageInterval = setInterval(checkLocalStorage, 1000);
    
    // Poll for cross-device scans every 2 seconds
    const crossDeviceInterval = setInterval(pollCrossDeviceScans, 2000);
    
    // Initial poll
    pollCrossDeviceScans();

    return () => {
      window.removeEventListener('newBarcodeScan', handleScanEvent);
      clearInterval(localStorageInterval);
      clearInterval(crossDeviceInterval);
    };
  }, [products, updateProductMutation, createProductMutation]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.action-dropdown')) {
        setActiveDropdown(null);
        setDropdownPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setPrefillBarcode(undefined);
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setPrefillBarcode(undefined);
    setShowProductModal(true);
  };

  const handleOpenScanModal = () => {
    setShowScanModal(true);
    setScannedBarcode(null);
    setScanError(null);
    setPrefillBarcode(undefined);
  };

  const handleCloseScanModal = () => {
    setShowScanModal(false);
    setScannedBarcode(null);
    setScanError(null);
  };

  const handleScanSuccess = async (decodedText: string) => {
    const value = decodedText.trim();
    if (!value) {
      setScanError('Scanned barcode appears to be empty. Please try again.');
      return;
    }
    
    console.log('📱 Phone: Scanned barcode:', value);
    
    // Play scan sound on phone
    playScanSound();
    
    try {
      // Create scan data (same format as cashier)
      const scanData = {
        barcode: value,
        timestamp: new Date().toISOString(),
        deviceType: 'phone'
      };
      
      console.log('📱 Phone: Storing in localStorage:', scanData);
      localStorage.setItem('latestScan', JSON.stringify(scanData));
      
      // Trigger custom event for same-device updates
      console.log('📱 Phone: Dispatching custom event');
      window.dispatchEvent(new CustomEvent('newBarcodeScan', { 
        detail: scanData 
      }));

      // Send to backend API for cross-device sync (ngrok)
      console.log('📱 Phone: Sending to backend for cross-device sync');
      const response = await fetch('/api/products/scan-realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          barcode: value,
          timestamp: scanData.timestamp,
          deviceType: 'phone',
          sessionId: 'product-management'
        }),
      });

      if (response.ok) {
        console.log('📱 Phone: Successfully sent to backend for cross-device sync');
      } else {
        console.warn('📱 Phone: Backend API not available for cross-device sync');
      }
      
      // Store scanned barcode for phone success modal
      setPhoneScannedBarcode(value);
      
      // Show phone-specific success modal
      setShowPhoneSuccessModal(true);
      
      // Close scan modal (camera stops)
      setShowScanModal(false);
      setScannedBarcode(null);
      setScanError(null);
    } catch (error) {
      console.error('📱 Phone: Failed to process scan:', error);
      setScanError('Failed to process barcode. Please try again.');
    }
  };

  const handleScanError = (errorMessage: string) => {
    setScanError(errorMessage);
  };

  const handlePhoneSuccessOk = () => {
    console.log('📱 Phone: User clicked OK, starting next scan');
    
    // Close phone success modal
    setShowPhoneSuccessModal(false);
    setPhoneScannedBarcode('');
    
    // Automatically restart scanner for next scan
    setShowScanModal(true);
    setScanError(null);
  };

  // Auto-close phone success modal after 3 seconds
  useEffect(() => {
    if (showPhoneSuccessModal) {
      console.log('📱 Phone: Starting 3-second auto-close timer');
      const timer = setTimeout(() => {
        console.log('📱 Phone: Auto-closing modal and starting next scan');
        handlePhoneSuccessOk();
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [showPhoneSuccessModal]);

  // Play scan success sound
  const playScanSound = () => {
    try {
      // Create a pleasant beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant two-tone beep
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // High tone
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1); // Lower tone
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log('🔊 Played scan success sound');
    } catch (error) {
      console.warn('🔇 Could not play scan sound:', error);
    }
  };

  const handleProductSubmit = async (productData: any) => {
    try {
      if (isEditing && selectedProduct) {
        // Editing existing product
        const oldProduct = selectedProduct;
        await updateProductMutation.mutateAsync({
          id: selectedProduct.id,
          data: productData
        });

        // Log the edit activity
        const changes: Record<string, { old: any; new: any }> = {};
        if (oldProduct.name !== productData.name) changes.name = { old: oldProduct.name, new: productData.name };
        if (oldProduct.price !== productData.price) changes.price = { old: oldProduct.price, new: productData.price };
        if (oldProduct.stockQuantity !== productData.stockQuantity) changes.stockQuantity = { old: oldProduct.stockQuantity, new: productData.stockQuantity };
        if (oldProduct.description !== productData.description) changes.description = { old: oldProduct.description, new: productData.description };

        logActivity({
          type: 'EDIT_PRODUCT',
          productName: productData.name,
          productBarcode: oldProduct.barcode,
          details: { changes },
          user: user?.name || 'Unknown User',
          method: 'MANUAL'
        });

        setToast({
          message: `Product "${productData.name}" updated successfully!`,
          type: 'success'
        });
      } else {
        // Creating new product - check if barcode already exists
        const existingProduct = products?.find(product => product.barcode === productData.barcode);
        
        if (existingProduct) {
          console.log('💻 Manual Add: Product exists, adding to stock:', existingProduct.name);
          
          // If only barcode is provided (minimal form), add to stock
          const isMinimalForm = !productData.name || productData.name.trim() === '';
          
          if (isMinimalForm) {
            // Add to existing stock
            const stockToAdd = productData.stockQuantity || 1;
            await updateProductMutation.mutateAsync({
              id: existingProduct.id,
              data: {
                stockQuantity: existingProduct.stockQuantity + stockToAdd
              }
            });

            // Log manual stock addition
            logActivity({
              type: 'MANUAL_ADD',
              productName: existingProduct.name,
              productBarcode: existingProduct.barcode,
              details: {
                quantityAdded: stockToAdd,
                oldStock: existingProduct.stockQuantity,
                newStock: existingProduct.stockQuantity + stockToAdd
              },
              user: user?.name || 'Unknown User',
              method: 'MANUAL'
            });

            setToast({
              message: `Successfully added ${stockToAdd} unit(s) to "${existingProduct.name}" (Stock: ${existingProduct.stockQuantity + stockToAdd})`,
              type: 'success'
            });
          } else {
            // Full form provided - show warning about duplicate barcode
            setError(`Barcode "${productData.barcode}" already exists for product "${existingProduct.name}". Please use a different barcode or leave other fields empty to add to existing stock.`);
            return;
          }
        } else {
          // New product with unique barcode
          await createProductMutation.mutateAsync(productData);
          
          // Log new product creation
          logActivity({
            type: 'ADD_NEW',
            productName: productData.name,
            productBarcode: productData.barcode,
            details: {
              quantityAdded: productData.stockQuantity || 0
            },
            user: user?.name || 'Unknown User',
            method: 'MANUAL'
          });

          setToast({
            message: `Product "${productData.name}" added successfully!`,
            type: 'success'
          });
        }
      }
      
      setShowProductModal(false);
      setSelectedProduct(null);
      setPrefillBarcode(undefined);
      setError(null);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product. Please try again.');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: product.id,
        isActive: !product.isActive
      });
      
      setToast({
        message: `Product "${product.name}" ${product.isActive ? 'deactivated' : 'activated'} successfully!`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('Error updating product status:', err);
      setError('Failed to update product status. Please try again.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProductMutation.mutateAsync(selectedProduct.id);
      setToast({
        message: `Product "${selectedProduct.name}" deleted successfully!`,
        type: 'success'
      });
      setShowDeleteModal(false);
      setSelectedProduct(null);
      setError(null);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product. Please try again.');
      setShowDeleteModal(false);
    }
  };

  // Enhanced filter and search logic
  const filteredProducts = products.filter((product: Product) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchLower === '' || 
      product.name.toLowerCase().includes(searchLower) ||
      product.barcode.toLowerCase().includes(searchLower) ||
      (product.description && product.description.toLowerCase().includes(searchLower)) ||
      (product.isActive ? 'active' : 'inactive').includes(searchLower);
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && product.isActive) ||
      (statusFilter === 'INACTIVE' && !product.isActive);
    
    const matchesStock = stockFilter === 'ALL' ||
      (stockFilter === 'LOW' && product.stockQuantity <= product.minStockLevel) ||
      (stockFilter === 'IN_STOCK' && product.stockQuantity > product.minStockLevel);
    
    return matchesSearch && matchesStatus && matchesStock;
  });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getStockStatus = (product: Product): { text: string; className: string } => {
    if (product.stockQuantity <= 0) {
      return { text: 'Out of Stock', className: 'out-of-stock' };
    } else if (product.stockQuantity <= product.minStockLevel) {
      return { text: 'Low Stock', className: 'low-stock' };
    } else {
      return { text: 'In Stock', className: 'in-stock' };
    }
  };

  if (isLoading) {
    return (
      <div className="product-management-container">
        {/* Header */}
        <div className="product-management-header">
          <div>
            <h2 className="product-management-title">
              <i className="bi-boxes"></i> Product Management
            </h2>

          </div>
          <button className="add-product-button" disabled>
            <i className="bi-plus-circle"></i>
            Add New Product
          </button>
        </div>

        {/* Controls Skeleton */}
        <div className="controls-container">
          <Skeleton width="130px" height="40px" variant="rounded" animation="shimmer" />
          <Skeleton width="130px" height="40px" variant="rounded" animation="shimmer" />
          <Skeleton width="320px" height="40px" variant="rounded" animation="shimmer" />
        </div>

        {/* Table Skeleton */}
        <TableSkeleton 
          rows={10} 
          columns={6} 
          variant="products"
          animation="shimmer"
          showAvatar={true}
          showActions={true}
        />
      </div>
    );
  }

  return (
    <div className="product-management-container">
      {/* Header */}
      <div className="product-management-header">
        <div>
          <h2 className="product-management-title">
            <i className="bi-boxes"></i> Product Management
          </h2>
          <p className="product-management-subtitle">Manage inventory, pricing, and product information</p>
        </div>
        <div className="product-management-actions">
          <button
            onClick={handleOpenScanModal}
            className="scan-product-button"
          >
            <i className="bi-upc-scan"></i>
            Scan Product Barcode
          </button>
          <button 
            onClick={handleCreateProduct}
            className="add-product-button"
          >
            <i className="bi-plus-circle"></i>
            Add Product Manually
          </button>

        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <i className="bi-exclamation-triangle"></i>
          {error}
          <button 
            onClick={() => setError(null)} 
            className="error-close-button"
          >
            <i className="bi-x"></i>
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="controls-container">

        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">All Stock</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW">Low Stock</option>
        </select>
        
        <div className="search-container">
          <i className="bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by name, barcode, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <div className="search-results-count">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          )}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="search-clear-button"
              title="Clear search"
            >
              <i className="bi-x"></i>
            </button>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="refresh-button"
          title="Refresh products table"
        >
          <i className={`bi-arrow-clockwise ${isRefreshing ? 'spinning' : ''}`}></i>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr className="table-header">
              <th className="table-header-cell">Product</th>
              <th className="table-header-cell">Barcode</th>
              <th className="table-header-cell">Price</th>
              <th className="table-header-cell">Stock</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  <i className="bi-inbox empty-state-icon"></i>
                  <span>
                    {products.length === 0 
                      ? 'No products found. Make sure your backend is running and the database is seeded.' 
                      : 'No products found matching your criteria'
                    }
                  </span>
                  {products.length === 0 && (
                    <div className="retry-info">
                      <p>Expected API endpoint: <code>GET /api/products</code></p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="retry-button"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              currentProducts.map((product: Product) => (
                <tr key={product.id} className={`table-row ${!product.isActive ? 'inactive' : ''}`}>
                  <td className="table-cell">
                    <div className="pm-product-info">
                      <div className="pm-product-details">
                        <span className="pm-product-name">{product.name}</span>
                        {product.description && (
                          <span className="pm-product-description">{product.description}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <code className="barcode">{product.barcode}</code>
                  </td>
                  <td className="table-cell">
                    <div className="price-info">
                      <span className="price">{formatCurrency(product.price)}</span>
                      {product.cost && (
                        <span className="cost">Cost: {formatCurrency(product.cost)}</span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="stock-info">
                      <span className="stock-quantity">{product.stockQuantity}</span>
                      <span className={`stock-status ${getStockStatus(product).className}`}>
                        {getStockStatus(product).text}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => handleToggleStatus(product)}
                      className={`status-toggle ${product.isActive ? 'active' : 'inactive'}`}
                    >
                      <i className={product.isActive ? 'bi-toggle-on' : 'bi-toggle-off'}></i>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="table-cell">
                    <div className="action-dropdown">
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const isLastRow = currentProducts.indexOf(product) === currentProducts.length - 1;
                          
                          if (activeDropdown === product.id) {
                            setActiveDropdown(null);
                            setDropdownPosition(null);
                          } else {
                            setActiveDropdown(product.id);
                            setDropdownPosition({
                              top: isLastRow ? rect.top - 80 : rect.bottom + 4,
                              right: window.innerWidth - rect.right
                            });
                          }
                        }}
                        className="dropdown-toggle"
                        title="More actions"
                      >
                        <i className="bi-three-dots-vertical"></i>
                      </button>
                      {activeDropdown === product.id && dropdownPosition && (
                        <div 
                          className="dropdown-menu" 
                          style={{
                            top: `${dropdownPosition.top}px`,
                            right: `${dropdownPosition.right}px`
                          }}
                        >
                          <button
                            onClick={() => {
                              handleEditProduct(product);
                              setActiveDropdown(null);
                              setDropdownPosition(null);
                            }}
                            className="dropdown-item"
                          >
                            <i className="bi-pencil"></i>
                            Edit Product
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteProduct(product);
                              setActiveDropdown(null);
                              setDropdownPosition(null);
                            }}
                            className="dropdown-item delete"
                          >
                            <i className="bi-trash"></i>
                            Delete Product
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <i className="bi-chevron-left"></i>
            Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({filteredProducts.length} products)
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
            <i className="bi-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductModal && (
        <ProductForm
          product={selectedProduct}
          isEditing={isEditing}
          onSubmit={handleProductSubmit}
          onCancel={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
            setPrefillBarcode(undefined);
          }}
          initialBarcode={prefillBarcode}
        />
      )}

      {/* Scan Product Modal */}
      {showScanModal && (
        <div className="modal-overlay" onClick={handleCloseScanModal}>
          <div className="modal-content scan-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="bi-upc"></i>
                Scan Product Barcode
              </h3>
              <button onClick={handleCloseScanModal} className="modal-close-button" title="Close">
                <i className="bi-x"></i>
              </button>
            </div>
            <div className="scan-modal-body">
              <div className="scanner-wrapper">
                <BarcodeScanner
                  onScanSuccess={(decodedText) => handleScanSuccess(decodedText)}
                  onScanError={handleScanError}
                  isActive={showScanModal && !scannedBarcode}
                />
              </div>

              <div className="scan-instructions">
                <p><i className="bi-phone"></i> <strong>Phone Scanner:</strong> Position the barcode within the frame.</p>
                <p style={{ marginTop: '8px' }}><i className="bi-laptop"></i> <strong>Computer:</strong> The product form will automatically pop up on your computer with the barcode filled in. You can then type the product details there.</p>
                <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#666' }}><i className="bi-info-circle"></i> Make sure your computer is on this Product Management page.</p>
              </div>

              {scanError && (
                <div className="scan-error-message">
                  <i className="bi-exclamation-triangle"></i>
                  <span>{scanError}</span>
                </div>
              )}

              <div className="scan-modal-actions">
                <button 
                  onClick={handleCloseScanModal}
                  className="modal-button cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay delete-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-icon">
                <i className="bi-exclamation-triangle-fill"></i>
              </div>
              <h3 className="modal-title delete">Delete Product</h3>
              <button onClick={() => setShowDeleteModal(false)} className="modal-close-button">
                <i className="bi-x"></i>
              </button>
            </div>
            
            <div className="delete-modal-body">
              <p className="modal-description">
                Are you sure you want to permanently delete this product?
              </p>
              
              <div className="product-details-card">
                <div className="product-detail-row">
                  <span className="detail-label">Product Name:</span>
                  <span className="detail-value">{selectedProduct?.name}</span>
                </div>
                <div className="product-detail-row">
                  <span className="detail-label">Barcode:</span>
                  <span className="detail-value">{selectedProduct?.barcode}</span>
                </div>
                <div className="product-detail-row">
                  <span className="detail-label">Current Stock:</span>
                  <span className="detail-value">{selectedProduct?.stockQuantity} units</span>
                </div>
                <div className="product-detail-row">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">{selectedProduct && formatCurrency(selectedProduct.price)}</span>
                </div>
              </div>
              
              <div className="warning-box">
                <i className="bi-exclamation-triangle"></i>
                <div className="warning-content">
                  <p className="warning-title">Warning: This action cannot be undone</p>
                  <p className="warning-text">
                    Deleting this product will permanently remove it from your inventory system. 
                    All associated data will be lost.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="modal-actions delete-modal-actions">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="modal-button cancel"
              >
                <i className="bi-x-circle"></i>
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete} 
                className="modal-button danger delete-confirm"
              >
                <i className="bi-trash"></i>
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Success Modal */}
      {showPhoneSuccessModal && (
        <div className="modal-overlay phone-success-overlay">
          <div className="modal-content phone-success-modal">
            {/* Floating particles */}
            <div className="success-particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
            
            <div className="phone-success-header">
              <div className="success-icon">
                <i className="bi-check-circle-fill"></i>
              </div>
              <h2 className="success-title">Successfully Scanned!</h2>
            </div>
            
            <div className="phone-success-body">
              <div className="scanned-barcode-display">
                <i className="bi-upc"></i>
                <span className="barcode-text">{phoneScannedBarcode}</span>
              </div>
              
              <p className="success-message">
                <i className="bi-laptop"></i>
                Processing on your computer...
              </p>
              
              <p className="next-scan-hint">
                <i className="bi-arrow-repeat"></i>
                Ready to scan the next item?
              </p>
            </div>
            
            <div className="phone-success-actions">
              <button 
                onClick={handlePhoneSuccessOk}
                className="phone-success-button"
              >
                <i className="bi-camera"></i>
                OK - Scan Next Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProductManagement;

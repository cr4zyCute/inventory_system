import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import Toast from '../shared/Toast';
import { TableSkeleton, Skeleton } from '../common/skeletonLoading';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useUpdateProductStatus } from '../../hooks/useProducts';
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Handle query error
  useEffect(() => {
    if (queryError) {
      setError('Failed to fetch products. Please check if the backend is running.');
    } else {
      setError(null);
    }
  }, [queryError]);

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
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setShowProductModal(true);
  };

  const handleProductSubmit = async (productData: any) => {
    try {
      if (isEditing && selectedProduct) {
        await updateProductMutation.mutateAsync({
          id: selectedProduct.id,
          data: productData
        });
        setToast({
          message: `Product "${productData.name}" updated successfully!`,
          type: 'success'
        });
      } else {
        await createProductMutation.mutateAsync(productData);
        setToast({
          message: `Product "${productData.name}" added successfully!`,
          type: 'success'
        });
      }
      
      setShowProductModal(false);
      setSelectedProduct(null);
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
            <p className="product-management-subtitle">Manage inventory, pricing, and product information</p>
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
        <button 
          onClick={handleCreateProduct}
          className="add-product-button"
        >
          <i className="bi-plus-circle"></i>
          Add New Product
        </button>
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
                    <div className="product-info">
                      <div className="product-details">
                        <span className="product-name">{product.name}</span>
                        {product.description && (
                          <span className="product-description">{product.description}</span>
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
          }}
        />
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

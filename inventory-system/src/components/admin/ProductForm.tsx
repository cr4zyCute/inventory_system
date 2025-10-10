import React, { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';

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

interface ProductFormProps {
  product?: Product | null;
  isEditing: boolean;
  onSubmit: (productData: any) => Promise<void>;
  onCancel: () => void;
  initialBarcode?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  isEditing,
  onSubmit,
  onCancel,
  initialBarcode
}) => {
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    description: '',
    price: '',
    cost: '',
    stockQuantity: '',
    minStockLevel: '',
    categoryId: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  
  // Fetch categories
  const { categories, isLoading: categoriesLoading } = useCategories();
  
  // Debug logging (can be removed in production)
  console.log('Current formData.categoryId:', formData.categoryId);
  console.log('Available categories:', categories?.length || 0);

  useEffect(() => {
    if (isEditing && product) {
      setFormData({
        barcode: product.barcode,
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        cost: product.cost?.toString() || '',
        stockQuantity: product.stockQuantity.toString(),
        minStockLevel: product.minStockLevel.toString(),
        categoryId: product.categoryId || '',
        isActive: product.isActive
      });
    } else {
      setFormData({
        barcode: initialBarcode || '',
        name: '',
        description: '',
        price: '',
        cost: '',
        stockQuantity: '',
        minStockLevel: '',
        categoryId: '',
        isActive: true
      });
    }
    // Reset modal states when form resets
    setShowCategoryModal(false);
    setCategorySearch('');
  }, [isEditing, product, initialBarcode]);

  // Debug: Watch for formData changes
  useEffect(() => {
    console.log('FormData changed - categoryId:', formData.categoryId);
  }, [formData.categoryId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.barcode.trim()) {
      newErrors.barcode = 'Barcode is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid positive number';
    }
    if (!formData.stockQuantity) {
      newErrors.stockQuantity = 'Stock quantity is required';
    } else if (isNaN(Number(formData.stockQuantity)) || Number(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Stock quantity must be a valid non-negative number';
    }
    if (!formData.minStockLevel) {
      newErrors.minStockLevel = 'Minimum stock level is required';
    } else if (isNaN(Number(formData.minStockLevel)) || Number(formData.minStockLevel) < 0) {
      newErrors.minStockLevel = 'Minimum stock level must be a valid non-negative number';
    }

    // Optional cost validation
    if (formData.cost && (isNaN(Number(formData.cost)) || Number(formData.cost) < 0)) {
      newErrors.cost = 'Cost must be a valid non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for submission
      const submitData = {
        barcode: formData.barcode.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        stockQuantity: parseInt(formData.stockQuantity),
        minStockLevel: parseInt(formData.minStockLevel),
        categoryId: formData.categoryId.trim() || undefined,
        isActive: formData.isActive
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content product-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <i className={`bi-${isEditing ? 'pencil' : 'plus-circle'}`}></i>
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onCancel} className="modal-close-button">
            <i className="bi-x"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="barcode" className="form-label">
                Barcode <span className="required">*</span>
              </label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                className={`form-input ${errors.barcode ? 'error' : ''}`}
                placeholder="Enter product barcode"
                disabled={isSubmitting}
              />
              {errors.barcode && <span className="error-message">{errors.barcode}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Product Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter product name"
                disabled={isSubmitting}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Enter product description (optional)"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Price (₱) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={`form-input ${errors.price ? 'error' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={isSubmitting}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cost" className="form-label">
                Cost (₱)
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                className={`form-input ${errors.cost ? 'error' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={isSubmitting}
              />
              {errors.cost && <span className="error-message">{errors.cost}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stockQuantity" className="form-label">
                Stock Quantity <span className="required">*</span>
              </label>
              <input
                type="number"
                id="stockQuantity"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                className={`form-input ${errors.stockQuantity ? 'error' : ''}`}
                placeholder="0"
                min="0"
                disabled={isSubmitting}
              />
              {errors.stockQuantity && <span className="error-message">{errors.stockQuantity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="minStockLevel" className="form-label">
                Minimum Stock Level <span className="required">*</span>
              </label>
              <input
                type="number"
                id="minStockLevel"
                name="minStockLevel"
                value={formData.minStockLevel}
                onChange={handleInputChange}
                className={`form-input ${errors.minStockLevel ? 'error' : ''}`}
                placeholder="0"
                min="0"
                disabled={isSubmitting}
              />
              {errors.minStockLevel && <span className="error-message">{errors.minStockLevel}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="categoryId" className="form-label">
              Category
            </label>
            <div className="category-selector">
              <div
                onClick={() => setShowCategoryModal(true)}
                className={`category-input ${formData.categoryId ? 'has-selection' : ''} ${isSubmitting ? 'disabled' : ''}`}
              >
                <input
                  type="text"
                  value={(() => {
                    const selectedCategory = categories?.find(cat => cat.id === formData.categoryId);
                    return selectedCategory ? selectedCategory.name : '';
                  })()}
                  placeholder="Select Category (Optional)"
                  readOnly
                  className="category-input-field"
                />
                <i className="bi bi-chevron-down category-dropdown-icon"></i>
              </div>
              {formData.categoryId && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, categoryId: '' })}
                  className="category-clear-btn"
                  disabled={isSubmitting}
                  title="Clear category"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              <span className="checkbox-text">Active Product</span>
            </label>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onCancel} 
              className="modal-button cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-button primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="bi-arrow-repeat loading-spinner"></i>
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <i className={`bi-${isEditing ? 'check' : 'plus'}`}></i>
                  {isEditing ? 'Update Product' : 'Add Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="category-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCategoryModal(false)}>
          <div className="category-modal-content">
            <div className="category-modal-header">
              <h3>Select Category</h3>
              <button 
                type="button" 
                className="category-modal-close-btn"
                onClick={() => setShowCategoryModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="category-modal-body">
              {/* Search Bar */}
              <div className="category-search-container">
                <i className="bi bi-search category-search-icon"></i>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="category-search-input"
                  autoFocus
                />
                {categorySearch && (
                  <button
                    type="button"
                    onClick={() => setCategorySearch('')}
                    className="category-search-clear"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
              
              {/* Categories List */}
              <div className="category-list">
                {categoriesLoading ? (
                  <div className="category-loading">
                    <i className="bi bi-arrow-clockwise loading-spin"></i>
                    <span>Loading categories...</span>
                  </div>
                ) : (
                  <>
                    {/* Clear Selection Option */}
                    <div 
                      className={`category-item ${!formData.categoryId ? 'selected' : ''}`}
                      onClick={() => {
                        setFormData({ ...formData, categoryId: '' });
                        setShowCategoryModal(false);
                        setCategorySearch('');
                      }}
                    >
                      <div className="category-item-info">
                        <i className="bi bi-x-circle"></i>
                        <div className="category-item-details">
                          <div className="category-item-name">No Category</div>
                          <div className="category-item-desc">Remove category assignment</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Filter and display categories */}
                    {categories && categories.length > 0 ? categories
                      .filter(category => 
                        category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                        (category.description && category.description.toLowerCase().includes(categorySearch.toLowerCase()))
                      )
                      .map(category => (
                        <div 
                          key={category.id}
                          className={`category-item ${formData.categoryId === category.id ? 'selected' : ''}`}
                          onClick={() => {
                            console.log('Selected category:', category.name, 'ID:', category.id);
                            setFormData({ ...formData, categoryId: category.id });
                            setShowCategoryModal(false);
                            setCategorySearch('');
                          }}
                        >
                          <div className="category-item-info">
                            <i className="bi bi-tag"></i>
                            <div className="category-item-details">
                              <div className="category-item-name">{category.name}</div>
                              {category.description && (
                                <div className="category-item-desc">{category.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="category-item-meta">
                            <span className="category-product-count">
                              {category._count?.products || 0} products
                            </span>
                          </div>
                        </div>
                      ))
                    : (
                      <div className="category-no-results">
                        <i className="bi bi-inbox"></i>
                        <span>No categories available</span>
                      </div>
                    )}
                    
                    {/* No results message */}
                    {categorySearch && categories && categories.filter(category => 
                      category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                      (category.description && category.description.toLowerCase().includes(categorySearch.toLowerCase()))
                    ).length === 0 && (
                      <div className="category-no-results">
                        <i className="bi bi-search"></i>
                        <span>No categories found for "{categorySearch}"</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;

import React, { useState, useEffect } from 'react';

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
      // Reset form for new product
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
    setErrors({});
  }, [product, isEditing, initialBarcode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
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
    <div className="modal-overlay" onClick={onCancel}>
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
              Category ID
            </label>
            <input
              type="text"
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter category ID (optional)"
              disabled={isSubmitting}
            />
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
    </div>
  );
};

export default ProductForm;

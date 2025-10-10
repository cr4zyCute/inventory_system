import React, { useState } from 'react';
import { useCategories, type CreateCategoryData } from '../../hooks/useCategories';
import Toast from '../shared/Toast';
import './CategoryManager.css';

const CategoryManager: React.FC = () => {
  const { categories, isLoading, error, createCategory, updateCategory, deleteCategory } = useCategories();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryData>({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        setShowEditModal(false);
        setEditingCategory(null);
        setToast({
          message: `Category "${formData.name}" updated successfully!`,
          type: 'success'
        });
      } else {
        await createCategory(formData);
        setShowAddModal(false);
        setToast({
          message: `Category "${formData.name}" created successfully!`,
          type: 'success'
        });
      }
      setFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Error saving category:', err);
      setToast({
        message: err instanceof Error ? err.message : 'Failed to save category',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowEditModal(true);
  };

  const handleDelete = (category: any) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;

    setIsSubmitting(true);
    try {
      await deleteCategory(deletingCategory.id);
      setToast({
        message: `Category "${deletingCategory.name}" deleted successfully!`,
        type: 'success'
      });
      setShowDeleteModal(false);
      setDeletingCategory(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      setToast({
        message: err instanceof Error ? err.message : 'Failed to delete category',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingCategory(null);
  };

  const handleCategoryClick = async (category: any) => {
    setSelectedCategory(category);
    setShowDetailsModal(true);
    setIsLoadingProducts(true);
    setSearchTerm('');

    try {
      const response = await fetch(`/api/categories/${category.id}/products`);
      if (response.ok) {
        const result = await response.json();
        setCategoryProducts(result.data || result || []);
      } else {
        console.error('Failed to fetch category products');
        setCategoryProducts([]);
        setToast({
          message: 'Failed to load category products',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error fetching category products:', err);
      setCategoryProducts([]);
      setToast({
        message: 'Error loading category products',
        type: 'error'
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedCategory(null);
    setCategoryProducts([]);
    setSearchTerm('');
  };

  const handleRemoveFromCategory = async (productId: string, productName: string) => {
    if (!selectedCategory) return;

    try {
      setIsSubmitting(true);
      // First, get the current product data
      const getResponse = await fetch(`/api/products/${productId}`);
      if (!getResponse.ok) {
        throw new Error('Failed to fetch product data');
      }
      
      const productResult = await getResponse.json();
      const currentProduct = productResult.data || productResult;
      
      // Update product to remove category assignment using PUT
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentProduct,
          categoryId: null, // Remove category assignment
        }),
      });

      if (response.ok) {
        // Remove product from local state
        setCategoryProducts(prev => prev.filter(product => product.id !== productId));
        setToast({
          message: `"${productName}" removed from category "${selectedCategory.name}"`,
          type: 'success'
        });
      } else {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error('Failed to remove product from category');
      }
    } catch (err) {
      console.error('Error removing product from category:', err);
      setToast({
        message: 'Failed to remove product from category',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  if (isLoading) {
    return (
      <div className="category-manager">
        <div className="loading-state">
          <i className="bi bi-arrow-clockwise loading-spin"></i>
          <p>Loading categories...</p>
          <small>Connecting to backend...</small>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-manager">
        <div className="error-state">
          <i className="bi bi-exclamation-triangle"></i>
          <p>Error loading categories: {error}</p>
          <div className="error-details">
            <p><strong>Possible causes:</strong></p>
            <ul>
              <li>Backend server is not running</li>
              <li>Categories table not created in database</li>
              <li>API endpoint /api/categories not accessible</li>
            </ul>
            <p><strong>Solutions:</strong></p>
            <ul>
              <li>Start backend server: <code>npm start</code></li>
              <li>Create categories table in PostgreSQL</li>
              <li>Check backend logs for errors</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-manager">
      <div className="category-header">
        <h2>Product Categories</h2>
        <button 
          className="add-category-btn"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-circle"></i>
          Add Category
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Category</h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="addCategoryName">Category Name *</label>
                  <input
                    id="addCategoryName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="addCategoryDescription">Description</label>
                  <textarea
                    id="addCategoryDescription"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter category description (optional)"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isSubmitting || !formData.name.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <i className="bi bi-arrow-clockwise loading-spin"></i>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i>
                      Add Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Category</h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="editCategoryName">Category Name *</label>
                  <input
                    id="editCategoryName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="editCategoryDescription">Description</label>
                  <textarea
                    id="editCategoryDescription"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter category description (optional)"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isSubmitting || !formData.name.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <i className="bi bi-arrow-clockwise loading-spin"></i>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i>
                      Update Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="no-categories">
            <i className="bi bi-folder"></i>
            <p>No categories found</p>
            <p>Create your first category to organize products</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-info" onClick={() => handleCategoryClick(category)}>
                <h4>{category.name}</h4>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
                <div className="category-stats">
                  <span className="product-count">
                    <i className="bi bi-box"></i>
                    {category._count?.products || 0} products
                  </span>
                  <span className="category-date">
                    Created: {new Date(category.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="category-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(category)}
                  title="Edit category"
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(category)}
                  title="Delete category"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCategory && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancelDelete()}>
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h3>Delete Category</h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={handleCancelDelete}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="delete-warning">
                <i className="bi bi-exclamation-triangle"></i>
                <p>Are you sure you want to delete the category <strong>"{deletingCategory.name}"</strong>?</p>
                <p className="warning-text">If this category has products, it will <b> NOT be Deleted.</b></p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={handleCancelDelete}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="delete-confirm-btn"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="bi bi-arrow-clockwise loading-spin"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash"></i>
                    Delete Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Details Modal */}
      {showDetailsModal && selectedCategory && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseDetails()}>
          <div className="modal-content details-modal">
            <div className="modal-header">
              <h3>
                <i className="bi bi-tags"></i>
                {selectedCategory.name} - Products
              </h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={handleCloseDetails}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {/* Search Bar */}
              <div className="search-container">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="search-clear-button"
                    title="Clear search"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>

              {/* Category Info */}
              <div className="category-details-info">
                <p><strong>Description:</strong> {selectedCategory.description || 'No description'}</p>
                <p><strong>Total Products:</strong> {categoryProducts.length}</p>
                
              </div>

              {/* Products List */}
              <div className="products-list">
                {isLoadingProducts ? (
                  <div className="loading-products">
                    <i className="bi bi-arrow-clockwise loading-spin"></i>
                    <p>Loading products...</p>
                  </div>
                ) : (
                  <>
                    {categoryProducts.filter(product => 
                      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 ? (
                      <div className="no-products">
                        <i className="bi bi-box"></i>
                        <p>{searchTerm ? 'No products match your search' : 'No products in this category'}</p>
                      </div>
                    ) : (
                      <div className="products-table-container">
                        <table className="products-table">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Barcode</th>
                              <th>Price</th>
                              <th>Stock</th>
                              <th>Added Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoryProducts
                              .filter(product => 
                                product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                              .map((product) => (
                                <tr key={product.id}>
                                  <td className="product-name">{product.name}</td>
                                  <td className="product-barcode">
                                    <code>{product.barcode}</code>
                                  </td>
                                  <td className="product-price">₱{product.price?.toFixed(2)}</td>
                                  <td className="product-stock">
                                    <span className={`stock-badge ${product.stockQuantity <= product.minStockLevel ? 'low-stock' : 'in-stock'}`}>
                                      {product.stockQuantity}
                                    </span>
                                  </td>
                                  <td className="product-date">
                                    {new Date(product.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="product-actions">
                                    <button
                                      className="remove-from-category-btn"
                                      onClick={() => handleRemoveFromCategory(product.id, product.name)}
                                      disabled={isSubmitting}
                                      title="Remove from category"
                                    >
                                      {/* <i className="bi bi-x-circle"></i> */}remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
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

export default CategoryManager;

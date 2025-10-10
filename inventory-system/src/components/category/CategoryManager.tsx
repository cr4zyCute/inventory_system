import React, { useState } from 'react';
import { useCategories, type CreateCategoryData, type UpdateCategoryData } from '../../hooks/useCategories';
import './CategoryManager.css';

const CategoryManager: React.FC = () => {
  const { categories, isLoading, error, createCategory, updateCategory, deleteCategory } = useCategories();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState<CreateCategoryData>({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        setShowEditModal(false);
        setEditingCategory(null);
      } else {
        await createCategory(formData);
        setShowAddModal(false);
      }
      setFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Error saving category:', err);
      alert(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      try {
        await deleteCategory(id);
      } catch (err) {
        console.error('Error deleting category:', err);
        alert(err instanceof Error ? err.message : 'Failed to delete category');
      }
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
              <div className="category-info">
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
                  onClick={() => handleDelete(category.id, category.name)}
                  title="Delete category"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryManager;

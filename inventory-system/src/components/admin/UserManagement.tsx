import React, { useState, useEffect } from 'react';
import './css/usermanagement.css';
import './css/userform.css';
import UserForm from './UserForm';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersPerPage] = useState<number>(10);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);

  // API configuration - use relative URL for Vite proxy
  const API_BASE_URL = '';

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Remove Authorization header for now since you're using mock auth
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.data || data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please check if the backend is running.');
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Remove Authorization header for now since you're using mock auth
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, isActive: !u.isActive } : u
        )
      );
    } catch (err: any) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status. Please try again.');
    }
  };

  const handleUserSubmit = async (userData: any) => {
    try {
      const url = isEditing 
        ? `${API_BASE_URL}/api/users/${selectedUser?.id}`
        : `${API_BASE_URL}/api/users`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (isEditing) {
        // Update existing user in local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === selectedUser?.id ? result.data : u
          )
        );
      } else {
        // Add new user to local state
        setUsers(prevUsers => [result.data, ...prevUsers]);
      }
      
      setShowUserModal(false);
      setSelectedUser(null);
      setError(null);
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err.message || 'Failed to save user. Please try again.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Update local state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== selectedUser?.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      setError(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user. Please try again.');
      setShowDeleteModal(false);
    }
  };

  // Enhanced filter and search logic
  const filteredUsers = users.filter((user: User) => {
    // Enhanced search - includes more fields and better matching
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchLower === '' || 
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      (user.isActive ? 'active' : 'inactive').includes(searchLower);
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && user.isActive) ||
      (statusFilter === 'INACTIVE' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    // Show relative time for recent dates
    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      // Format as date with better readability
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };


  const getRoleBadgeClass = (role: string): string => {
    switch (role) {
      case 'ADMIN': return 'role-badge admin';
      case 'MANAGER': return 'role-badge manager';
      case 'CASHIER': return 'role-badge cashier';
      default: return 'role-badge';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <i className="bi-arrow-repeat loading-spinner"></i>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      {/* Header */}
      <div className="user-management-header">
        <div>
          <h2 className="user-management-title">
            <i className="bi-people"></i> User Management
          </h2>
          <p className="user-management-subtitle">Manage system users, roles, and permissions</p>
        </div>
        <button 
          onClick={handleCreateUser}
          className="add-user-button"
        >
          <i className="bi-person-plus"></i>
          Add New User
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="CASHIER">Cashier</option>
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        
        <div className="search-container">
          <i className="bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by name, email, username, role, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <div className="search-results-count">
              {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
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
      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr className="table-header">
              <th className="table-header-cell">User</th>
              <th className="table-header-cell">Email</th>
              <th className="table-header-cell">Username</th>
              <th className="table-header-cell">Role</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Last Login</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  <i className="bi-inbox empty-state-icon"></i>
                  <span>
                    {users.length === 0 
                      ? 'No users found. Make sure your backend is running and the database is seeded.' 
                      : 'No users found matching your criteria'
                    }
                  </span>
                  {users.length === 0 && (
                    <div className="retry-info">
                      <p>Expected API endpoint: <code>GET /api/users</code></p>
                      <button 
                        onClick={fetchUsers}
                        className="retry-button"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              currentUsers.map((user: User) => (
                <tr key={user.id} className={`table-row ${!user.isActive ? 'inactive' : ''}`}>
                  <td className="table-cell">
                    <div className="user-info">
                      <div className={`user-avatar ${user.role.toLowerCase()}`}>
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <span className="user-name">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">{user.email}</td>
                  <td className="table-cell">{user.username}</td>
                  <td className="table-cell">
                    <span className={getRoleBadgeClass(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`status-toggle ${user.isActive ? 'active' : 'inactive'}`}
                    >
                      <i className={user.isActive ? 'bi-toggle-on' : 'bi-toggle-off'}></i>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="table-cell">
                    <div className="date-cell">
                      <span className={`date-primary ${!user.lastLogin ? 'never-logged' : ''}`}>
                        {formatDate(user.lastLogin)}
                      </span>
                      {user.lastLogin && (
                        <span className="date-secondary">
                          {new Date(user.lastLogin).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="action-dropdown">
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const isLastRow = currentUsers.indexOf(user) === currentUsers.length - 1;
                          
                          if (activeDropdown === user.id) {
                            setActiveDropdown(null);
                            setDropdownPosition(null);
                          } else {
                            setActiveDropdown(user.id);
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
                      {activeDropdown === user.id && dropdownPosition && (
                        <div 
                          className="dropdown-menu" 
                          style={{
                            top: `${dropdownPosition.top}px`,
                            right: `${dropdownPosition.right}px`
                          }}
                        >
                          <button
                            onClick={() => {
                              handleEditUser(user);
                              setActiveDropdown(null);
                              setDropdownPosition(null);
                            }}
                            className="dropdown-item"
                          >
                            <i className="bi-pencil"></i>
                            Edit User
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteUser(user);
                              setActiveDropdown(null);
                              setDropdownPosition(null);
                            }}
                            className="dropdown-item delete"
                          >
                            <i className="bi-trash"></i>
                            Delete User
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
            Page {currentPage} of {totalPages} ({filteredUsers.length} users)
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

      {/* User Form Modal */}
      {showUserModal && (
        <UserForm
          user={selectedUser}
          isEditing={isEditing}
          onSubmit={handleUserSubmit}
          onCancel={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title delete">Delete User</h3>
            <p className="modal-description">Are you sure you want to delete <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>?</p>
            <p className="modal-warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="modal-button cancel">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="modal-button danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
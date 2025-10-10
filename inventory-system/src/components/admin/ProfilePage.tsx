import React, { useState, useEffect } from 'react';
import Toast from '../shared/Toast';
import { Skeleton } from '../common/skeletonLoading';
import './css/profilepage.css';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  avatar?: string;
}

interface AccountActivity {
  totalConversations: number;
  totalMessages: number;
  totalCredits: number;
  codeWritten: number;
  streak: number;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<AccountActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockProfile: UserProfile = {
          id: '1',
          firstName: 'System',
          lastName: 'Admin',
          email: 'miyamotomosashi@gmail.com',
          username: 'platelets',
          role: 'ADMIN',
          isActive: true,
          createdAt: '2025-09-12T00:00:00Z',
          updatedAt: '2025-10-11T00:00:00Z',
          lastLogin: '2025-10-11T02:00:00Z'
        };

        const mockActivity: AccountActivity = {
          totalConversations: 1,
          totalMessages: 46,
          totalCredits: 92,
          codeWritten: 2286,
          streak: 0
        };

        setProfile(mockProfile);
        setActivity(mockActivity);
        setFormData({
          firstName: mockProfile.firstName,
          lastName: mockProfile.lastName,
          email: mockProfile.email,
          username: mockProfile.username
        });
      } catch (error) {
        setToast({
          message: 'Failed to load profile data',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing && profile) {
      // Reset form data if canceling
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        username: profile.username
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (profile) {
        setProfile({
          ...profile,
          ...formData,
          updatedAt: new Date().toISOString()
        });
      }
      
      setIsEditing(false);
      setToast({
        message: 'Profile updated successfully!',
        type: 'success'
      });
    } catch (error) {
      setToast({
        message: 'Failed to update profile',
        type: 'error'
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({
        message: 'New passwords do not match',
        type: 'error'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setToast({
        message: 'Password must be at least 6 characters long',
        type: 'error'
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePassword(false);
      setToast({
        message: 'Password changed successfully!',
        type: 'success'
      });
    } catch (error) {
      setToast({
        message: 'Failed to change password',
        type: 'error'
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

  if (isLoading) {
    return (
      <div className="profile-container">
        {/* Header Skeleton */}
        <div className="profile-header">
          <div>
            <Skeleton width="200px" height="32px" variant="rounded" animation="shimmer" />
            <Skeleton width="300px" height="20px" variant="rounded" animation="shimmer" />
          </div>
          <Skeleton width="120px" height="40px" variant="rounded" animation="shimmer" />
        </div>

        {/* Profile Card Skeleton */}
        <div className="profile-card">
          <div className="profile-info">
            <Skeleton width="80px" height="80px" variant="circular" animation="shimmer" />
            <div className="profile-details">
              <Skeleton width="150px" height="24px" variant="rounded" animation="shimmer" />
              <Skeleton width="200px" height="16px" variant="rounded" animation="shimmer" />
              <Skeleton width="100px" height="20px" variant="rounded" animation="shimmer" />
            </div>
          </div>
        </div>

        {/* Activity Cards Skeleton */}
        <div className="activity-grid">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="activity-card">
              <Skeleton width="40px" height="40px" variant="rounded" animation="shimmer" />
              <div>
                <Skeleton width="60px" height="24px" variant="rounded" animation="shimmer" />
                <Skeleton width="100px" height="16px" variant="rounded" animation="shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile || !activity) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <i className="bi bi-exclamation-triangle"></i>
          Failed to load profile data
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div>
          <h2 className="profile-title">
            <i className="bi bi-person-circle"></i> My Profile
          </h2>
          <p className="profile-subtitle">Manage your account settings and view activity</p>
        </div>
        <button 
          onClick={handleEditToggle}
          className="edit-profile-button"
        >
          <i className={`bi ${isEditing ? 'bi-x-circle' : 'bi-pencil-square'}`}></i>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Information Card */}
      <div className="profile-card">
        <div className="profile-info">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </div>
            <span className="pro-badge">Pro</span>
          </div>
          
          <div className="profile-details">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-actions">
                  <button onClick={handleSaveProfile} className="save-button">
                    <i className="bi bi-check-circle"></i>
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="profile-name">{profile.firstName} {profile.lastName}</h3>
                <p className="profile-email">{profile.email}</p>
                <div className="profile-meta">
                  <span className={getRoleBadgeClass(profile.role)}>{profile.role}</span>
                  <span className="profile-username">@{profile.username}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-label">Member Since</span>
            <span className="stat-value">{new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Last Login</span>
            <span className="stat-value">
              {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Never'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status</span>
            <span className={`status-badge ${profile.isActive ? 'active' : 'inactive'}`}>
              {profile.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Account Activity */}
      <div className="activity-section">
        <h3 className="section-title">Account Activity</h3>
        <p className="section-subtitle">Analytics update every three hours</p>
        
        <div className="activity-grid">
          <div className="activity-card">
            <div className="activity-icon">
              <i className="bi bi-chat-dots"></i>
            </div>
            <div className="activity-content">
              <span className="activity-number">{activity.totalConversations}</span>
              <span className="activity-label">Total Cascade conversations</span>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-icon">
              <i className="bi bi-envelope"></i>
            </div>
            <div className="activity-content">
              <span className="activity-number">{activity.totalMessages}</span>
              <span className="activity-label">Total Cascade messages sent</span>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-icon">
              <i className="bi bi-coin"></i>
            </div>
            <div className="activity-content">
              <span className="activity-number">{activity.totalCredits}</span>
              <span className="activity-label">Total credits used</span>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-icon">
              <i className="bi bi-code-slash"></i>
            </div>
            <div className="activity-content">
              <span className="activity-number">{activity.codeWritten.toLocaleString()}</span>
              <span className="activity-label">Total lines of code written by Cascade</span>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-icon">
              <i className="bi bi-fire"></i>
            </div>
            <div className="activity-content">
              <span className="activity-number">{activity.streak}</span>
              <span className="activity-label">day streak (record 1)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="security-section">
        <h3 className="section-title">Security Settings</h3>
        
        <div className="security-card">
          <div className="security-item">
            <div className="security-info">
              <h4>Password</h4>
              <p>Change your account password</p>
            </div>
            <button 
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="security-button"
            >
              <i className="bi bi-key"></i>
              Change Password
            </button>
          </div>

          {showChangePassword && (
            <div className="password-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-actions">
                <button onClick={handleChangePassword} className="save-button">
                  <i className="bi bi-shield-check"></i>
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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

export default ProfilePage;

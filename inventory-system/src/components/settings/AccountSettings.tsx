import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AccountSettings: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoadingProfile(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Profile updated successfully!');
        setIsEditingProfile(false);
        // Refresh the page to get updated user data
        window.location.reload();
      } else {
        alert(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setIsLoadingPassword(true);
    try {
      const response = await fetch(`/api/users/${user.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(result.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password. Please try again.');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleCancelProfile = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || ''
      });
    }
    setIsEditingProfile(false);
  };

  return (
    <div className="account-settings">
      {/* Profile Information Section */}
      <div className="settings-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="bi bi-person"></i>
            Profile Information
          </h3>
        </div>

        <form onSubmit={handleProfileSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
                disabled={!isEditingProfile}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
                disabled={!isEditingProfile}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled={!isEditingProfile}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                disabled={!isEditingProfile}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="account-info">
            <div className="info-item">
              <span className="info-label">Role:</span>
              <span className="role-badge">{user?.role?.toUpperCase()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`status-badge ${user?.isActive ? 'active' : 'inactive'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since:</span>
              <span className="info-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="form-actions">
            {!isEditingProfile ? (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="btn btn-primary"
              >
                <i className="bi bi-pencil"></i>
                Edit Profile
              </button>
            ) : (
              <div className="action-buttons">
                <button
                  type="submit"
                  disabled={isLoadingProfile}
                  className="btn btn-success"
                >
                  {isLoadingProfile ? (
                    <>
                      <i className="bi bi-arrow-clockwise spin"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check"></i>
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelProfile}
                  disabled={isLoadingProfile}
                  className="btn btn-secondary"
                >
                  <i className="bi bi-x"></i>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Password Change Section */}
      <div className="settings-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="bi bi-shield-lock"></i>
            Change Password
          </h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="form-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('current')}
              >
                <i className={`bi ${showPasswords.current ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="form-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('new')}
              >
                <i className={`bi ${showPasswords.new ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="form-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                <i className={`bi ${showPasswords.confirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <div className="error-message">Passwords do not match</div>
            )}
          </div>

          <div className="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li className={passwordData.newPassword.length >= 8 ? 'valid' : ''}>
                At least 8 characters long
              </li>
              <li className={/(?=.*[a-z])/.test(passwordData.newPassword) ? 'valid' : ''}>
                One lowercase letter
              </li>
              <li className={/(?=.*[A-Z])/.test(passwordData.newPassword) ? 'valid' : ''}>
                One uppercase letter
              </li>
              <li className={/(?=.*\d)/.test(passwordData.newPassword) ? 'valid' : ''}>
                One number
              </li>
            </ul>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoadingPassword || passwordData.newPassword !== passwordData.confirmPassword}
              className="btn btn-primary"
            >
              {isLoadingPassword ? (
                <>
                  <i className="bi bi-arrow-clockwise spin"></i>
                  Updating...
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check"></i>
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;

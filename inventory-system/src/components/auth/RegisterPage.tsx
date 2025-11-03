import { useState } from 'react';
import type { RegisterCredentials } from '../../types/auth';
import './RegisterPage.css';

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export function RegisterPage({ onBackToLogin }: RegisterPageProps) {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'CASHIER'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Validate passwords match
    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = credentials;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      if (result.success) {
        setSuccess(true);
        // Reset form
        setCredentials({
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          role: 'CASHIER'
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1><i className="bi-shop"></i> Inventory System</h1>
          <h2>Create Account</h2>
          <p>Fill in the details to register a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={credentials.firstName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="Enter first name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={credentials.lastName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={credentials.role}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            >
              <option value="CASHIER">Cashier</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="Enter password"
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={credentials.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="Confirm password"
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              Registration successful! Redirecting to login...
            </div>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={isLoading || !credentials.email || !credentials.password || !credentials.username || !credentials.firstName || !credentials.lastName}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="back-to-login">
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={onBackToLogin}
                className="link-button"
                disabled={isLoading}
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

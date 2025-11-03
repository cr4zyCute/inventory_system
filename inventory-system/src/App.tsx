import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { QueryProvider } from './providers/QueryProvider'
import { LoginPage, RegisterPage } from './components/auth'
import { AdminDashboard } from './components/admin'
import { ManagerDashboard } from './components/manager'
import { CashierPage } from './components/cashier'
import './App.css'

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return <RegisterPage onBackToLogin={() => setShowRegister(false)} />
    }
    return <LoginPage onSwitchToRegister={() => setShowRegister(true)} />
  }

  // Route to appropriate dashboard based on user role
  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />
    case 'manager':
      return <ManagerDashboard />
    case 'cashier':
      return <CashierPage />
    default:
      return <LoginPage />
  }
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryProvider>
  )
}

export default App

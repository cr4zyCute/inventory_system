import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginPage } from './components/auth'
import { AdminDashboard } from './components/admin'
import { ManagerDashboard } from './components/manager'
import { CashierPage } from './components/cashier'
import './App.css'

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth()

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
    return <LoginPage />
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

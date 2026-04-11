/**
 * App.jsx — Root component: providers + routing
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import LoginPage    from './pages/LoginPage'
import SignupPage   from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import LoadingScreen from './components/LoadingScreen'

// ─── Protected Route wrapper ──────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/login" replace />
}

// ─── Public Route: redirect if already logged in ──────────────────────────────
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? <Navigate to="/" replace /> : children
}

// ─── Inner App (has access to auth context) ──────────────────────────────────
const AppRoutes = () => (
  <>
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '13px',
          borderRadius: '10px',
          background: 'var(--toast-bg, #292524)',
          color: '#fafaf9',
        },
        success: { iconTheme: { primary: '#369c72', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
)

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}

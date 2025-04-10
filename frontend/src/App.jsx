"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import SplashScreen from "./components/SplashScreen"
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Inventory from "./pages/Inventory"
import ProfitAnalysis from "./pages/ProfitAnalysis"
import AIBusinessHelp from "./pages/AIBusinessHelp"
import Settings from "./pages/Settings"
import MainLayout from "./components/MainLayout"

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()

  if (loading) return <div className="loading">Loading...</div>

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return children
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Inventory />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profit-analysis"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfitAnalysis />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai-business-help"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AIBusinessHelp />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App

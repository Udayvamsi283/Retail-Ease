"use client"

import { useAuth } from "../contexts/AuthContext"
import { FaBoxOpen, FaChartLine, FaRobot, FaCog } from "react-icons/fa"
import { Link } from "react-router-dom"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const { currentUser } = useAuth()

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="welcome-card">
        <h2>Welcome, {currentUser?.displayName || "User"}!</h2>
        <p>Manage your inventory and track your business performance with Retail Ease.</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Items</h3>
          <p className="stat-value">0</p>
        </div>

        <div className="stat-card">
          <h3>Low Stock</h3>
          <p className="stat-value">0</p>
        </div>

        <div className="stat-card">
          <h3>Expiring Soon</h3>
          <p className="stat-value">0</p>
        </div>

        <div className="stat-card">
          <h3>Total Value</h3>
          <p className="stat-value">₹0</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/inventory" className="action-card">
          <div className="action-icon" style={{ backgroundColor: "var(--primary)" }}>
            <FaBoxOpen />
          </div>
          <div className="action-content">
            <h3>Inventory</h3>
            <p>Manage your stock and items</p>
          </div>
        </Link>

        <Link to="/profit-analysis" className="action-card">
          <div className="action-icon" style={{ backgroundColor: "var(--secondary)" }}>
            <FaChartLine />
          </div>
          <div className="action-content">
            <h3>Profit Analysis</h3>
            <p>Track your business performance</p>
          </div>
        </Link>

        <Link to="/ai-business-help" className="action-card">
          <div className="action-icon" style={{ backgroundColor: "var(--accent)" }}>
            <FaRobot />
          </div>
          <div className="action-content">
            <h3>AI Business Help</h3>
            <p>Get AI-powered business insights</p>
          </div>
        </Link>

        <Link to="/settings" className="action-card">
          <div className="action-icon" style={{ backgroundColor: "var(--highlight)" }}>
            <FaCog />
          </div>
          <div className="action-content">
            <h3>Settings</h3>
            <p>Configure your account</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard

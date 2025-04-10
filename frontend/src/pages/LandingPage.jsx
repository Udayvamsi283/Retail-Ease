"use client"

import { useNavigate } from "react-router-dom"
import { FaShoppingCart } from "react-icons/fa"
import "../styles/LandingPage.css"

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="logo-container">
          <FaShoppingCart className="cart-icon" />
        </div>
        <h1 className="app-title">Welcome to Retail Ease</h1>
        <p className="app-description">
          Smart inventory management for Indian small businesses. Track items, get alerts, analyze sales.
        </p>

        <div className="button-group">
          <button className="primary-btn register-btn" onClick={() => navigate("/register")}>
            Register
          </button>
          <button className="secondary-btn login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>

        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: "var(--primary)" }}>
              <FaShoppingCart />
            </div>
            <h3>Inventory Management</h3>
            <p>Track your stock levels and get alerts for low inventory</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: "var(--secondary)" }}>
              <FaShoppingCart />
            </div>
            <h3>Expiry Alerts</h3>
            <p>Never miss expiry dates with our smart notification system</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: "var(--accent)" }}>
              <FaShoppingCart />
            </div>
            <h3>Business Analytics</h3>
            <p>Gain insights into your sales and profit margins</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage

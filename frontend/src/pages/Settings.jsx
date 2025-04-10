"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { FaUser, FaStore, FaEnvelope, FaLock } from "react-icons/fa"
import "../styles/Settings.css"

const Settings = () => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>

      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser className="tab-icon" />
            <span>Profile</span>
          </button>

          <button
            className={`tab-button ${activeTab === "store" ? "active" : ""}`}
            onClick={() => setActiveTab("store")}
          >
            <FaStore className="tab-icon" />
            <span>Store Details</span>
          </button>

          <button
            className={`tab-button ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            <FaEnvelope className="tab-icon" />
            <span>Account</span>
          </button>

          <button
            className={`tab-button ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            <FaLock className="tab-icon" />
            <span>Password</span>
          </button>
        </div>

        <div className="settings-content">
          {activeTab === "profile" && (
            <div className="settings-section">
              <h2 className="section-title">Profile Settings</h2>
              <p className="coming-soon-text">Profile settings will be available soon.</p>
            </div>
          )}

          {activeTab === "store" && (
            <div className="settings-section">
              <h2 className="section-title">Store Details</h2>
              <p className="coming-soon-text">Store settings will be available soon.</p>
            </div>
          )}

          {activeTab === "account" && (
            <div className="settings-section">
              <h2 className="section-title">Account Settings</h2>
              <p className="coming-soon-text">Account settings will be available soon.</p>
            </div>
          )}

          {activeTab === "password" && (
            <div className="settings-section">
              <h2 className="section-title">Change Password</h2>
              <p className="coming-soon-text">Password change functionality will be available soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings

"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaUser, FaStore, FaEnvelope, FaLock } from "react-icons/fa";
import ProfileSettings from "../components/settings/ProfileSettings";
import StoreDetails from "../components/settings/StoreDetails";
import AccountSettings from "../components/settings/AccountSettings";
import PasswordSettings from "../components/settings/PasswordSettings";
import "../styles/Settings.css";

const Settings = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const { currentUser } = useAuth();

  useEffect(() => {
    // Set the active tab based on the URL parameter
    if (section) {
      setActiveTab(section);
    } else {
      // If no section is specified, redirect to profile
      navigate("/settings/profile", { replace: true });
    }
  }, [section, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/settings/${tab}`);
  };

  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>

      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => handleTabChange("profile")}
          >
            <FaUser className="tab-icon" />
            <span>Profile</span>
          </button>

          <button
            className={`tab-button ${activeTab === "store" ? "active" : ""}`}
            onClick={() => handleTabChange("store")}
          >
            <FaStore className="tab-icon" />
            <span>Store Details</span>
          </button>

          <button
            className={`tab-button ${activeTab === "account" ? "active" : ""}`}
            onClick={() => handleTabChange("account")}
          >
            <FaEnvelope className="tab-icon" />
            <span>Account</span>
          </button>

          <button
            className={`tab-button ${activeTab === "password" ? "active" : ""}`}
            onClick={() => handleTabChange("password")}
          >
            <FaLock className="tab-icon" />
            <span>Password</span>
          </button>
        </div>

        <div className="settings-content">
          {activeTab === "profile" && <ProfileSettings user={currentUser} />}
          {activeTab === "store" && <StoreDetails user={currentUser} />}
          {activeTab === "account" && <AccountSettings user={currentUser} />}
          {activeTab === "password" && <PasswordSettings user={currentUser} />}
        </div>
      </div>
    </div>
  );
};

export default Settings;

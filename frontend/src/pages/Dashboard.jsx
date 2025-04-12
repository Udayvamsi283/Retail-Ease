"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  FaBoxOpen,
  FaChartLine,
  FaRobot,
  FaCog,
  FaCashRegister,
  FaReceipt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [inventoryStats, setInventoryStats] = useState({
    totalItems: 0,
    lowStock: 0,
    expiringItems: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Create a query against the inventory collection
    const inventoryRef = collection(db, "inventory");
    const q = query(inventoryRef, where("userId", "==", currentUser.uid));

    // Listen for real-time updates
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let total = 0;
        let lowStockCount = 0;
        let expiringCount = 0;
        let totalValue = 0;

        querySnapshot.forEach((doc) => {
          const item = doc.data();
          total++;

          // Check for low stock (less than 5)
          if (item.quantity < 5) {
            lowStockCount++;
          }

          // Check for items expiring within 30 days
          if (item.expiryDate) {
            const expiryDate = new Date(item.expiryDate.seconds * 1000);
            const today = new Date();
            const diffTime = expiryDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0 && diffDays <= 30) {
              expiringCount++;
            }
          }

          // Calculate total inventory value
          totalValue += item.price * item.quantity;
        });

        setInventoryStats({
          totalItems: total,
          lowStock: lowStockCount,
          expiringItems: expiringCount,
          totalValue: totalValue,
        });

        setLoading(false);
      },
      (error) => {
        console.error("Error fetching inventory stats:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="welcome-card">
        <h2>Welcome, {currentUser?.displayName || "User"}!</h2>
        <p>
          Manage your inventory and track your business performance with Retail
          Ease.
        </p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Items</h3>
          <p className="stat-value">
            {loading ? "..." : inventoryStats.totalItems}
          </p>
        </div>

        <div className="stat-card">
          <h3>Low Stock</h3>
          <p className="stat-value">
            {loading ? "..." : inventoryStats.lowStock}
          </p>
        </div>

        <div className="stat-card">
          <h3>Expiring Soon</h3>
          <p className="stat-value">
            {loading ? "..." : inventoryStats.expiringItems}
          </p>
        </div>

        <div className="stat-card">
          <h3>Total Value</h3>
          <p className="stat-value">
            ₹
            {loading
              ? "..."
              : inventoryStats.totalValue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/inventory" className="action-card">
          <div
            className="action-icon"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <FaBoxOpen />
          </div>
          <div className="action-content">
            <h3>Inventory</h3>
            <p>Manage your stock and items</p>
          </div>
        </Link>

        <Link to="/billing" className="action-card">
          <div
            className="action-icon"
            style={{ backgroundColor: "var(--secondary)" }}
          >
            <FaCashRegister />
          </div>
          <div className="action-content">
            <h3>Billing</h3>
            <p>Create bills and process sales</p>
          </div>
        </Link>

        <Link to="/receipts" className="action-card">
          <div
            className="action-icon"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <FaReceipt />
          </div>
          <div className="action-content">
            <h3>Receipts</h3>
            <p>View and manage sales receipts</p>
          </div>
        </Link>

        <Link to="/profit-analysis" className="action-card">
          <div
            className="action-icon"
            style={{ backgroundColor: "var(--highlight)" }}
          >
            <FaChartLine />
          </div>
          <div className="action-content">
            <h3>Profit Analysis</h3>
            <p>Track your business performance</p>
          </div>
        </Link>

        <Link to="/ai-business-help" className="action-card">
          <div
            className="action-icon"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <FaRobot />
          </div>
          <div className="action-content">
            <h3>AI Business Help</h3>
            <p>Get AI-powered business insights</p>
          </div>
        </Link>

        <Link to="/settings/profile" className="action-card">
          <div
            className="action-icon"
            style={{ backgroundColor: "var(--highlight)" }}
          >
            <FaCog />
          </div>
          <div className="action-content">
            <h3>Settings</h3>
            <p>Configure your account</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

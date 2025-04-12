"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { FaBars, FaShoppingCart, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = ({ toggleSidebar }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [expiringItems, setExpiringItems] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Function to get user initials
  const getUserInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase();
    }
    return "U";
  };

  const handleProfileClick = () => {
    navigate("/settings/profile");
  };

  // Fetch expiring items
  useEffect(() => {
    if (!currentUser) return;

    const inventoryRef = collection(db, "inventory");
    const q = query(inventoryRef, where("userId", "==", currentUser.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = [];
      const today = new Date();

      querySnapshot.forEach((doc) => {
        const item = doc.data();

        // Check if item has expiry date
        if (item.expiryDate) {
          const expiryDate = new Date(item.expiryDate.seconds * 1000);
          const daysLeft = Math.ceil(
            (expiryDate - today) / (1000 * 60 * 60 * 24)
          );

          // Add to expiring items if within 7 days
          if (daysLeft <= 7 && daysLeft >= 0) {
            items.push({
              id: doc.id,
              name: item.name,
              expiryDate: expiryDate,
              daysLeft: daysLeft,
            });
          }
        }
      });

      setExpiringItems(items);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <button className="menu-button" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <div className="navbar-logo">
            <FaShoppingCart className="logo-icon" />
            <span className="logo-text">Retail Ease</span>
          </div>
        </div>

        <div className="navbar-right">
          {currentUser && (
            <div className="notification-bell" ref={notificationRef}>
              <button className="bell-button" onClick={toggleNotifications}>
                <FaBell />
                {expiringItems.length > 0 && (
                  <span className="notification-badge">
                    {expiringItems.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Expiring Items</h3>
                  </div>
                  <div className="notification-content">
                    {expiringItems.length === 0 ? (
                      <p className="no-notifications">No items expiring soon</p>
                    ) : (
                      <ul className="notification-list">
                        {expiringItems.map((item) => (
                          <li key={item.id} className="notification-item">
                            <span className="item-name">{item.name}</span>
                            <span className="expiry-info">
                              expires in <strong>{item.daysLeft}</strong>{" "}
                              {item.daysLeft === 1 ? "day" : "days"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="user-profile" onClick={handleProfileClick}>
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL || "/placeholder.svg"}
                alt="User Profile"
                className="profile-image"
              />
            ) : (
              <div className="profile-initials">{getUserInitials()}</div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

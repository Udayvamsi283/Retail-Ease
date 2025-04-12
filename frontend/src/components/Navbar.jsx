"use client";

import { useAuth } from "../contexts/AuthContext";
import { FaBars, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = ({ toggleSidebar }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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

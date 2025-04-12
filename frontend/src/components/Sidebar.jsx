"use client";

import { NavLink } from "react-router-dom";
import {
  FaBoxOpen,
  FaChartLine,
  FaRobot,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaReceipt,
  FaCashRegister,
  FaCalendarAlt,
} from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar, onLogout }) => {
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <button className="close-button" onClick={toggleSidebar}>
          <FaTimes />
        </button>
      </div>

      <div className="sidebar-content">
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
              onClick={() => toggleSidebar()}
            >
              <FaBoxOpen className="sidebar-icon" />
              <span>Inventory</span>
            </NavLink>
          </li>

          <li className="sidebar-item">
            <NavLink
              to="/billing"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
              onClick={() => toggleSidebar()}
            >
              <FaCashRegister className="sidebar-icon" />
              <span>Billing</span>
            </NavLink>
          </li>

          <li className="sidebar-item">
            <NavLink
              to="/receipts"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
              onClick={() => toggleSidebar()}
            >
              <FaReceipt className="sidebar-icon" />
              <span>Receipts</span>
            </NavLink>
          </li>

          <li className="sidebar-item">
            <NavLink
              to="/expiry-insights"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
              onClick={() => toggleSidebar()}
            >
              <FaCalendarAlt className="sidebar-icon" />
              <span>Expiry Insights</span>
            </NavLink>
          </li>

          <li className="sidebar-item">
            <NavLink
              to="/profit-analysis"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
              onClick={() => toggleSidebar()}
            >
              <FaChartLine className="sidebar-icon" />
              <span>Profit Analysis</span>
            </NavLink>
          </li>

          <li className="sidebar-item">
            <NavLink
              to="/ai-business-help"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
              onClick={() => toggleSidebar()}
            >
              <FaRobot className="sidebar-icon" />
              <span>AI Business Help</span>
            </NavLink>
          </li>

          <li className="sidebar-item">
            <NavLink
              to="/settings/profile"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
              onClick={() => toggleSidebar()}
            >
              <FaCog className="sidebar-icon" />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={onLogout}>
          <FaSignOutAlt className="sidebar-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

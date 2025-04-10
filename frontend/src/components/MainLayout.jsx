"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import "../styles/MainLayout.css"

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  return (
    <div className="main-layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="layout-container">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} onLogout={handleLogout} />
        <main className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}>{children}</main>
      </div>
    </div>
  )
}

export default MainLayout

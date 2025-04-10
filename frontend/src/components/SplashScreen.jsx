"use client"

import { useEffect, useState } from "react"
import { FaShoppingCart } from "react-icons/fa"
import "../styles/SplashScreen.css"

const SplashScreen = () => {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Start fade out animation after 2.5 seconds
    const timer = setTimeout(() => {
      setFadeOut(true)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`splash-screen ${fadeOut ? "fade-out" : "fade-in"}`}>
      <div className="splash-content">
        <div className="logo-container">
          <FaShoppingCart className="cart-icon" />
        </div>
        <h1 className="app-name">Retail Ease</h1>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen

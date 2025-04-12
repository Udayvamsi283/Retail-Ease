"use client"

import { useEffect, useState } from "react"
import "../../styles/profit-analysis/MetricCard.css"

const MetricCard = ({
  title,
  value,
  subvalue,
  icon,
  color,
  isCurrency = false,
  imageUrl,
  altValue = null,
  altLabel = null,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Add animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Format currency values
  const formatCurrency = (value) => {
    if (typeof value !== "number") return value

    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)} K`
    } else {
      return `₹${value.toFixed(2)}`
    }
  }

  // Determine display value
  const displayValue = isCurrency ? formatCurrency(value) : value
  const displayAltValue = altValue !== null ? (isCurrency ? formatCurrency(altValue) : altValue) : null

  return (
    <div className={`metric-card ${color} ${isVisible ? "visible" : ""}`}>
      <div className="metric-icon">{icon}</div>

      <div className="metric-content">
        <h3 className="metric-title">{title}</h3>

        <div className="metric-value-container">
          {imageUrl ? (
            <div className="metric-with-image">
              <img src={imageUrl || "/placeholder.svg"} alt={value} className="metric-image" />
              <div>
                <p className="metric-value">{displayValue}</p>
                {subvalue && <p className="metric-subvalue">{subvalue}</p>}
              </div>
            </div>
          ) : (
            <>
              <p className="metric-value">{displayValue}</p>
              {subvalue && <p className="metric-subvalue">{subvalue}</p>}
            </>
          )}

          {displayAltValue !== null && (
            <div className="metric-alt-value">
              <span className="alt-label">{altLabel || "Alt"}</span>
              <span className="alt-value">{displayAltValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MetricCard

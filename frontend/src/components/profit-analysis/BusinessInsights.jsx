"use client"

import { useState, useEffect } from "react"
import { FaLightbulb } from "react-icons/fa"
import "../../styles/profit-analysis/BusinessInsights.css"

const BusinessInsights = ({ insights }) => {
  const [currentInsight, setCurrentInsight] = useState(0)

  useEffect(() => {
    if (!insights || insights.length <= 1) return

    // Auto-rotate insights every 8 seconds
    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [insights])

  if (!insights || insights.length === 0) {
    return null
  }

  return (
    <div className="business-insights">
      <div className="insight-icon">
        <FaLightbulb />
      </div>

      <div className="insight-content">
        <p className="insight-text">{insights[currentInsight]}</p>

        {insights.length > 1 && (
          <div className="insight-indicators">
            {insights.map((_, index) => (
              <span
                key={index}
                className={`indicator ${index === currentInsight ? "active" : ""}`}
                onClick={() => setCurrentInsight(index)}
              ></span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessInsights

"use client"

import "../../styles/profit-analysis/TopSellingItems.css"

const TopSellingItems = ({ items, viewMode }) => {
  if (!items || items.length === 0) {
    return <div className="no-data">No sales data available</div>
  }

  // Find the maximum value for scaling the bars
  const maxValue = Math.max(...items.map((item) => (viewMode === "revenue" ? item.revenue : item.profit)))

  return (
    <div className="top-items-container">
      {items.map((item, index) => {
        const value = viewMode === "revenue" ? item.revenue : item.profit
        const percentage = (value / maxValue) * 100

        return (
          <div key={item.itemId || index} className="top-item">
            <div className="item-info">
              <div className="item-rank">{index + 1}</div>
              <div className="item-details">
                <h4 className="item-name">{item.name}</h4>
                <p className="item-sold">{item.quantitySold} units sold</p>
              </div>
            </div>

            <div className="item-value-container">
              <div className="item-bar-container">
                <div
                  className="item-bar"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: viewMode === "revenue" ? "var(--secondary)" : "var(--highlight)",
                  }}
                ></div>
              </div>
              <div className="item-value">₹{value.toFixed(0)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TopSellingItems

"use client"

import { FaEdit, FaTrash, FaPlus, FaMinus } from "react-icons/fa"
import "../styles/InventoryList.css"

const InventoryList = ({ items, loading, onDelete, onEdit, onUpdateQuantity }) => {
  // Format date from Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"

    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleDateString()
  }

  // Check if item is expiring soon (within 30 days)
  const isExpiringSoon = (timestamp) => {
    if (!timestamp) return false

    const expiryDate = new Date(timestamp.seconds * 1000)
    const today = new Date()
    const diffTime = expiryDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 && diffDays <= 30
  }

  // Check if item is low in stock (less than 5)
  const isLowStock = (quantity) => {
    return quantity < 5
  }

  if (loading) {
    return <div className="loading">Loading inventory...</div>
  }

  if (items.length === 0) {
    return (
      <div className="empty-inventory">
        <p>No items found. Add your first item using the form above.</p>
      </div>
    )
  }

  return (
    <div className="inventory-list">
      <h2 className="list-title">Your Inventory ({items.length} items)</h2>

      <div className="item-grid">
        {items.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-image">
              {item.imageUrl ? (
                <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>

            <div className="item-details">
              <h3 className="item-name">{item.name}</h3>

              <div className="item-info">
                <div className="info-row">
                  <span className="info-label">Price:</span>
                  <span className="info-value">₹{item.price.toFixed(2)}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Category:</span>
                  <span className="info-value">{item.category || "Uncategorized"}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Expiry:</span>
                  <span className={`info-value ${isExpiringSoon(item.expiryDate) ? "expiring-soon" : ""}`}>
                    {formatDate(item.expiryDate)}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Barcode:</span>
                  <span className="info-value">{item.barcode || "N/A"}</span>
                </div>
              </div>

              <div className="quantity-control">
                <button
                  className="quantity-btn minus-btn"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 0}
                >
                  <FaMinus />
                </button>

                <span className={`quantity-value ${isLowStock(item.quantity) ? "low-stock" : ""}`}>
                  {item.quantity}
                </span>

                <button className="quantity-btn plus-btn" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="item-actions">
              <button className="action-btn edit-btn" onClick={() => onEdit(item)} title="Edit Item">
                <FaEdit />
              </button>

              <button className="action-btn delete-btn" onClick={() => onDelete(item.id)} title="Delete Item">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InventoryList

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  FaExclamationTriangle,
  FaGift,
  FaPercentage,
  FaCheck,
} from "react-icons/fa";
import "../styles/ExpiryInsights.css";

const ExpiryInsights = () => {
  const { currentUser } = useAuth();
  const [expiringItems, setExpiringItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [discountInputs, setDiscountInputs] = useState({});
  const [updatingItems, setUpdatingItems] = useState({});
  const [successMessages, setSuccessMessages] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

    // Create a query to get all inventory items with expiry dates
    const inventoryRef = collection(db, "inventory");
    const q = query(
      inventoryRef,
      where("userId", "==", currentUser.uid),
      where("expiryDate", "!=", null)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items = [];
        const today = new Date();

        querySnapshot.forEach((doc) => {
          const item = {
            id: doc.id,
            ...doc.data(),
          };

          // Only process items with valid expiry dates
          if (item.expiryDate) {
            const expiryDate = item.expiryDate.toDate
              ? item.expiryDate.toDate()
              : new Date(item.expiryDate);
            const daysLeft = Math.ceil(
              (expiryDate - today) / (1000 * 60 * 60 * 24)
            );

            // Only include items expiring within 14 days and not marked as donated
            if (daysLeft <= 14 && daysLeft >= 0 && !item.donated) {
              items.push({
                ...item,
                expiryDate,
                daysLeft,
                urgency:
                  daysLeft <= 3 ? "high" : daysLeft <= 7 ? "medium" : "low",
                recommendedDiscount:
                  daysLeft <= 3 ? 50 : daysLeft <= 7 ? 30 : 10,
              });
            }
          }
        });

        // Sort by days left (ascending)
        items.sort((a, b) => a.daysLeft - b.daysLeft);

        setExpiringItems(items);

        // Initialize discount inputs with recommended values
        const initialDiscounts = {};
        items.forEach((item) => {
          initialDiscounts[item.id] =
            item.discountApplied || item.recommendedDiscount;
        });
        setDiscountInputs(initialDiscounts);

        setLoading(false);
      },
      (error) => {
        console.error("Error fetching expiring items:", error);
        setError("Failed to load expiring items");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const handleDiscountChange = (itemId, value) => {
    // Ensure discount is between 0 and 100
    const discount = Math.min(Math.max(Number.parseInt(value) || 0, 0), 100);
    setDiscountInputs((prev) => ({
      ...prev,
      [itemId]: discount,
    }));
  };

  const applyDiscount = async (item) => {
    const discountPercentage = discountInputs[item.id];

    if (discountPercentage < 0 || discountPercentage > 100) {
      setError("Discount must be between 0% and 100%");
      return;
    }

    setUpdatingItems((prev) => ({ ...prev, [item.id]: true }));
    setError("");

    try {
      // Calculate the discounted price
      const originalPrice = item.originalPrice || item.price;
      const discountedPrice = originalPrice * (1 - discountPercentage / 100);

      // Update the item in Firestore
      await updateDoc(doc(db, "inventory", item.id), {
        price: discountedPrice,
        originalPrice: originalPrice,
        discountApplied: discountPercentage,
        discountUpdatedAt: serverTimestamp(),
      });

      // Show success message
      setSuccessMessages((prev) => ({
        ...prev,
        [item.id]: `${discountPercentage}% discount applied!`,
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessages((prev) => {
          const newMessages = { ...prev };
          delete newMessages[item.id];
          return newMessages;
        });
      }, 3000);
    } catch (error) {
      console.error("Error applying discount:", error);
      setError("Failed to apply discount. Please try again.");
    }

    setUpdatingItems((prev) => {
      const newUpdating = { ...prev };
      delete newUpdating[item.id];
      return newUpdating;
    });
  };

  const markAsDonated = async (item) => {
    setUpdatingItems((prev) => ({ ...prev, [item.id]: true }));

    try {
      await updateDoc(doc(db, "inventory", item.id), {
        donated: true,
        donatedAt: serverTimestamp(),
      });

      // Show success message
      setSuccessMessages((prev) => ({
        ...prev,
        [item.id]: "Marked as donated!",
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessages((prev) => {
          const newMessages = { ...prev };
          delete newMessages[item.id];
          return newMessages;
        });
      }, 3000);
    } catch (error) {
      console.error("Error marking as donated:", error);
      setError("Failed to mark as donated. Please try again.");
    }

    setUpdatingItems((prev) => {
      const newUpdating = { ...prev };
      delete newUpdating[item.id];
      return newUpdating;
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="expiry-insights-page">
      <h1 className="page-title">Expiry Insights</h1>

      <div className="insights-header">
        <p className="insights-description">
          Manage products nearing expiry with smart discount suggestions and
          donation recommendations.
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading expiring items...</p>
        </div>
      ) : expiringItems.length === 0 ? (
        <div className="no-items-container">
          <FaExclamationTriangle className="no-items-icon" />
          <h2>No Expiring Items</h2>
          <p>You don't have any products expiring within the next 14 days.</p>
        </div>
      ) : (
        <div className="expiring-items-container">
          <div className="expiry-legend">
            <div className="legend-item">
              <span className="legend-color high"></span>
              <span>0-3 days left</span>
            </div>
            <div className="legend-item">
              <span className="legend-color medium"></span>
              <span>4-7 days left</span>
            </div>
            <div className="legend-item">
              <span className="legend-color low"></span>
              <span>8-14 days left</span>
            </div>
          </div>

          <div className="expiring-items-grid">
            {expiringItems.map((item) => (
              <div
                key={item.id}
                className={`expiry-item-card urgency-${item.urgency}`}
              >
                {successMessages[item.id] && (
                  <div className="success-badge">
                    <FaCheck /> {successMessages[item.id]}
                  </div>
                )}

                <div className="item-image">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>

                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>

                  <div className="expiry-info">
                    <p className="expiry-date">
                      Expires: <span>{formatDate(item.expiryDate)}</span>
                    </p>
                    <p className="days-left">
                      <strong>{item.daysLeft}</strong>{" "}
                      {item.daysLeft === 1 ? "day" : "days"} left
                    </p>
                  </div>

                  <div className="price-info">
                    <p className="current-price">
                      Current Price: <span>₹{item.price.toFixed(2)}</span>
                    </p>
                    {item.originalPrice && (
                      <p className="original-price">
                        Original: <span>₹{item.originalPrice.toFixed(2)}</span>
                      </p>
                    )}
                  </div>

                  <div className="discount-section">
                    <p className="recommended-discount">
                      Recommended:{" "}
                      <strong>{item.recommendedDiscount}% off</strong>
                    </p>

                    <div className="discount-input-group">
                      <div className="discount-input-container">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discountInputs[item.id] || ""}
                          onChange={(e) =>
                            handleDiscountChange(item.id, e.target.value)
                          }
                          disabled={updatingItems[item.id]}
                          className="discount-input"
                        />
                        <span className="discount-symbol">%</span>
                      </div>

                      <button
                        className="apply-discount-btn"
                        onClick={() => applyDiscount(item)}
                        disabled={updatingItems[item.id]}
                      >
                        {updatingItems[item.id] ? "Applying..." : "Apply"}
                      </button>
                    </div>

                    {item.discountApplied && !successMessages[item.id] && (
                      <div className="discount-applied-badge">
                        <FaPercentage /> {item.discountApplied}% discount
                        applied
                      </div>
                    )}
                  </div>

                  {item.quantity > 10 && item.daysLeft <= 3 && (
                    <div className="donation-section">
                      <div className="donation-message">
                        <FaGift className="donation-icon" />
                        <p>
                          Consider donating - high stock with very short expiry
                        </p>
                      </div>

                      <button
                        className="donate-btn"
                        onClick={() => markAsDonated(item)}
                        disabled={updatingItems[item.id]}
                      >
                        {updatingItems[item.id]
                          ? "Processing..."
                          : "Mark as Donated"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryInsights;

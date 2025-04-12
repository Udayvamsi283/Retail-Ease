"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { FaSearch, FaCalendarAlt, FaReceipt, FaEye } from "react-icons/fa";
import "../styles/Receipts.css";

const Receipts = () => {
  const { currentUser } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Fetch receipts
  useEffect(() => {
    if (!currentUser) return;

    const fetchReceipts = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "receipts"),
          where("userId", "==", currentUser.uid),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const receiptsList = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          receiptsList.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          });
        });

        setReceipts(receiptsList);
        setFilteredReceipts(receiptsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching receipts:", error);
        setError("Failed to load receipts");
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [currentUser]);

  // Apply filters
  useEffect(() => {
    let filtered = [...receipts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((receipt) =>
        receipt.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((receipt) => receipt.timestamp >= startDate);
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((receipt) => receipt.timestamp <= endDate);
    }

    // Apply payment method filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(
        (receipt) => receipt.paymentMethod === paymentFilter
      );
    }

    setFilteredReceipts(filtered);
  }, [searchTerm, dateRange, paymentFilter, receipts]);

  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  // View receipt details
  const viewReceiptDetails = (receipt) => {
    setSelectedReceipt(receipt);
  };

  // Close receipt details modal
  const closeReceiptDetails = () => {
    setSelectedReceipt(null);
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="receipts-page">
      <h1 className="page-title">Receipts</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="receipts-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search items in receipts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <div className="date-filters">
            <div className="date-filter">
              <label htmlFor="start">
                <FaCalendarAlt /> From
              </label>
              <input
                type="date"
                id="start"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
              />
            </div>
            <div className="date-filter">
              <label htmlFor="end">
                <FaCalendarAlt /> To
              </label>
              <input
                type="date"
                id="end"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
              />
            </div>
          </div>

          <div className="payment-filter">
            <label htmlFor="paymentFilter">Payment Method</label>
            <select
              id="paymentFilter"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading receipts...</div>
      ) : (
        <div className="receipts-list">
          {filteredReceipts.length === 0 ? (
            <div className="no-receipts">No receipts found</div>
          ) : (
            filteredReceipts.map((receipt) => (
              <div key={receipt.id} className="receipt-card">
                <div className="receipt-header">
                  <div className="receipt-icon">
                    <FaReceipt />
                  </div>
                  <div className="receipt-info">
                    <h3>Receipt #{receipt.id.slice(-6)}</h3>
                    <p className="receipt-date">
                      {formatDate(receipt.timestamp)} at{" "}
                      {formatTime(receipt.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="receipt-summary">
                  <div className="receipt-items-summary">
                    <p>{receipt.items.length} item(s)</p>
                    <ul className="items-preview">
                      {receipt.items.slice(0, 3).map((item, index) => (
                        <li key={index}>
                          {item.quantity} x {item.name}
                        </li>
                      ))}
                      {receipt.items.length > 3 && (
                        <li>+ {receipt.items.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                  <div className="receipt-total">
                    <p className="total-amount">₹{receipt.total.toFixed(2)}</p>
                    <p className="payment-method">
                      {receipt.paymentMethod === "cash"
                        ? "Cash Payment"
                        : "UPI Payment"}
                    </p>
                  </div>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => viewReceiptDetails(receipt)}
                >
                  <FaEye /> View Details
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Receipt Details Modal */}
      {selectedReceipt && (
        <div className="modal-overlay">
          <div className="receipt-details-modal">
            <h2>Receipt Details</h2>
            <div className="receipt-content">
              <div className="receipt-header">
                <p>Receipt ID: {selectedReceipt.id}</p>
                <p>
                  Date: {formatDate(selectedReceipt.timestamp)}{" "}
                  {formatTime(selectedReceipt.timestamp)}
                </p>
              </div>
              <div className="receipt-items">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReceipt.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price.toFixed(2)}</td>
                        <td>₹{item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="receipt-summary">
                <p>
                  <strong>Total Amount:</strong> ₹
                  {selectedReceipt.total.toFixed(2)}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {selectedReceipt.paymentMethod === "cash" ? "Cash" : "UPI"}
                </p>
                {selectedReceipt.paymentMethod === "cash" && (
                  <>
                    <p>
                      <strong>Amount Paid:</strong> ₹
                      {selectedReceipt.amountPaid.toFixed(2)}
                    </p>
                    <p>
                      <strong>Change:</strong> ₹
                      {selectedReceipt.change.toFixed(2)}
                    </p>
                  </>
                )}
              </div>
              <div className="receipt-footer">
                <p>Thank you for your purchase!</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={closeReceiptDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;

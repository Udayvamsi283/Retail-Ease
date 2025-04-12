"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  FaSearch,
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import "../styles/Billing.css";

const Billing = () => {
  const { currentUser } = useAuth();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);

  // Fetch inventory items
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const q = query(
      collection(db, "inventory"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setInventoryItems(items);
        setFilteredItems(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching inventory:", error);
        setError("Failed to load inventory items");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  // Filter items based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredItems(inventoryItems);
    } else {
      const filtered = inventoryItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, inventoryItems]);

  // Calculate cart total
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Add item to cart
  const addToCart = (item) => {
    // Check if item is already in cart
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      // If item is already in cart, increase quantity
      if (existingItem.quantity < item.availableQuantity) {
        setCart(
          cart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        );
      } else {
        setError(
          `Maximum available quantity for ${item.name} is ${item.availableQuantity}`
        );
        setTimeout(() => setError(""), 3000);
      }
    } else {
      // If item is not in cart, add it
      if (item.quantity > 0) {
        setCart([
          ...cart,
          { ...item, quantity: 1, availableQuantity: item.quantity },
        ]);
      } else {
        setError(`${item.name} is out of stock`);
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  // Update item quantity in cart
  const updateCartItemQuantity = (itemId, newQuantity) => {
    const item = cart.find((item) => item.id === itemId);

    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    if (newQuantity > item.availableQuantity) {
      setError(
        `Maximum available quantity for ${item.name} is ${item.availableQuantity}`
      );
      setTimeout(() => setError(""), 3000);
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    if (method === "upi") {
      alert("UPI payment is coming soon!");
      return;
    }
    setShowPaymentModal(true);
  };

  // Calculate change amount
  const calculateChange = () => {
    const paid = Number.parseFloat(amountPaid) || 0;
    return paid - cartTotal;
  };

  // Generate receipt
  const generateReceipt = async () => {
    try {
      // Create receipt object
      const receipt = {
        userId: currentUser.uid,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
        total: cartTotal,
        paymentMethod,
        amountPaid: Number.parseFloat(amountPaid) || 0,
        change: calculateChange(),
        timestamp: serverTimestamp(),
      };

      // Add receipt to Firestore
      const docRef = await addDoc(collection(db, "receipts"), receipt);

      // Update inventory quantities
      const updatePromises = cart.map((item) => {
        const newQuantity = item.availableQuantity - item.quantity;
        return updateDoc(doc(db, "inventory", item.id), {
          quantity: newQuantity,
        });
      });

      await Promise.all(updatePromises);

      // Set current receipt for display
      setCurrentReceipt({
        id: docRef.id,
        ...receipt,
        timestamp: new Date(),
      });

      // Reset state
      setReceiptGenerated(true);
      setShowPaymentModal(false);
      setCart([]);
      setAmountPaid("");
      setPaymentMethod("");
    } catch (error) {
      console.error("Error generating receipt:", error);
      setError("Failed to generate receipt");
    }
  };

  // Close receipt and reset state
  const closeReceipt = () => {
    setReceiptGenerated(false);
    setCurrentReceipt(null);
  };

  return (
    <div className="billing-page">
      <h1 className="page-title">Billing</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="billing-container">
        <div className="inventory-section">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading">Loading inventory...</div>
          ) : (
            <div className="inventory-grid">
              {filteredItems.length === 0 ? (
                <div className="no-items">No items found</div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item.id} className="inventory-item">
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
                      <p className="item-price">₹{item.price.toFixed(2)}</p>
                      <p className="item-quantity">
                        {item.quantity > 0
                          ? `${item.quantity} in stock`
                          : "Out of stock"}
                      </p>
                      <p className="item-category">
                        {item.category || "Uncategorized"}
                      </p>
                    </div>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(item)}
                      disabled={item.quantity <= 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="cart-section">
          <div className="cart-header">
            <h2>
              <FaShoppingCart /> Shopping Cart
            </h2>
            {cart.length > 0 && (
              <button className="clear-cart-btn" onClick={clearCart}>
                <FaTrash /> Clear
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">Your cart is empty</div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      <p>₹{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="cart-item-quantity">
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          updateCartItemQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <FaMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          updateCartItemQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <div className="cart-item-subtotal">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-total">
                <h3>Total: ₹{cartTotal.toFixed(2)}</h3>
              </div>

              <div className="payment-options">
                <button
                  className="payment-btn cash-btn"
                  onClick={() => handlePaymentMethodSelect("cash")}
                >
                  Cash Payment
                </button>
                <button
                  className="payment-btn upi-btn"
                  onClick={() => handlePaymentMethodSelect("upi")}
                >
                  UPI Payment
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <h2>Cash Payment</h2>
            <div className="payment-details">
              <div className="payment-info">
                <p>Total Amount: ₹{cartTotal.toFixed(2)}</p>
              </div>
              <div className="payment-form">
                <div className="form-group">
                  <label htmlFor="amountPaid">Amount Paid</label>
                  <input
                    type="number"
                    id="amountPaid"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    min={cartTotal}
                    step="0.01"
                    required
                  />
                </div>
                {amountPaid && Number.parseFloat(amountPaid) >= cartTotal && (
                  <div className="change-amount">
                    <p>Change to Return: ₹{calculateChange().toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={generateReceipt}
                disabled={
                  !amountPaid || Number.parseFloat(amountPaid) < cartTotal
                }
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptGenerated && currentReceipt && (
        <div className="modal-overlay">
          <div className="receipt-modal">
            <h2>Receipt</h2>
            <div className="receipt-content">
              <div className="receipt-header">
                <p>Receipt ID: {currentReceipt.id}</p>
                <p>
                  Date: {currentReceipt.timestamp.toLocaleDateString()}{" "}
                  {currentReceipt.timestamp.toLocaleTimeString()}
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
                    {currentReceipt.items.map((item, index) => (
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
                  {currentReceipt.total.toFixed(2)}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {currentReceipt.paymentMethod === "cash" ? "Cash" : "UPI"}
                </p>
                {currentReceipt.paymentMethod === "cash" && (
                  <>
                    <p>
                      <strong>Amount Paid:</strong> ₹
                      {currentReceipt.amountPaid.toFixed(2)}
                    </p>
                    <p>
                      <strong>Change:</strong> ₹
                      {currentReceipt.change.toFixed(2)}
                    </p>
                  </>
                )}
              </div>
              <div className="receipt-footer">
                <p>Thank you for your purchase!</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={closeReceipt}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;

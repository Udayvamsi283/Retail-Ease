"use client";

import { useState, useEffect } from "react";
import { FaCamera, FaBarcode } from "react-icons/fa";
import "../styles/InventoryForm.css";

const InventoryForm = ({
  onSubmit,
  onUpdate,
  editItem,
  setEditItem,
  categories,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    expiryDate: "",
    category: "",
    barcode: "",
    newCategory: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Set form data when editing an item
  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name || "",
        quantity: editItem.quantity || 0,
        costPrice: editItem.costPrice || 0,
        sellingPrice: editItem.sellingPrice || editItem.price || 0,
        expiryDate: editItem.expiryDate
          ? new Date(editItem.expiryDate.seconds * 1000)
              .toISOString()
              .split("T")[0]
          : "",
        category: editItem.category || "",
        barcode: editItem.barcode || "",
        newCategory: "",
      });

      if (editItem.imageUrl) {
        setImagePreview(editItem.imageUrl);
      } else {
        setImagePreview(null);
      }
    }
  }, [editItem]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate prices
      if (formData.costPrice <= 0) {
        setError("Cost price must be greater than zero");
        setLoading(false);
        return;
      }

      if (formData.sellingPrice <= 0) {
        setError("Selling price must be greater than zero");
        setLoading(false);
        return;
      }

      // Prepare data
      const itemData = {
        name: formData.name,
        quantity: formData.quantity,
        costPrice: formData.costPrice,
        sellingPrice: formData.sellingPrice,
        price: formData.sellingPrice, // Keep price field for backward compatibility
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        category:
          formData.category === "new"
            ? formData.newCategory
            : formData.category || "Uncategorized",
        barcode: formData.barcode,
      };

      // If editing, update the item
      if (editItem) {
        if (imageFile) {
          setLoading(true);
          // Show uploading message
          setSuccess("Uploading image...");
        }

        const result = await onUpdate(
          editItem.id,
          { ...itemData, imageUrl: editItem.imageUrl },
          imageFile
        );

        if (result.success) {
          setSuccess("Item updated successfully!");
          resetForm();
        } else {
          setError(result.error || "Failed to update item");
        }
      }
      // Otherwise, add a new item
      else {
        if (imageFile) {
          setLoading(true);
          // Show uploading message
          setSuccess("Uploading image...");
        }

        const result = await onSubmit(itemData, imageFile);

        if (result.success) {
          setSuccess("Item added successfully!");
          resetForm();
        } else {
          setError(result.error || "Failed to add item");
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      setError("An unexpected error occurred");
    }

    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      quantity: 0,
      costPrice: 0,
      sellingPrice: 0,
      expiryDate: "",
      category: "",
      barcode: "",
      newCategory: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setEditItem(null);
  };

  const handleScanBarcode = () => {
    // Placeholder for QuaggaJS integration
    alert(
      "Barcode scanner will be integrated with QuaggaJS in the future. This is a placeholder."
    );

    // For now, just set a dummy barcode
    setFormData((prev) => ({
      ...prev,
      barcode: "SCAN" + Math.floor(Math.random() * 1000000),
    }));
  };

  return (
    <div className="inventory-form-container">
      <h2 className="form-title">{editItem ? "Edit Item" : "Add New Item"}</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="inventory-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Item Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter item name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity*</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              step="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="costPrice">Cost Price (₹)*</label>
            <input
              type="number"
              id="costPrice"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              placeholder="Purchase price"
            />
            <small className="form-hint">
              Price at which you purchased the item
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="sellingPrice">Selling Price (₹)*</label>
            <input
              type="number"
              id="sellingPrice"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              placeholder="Retail price"
            />
            <small className="form-hint">
              Price at which you sell to customers
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date (Optional)</label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              placeholder="Optional"
            />
            <small className="form-hint">
              Leave empty for items without expiry date
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="new">+ Add New Category</option>
            </select>
          </div>

          {formData.category === "new" && (
            <div className="form-group">
              <label htmlFor="newCategory">New Category</label>
              <input
                type="text"
                id="newCategory"
                name="newCategory"
                value={formData.newCategory}
                onChange={handleChange}
                placeholder="Enter new category name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="barcode">Barcode</label>
            <button
              type="button"
              className="scan-barcode-btn"
              onClick={handleScanBarcode}
            >
              <FaBarcode className="barcode-icon" />
              <span>Scan Barcode</span>
            </button>
            {formData.barcode && (
              <div className="barcode-result">
                <span>Barcode: {formData.barcode}</span>
              </div>
            )}
          </div>

          <div className="form-group image-upload-group">
            <label>Item Image</label>
            <div className="image-upload">
              <input
                type="file"
                id="image"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="image-input"
              />
              <label htmlFor="image" className="image-label">
                <FaCamera className="camera-icon" />
                <span>
                  {imageFile ? "Change Image" : "Upload Image / Take Photo"}
                </span>
              </label>

              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          {editItem && (
            <button
              type="button"
              className="outline-btn cancel-btn"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="primary-btn submit-btn"
            disabled={loading}
          >
            {loading ? "Processing..." : editItem ? "Update Item" : "Add Item"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;

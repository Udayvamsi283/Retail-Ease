"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { FaSearch } from "react-icons/fa";
import InventoryForm from "../components/InventoryForm";
import InventoryList from "../components/InventoryList";
import "../styles/Inventory.css";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [editItem, setEditItem] = useState(null);
  const { currentUser } = useAuth();

  // First, add new state variables for sorting and filtering
  const [sortOption, setSortOption] = useState("category");
  const [sortDirection, setSortDirection] = useState("asc");

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
        const inventoryItems = [];
        const categorySet = new Set(["All"]);

        querySnapshot.forEach((doc) => {
          const item = {
            id: doc.id,
            ...doc.data(),
          };
          inventoryItems.push(item);

          if (item.category) {
            categorySet.add(item.category);
          }
        });

        setItems(inventoryItems);
        setCategories(Array.from(categorySet));
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

  // Replace the handleAddItem function with this updated version that uses Cloudinary
  const handleAddItem = async (itemData, imageFile) => {
    try {
      let imageUrl = null;

      // Upload image to Cloudinary if provided
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      // Add document to Firestore
      await addDoc(collection(db, "inventory"), {
        ...itemData,
        imageUrl,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error adding item:", error);
      return { success: false, error: "Failed to add item" };
    }
  };

  // Replace the handleUpdateItem function with this updated version
  const handleUpdateItem = async (id, itemData, imageFile) => {
    try {
      let imageUrl = itemData.imageUrl;

      // Upload new image to Cloudinary if provided
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      // Update document in Firestore
      await updateDoc(doc(db, "inventory", id), {
        ...itemData,
        imageUrl,
        updatedAt: serverTimestamp(),
      });

      setEditItem(null);
      return { success: true };
    } catch (error) {
      console.error("Error updating item:", error);
      return { success: false, error: "Failed to update item" };
    }
  };

  // Delete item
  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "inventory", id));
      } catch (error) {
        console.error("Error deleting item:", error);
        setError("Failed to delete item");
      }
    }
  };

  // Update item quantity
  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 0) return;

    try {
      await updateDoc(doc(db, "inventory", id), {
        quantity: newQuantity,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Failed to update quantity");
    }
  };

  // Add this function to handle sorting
  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === "price-asc") {
      setSortOption("sellingPrice");
      setSortDirection("asc");
    } else if (value === "price-desc") {
      setSortOption("sellingPrice");
      setSortDirection("desc");
    } else if (value === "expiry-asc") {
      setSortOption("expiryDate");
      setSortDirection("asc");
    } else {
      setSortOption(value);
      setSortDirection("asc");
    }
  };

  // Filter items based on search and category
  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOption === "sellingPrice" || sortOption === "price") {
        const aPrice = a.sellingPrice || a.price || 0;
        const bPrice = b.sellingPrice || b.price || 0;
        return sortDirection === "asc" ? aPrice - bPrice : bPrice - aPrice;
      } else if (sortOption === "expiryDate") {
        if (!a.expiryDate && !b.expiryDate) return 0;
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return sortDirection === "asc"
          ? a.expiryDate.seconds - b.expiryDate.seconds
          : b.expiryDate.seconds - a.expiryDate.seconds;
      } else if (sortOption === "category") {
        const catA = a.category || "Uncategorized";
        const catB = b.category || "Uncategorized";
        return catA.localeCompare(catB);
      }
      return 0;
    });

  // Group items by category for the updated UI
  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Add the Cloudinary upload function
  const uploadImageToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "retailease_unsigned");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dsqoz1bfm/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.secure_url; // Return the secure URL to save in Firestore
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Image upload failed. Please try again.");
    }
  };

  return (
    <div className="inventory-page">
      <h1 className="page-title">Inventory Management</h1>

      {error && <div className="error-message">{error}</div>}

      <InventoryForm
        onSubmit={handleAddItem}
        onUpdate={handleUpdateItem}
        editItem={editItem}
        setEditItem={setEditItem}
        categories={categories.filter((cat) => cat !== "All")}
      />

      <div className="inventory-filters">
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

        <div className="filter-options">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={
              sortOption === "sellingPrice" || sortOption === "price"
                ? `price-${sortDirection}`
                : sortOption === "expiryDate"
                ? "expiry-asc"
                : sortOption
            }
            onChange={handleSortChange}
            className="sort-filter"
          >
            <option value="category">Sort by Category</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="expiry-asc">Expiry: Sooner to Later</option>
          </select>
        </div>
      </div>

      <InventoryList
        items={filteredItems}
        groupedItems={groupedItems}
        loading={loading}
        onDelete={handleDeleteItem}
        onEdit={setEditItem}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  );
};

export default Inventory;

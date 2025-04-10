"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { db, storage } from "../firebase/config"
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
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { FaSearch } from "react-icons/fa"
import InventoryForm from "../components/InventoryForm"
import InventoryList from "../components/InventoryList"
import "../styles/Inventory.css"

const Inventory = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [categories, setCategories] = useState(["All"])
  const [editItem, setEditItem] = useState(null)
  const { currentUser } = useAuth()

  // Fetch inventory items
  useEffect(() => {
    if (!currentUser) return

    setLoading(true)

    const q = query(collection(db, "inventory"), where("userId", "==", currentUser.uid))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const inventoryItems = []
        const categorySet = new Set(["All"])

        querySnapshot.forEach((doc) => {
          const item = {
            id: doc.id,
            ...doc.data(),
          }
          inventoryItems.push(item)

          if (item.category) {
            categorySet.add(item.category)
          }
        })

        setItems(inventoryItems)
        setCategories(Array.from(categorySet))
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching inventory:", error)
        setError("Failed to load inventory items")
        setLoading(false)
      },
    )

    return unsubscribe
  }, [currentUser])

  // Add new item
  const handleAddItem = async (itemData, imageFile) => {
    try {
      let imageUrl = null

      // Upload image if provided
      if (imageFile) {
        const storageRef = ref(storage, `inventory/${currentUser.uid}/${Date.now()}_${imageFile.name}`)
        await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(storageRef)
      }

      // Add document to Firestore
      await addDoc(collection(db, "inventory"), {
        ...itemData,
        imageUrl,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      })

      return { success: true }
    } catch (error) {
      console.error("Error adding item:", error)
      return { success: false, error: "Failed to add item" }
    }
  }

  // Update existing item
  const handleUpdateItem = async (id, itemData, imageFile) => {
    try {
      let imageUrl = itemData.imageUrl

      // Upload new image if provided
      if (imageFile) {
        const storageRef = ref(storage, `inventory/${currentUser.uid}/${Date.now()}_${imageFile.name}`)
        await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(storageRef)
      }

      // Update document in Firestore
      await updateDoc(doc(db, "inventory", id), {
        ...itemData,
        imageUrl,
        updatedAt: serverTimestamp(),
      })

      setEditItem(null)
      return { success: true }
    } catch (error) {
      console.error("Error updating item:", error)
      return { success: false, error: "Failed to update item" }
    }
  }

  // Delete item
  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "inventory", id))
      } catch (error) {
        console.error("Error deleting item:", error)
        setError("Failed to delete item")
      }
    }
  }

  // Update item quantity
  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 0) return

    try {
      await updateDoc(doc(db, "inventory", id), {
        quantity: newQuantity,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating quantity:", error)
      setError("Failed to update quantity")
    }
  }

  // Filter items based on search and category
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
      </div>

      <InventoryList
        items={filteredItems}
        loading={loading}
        onDelete={handleDeleteItem}
        onEdit={setEditItem}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  )
}

export default Inventory

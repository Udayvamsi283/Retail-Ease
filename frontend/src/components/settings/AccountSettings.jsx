"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { db, storage } from "../../firebase/config"
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore"
import { ref, listAll, deleteObject } from "firebase/storage"
import { deleteUser } from "firebase/auth"
import { FaSignOutAlt, FaTrash, FaInfoCircle } from "react-icons/fa"
import "../../styles/settings/AccountSettings.css"

const AccountSettings = ({ user }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [accountInfo, setAccountInfo] = useState({
    createdAt: null,
    plan: "Free Plan",
  })

  useEffect(() => {
    if (!user) return

    // Fetch user metadata
    const fetchUserMetadata = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setAccountInfo({
            createdAt: user.metadata.creationTime,
            plan: userData.plan || "Free Plan",
          })
        } else {
          setAccountInfo({
            createdAt: user.metadata.creationTime,
            plan: "Free Plan",
          })
        }
      } catch (err) {
        console.error("Error fetching user metadata:", err)
      }
    }

    fetchUserMetadata()
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (err) {
      console.error("Error logging out:", err)
      setError("Failed to log out. Please try again.")
    }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    setError("")

    try {
      // 1. Delete user's inventory items
      const inventoryRef = collection(db, "inventory")
      const inventoryQuery = query(inventoryRef, where("userId", "==", user.uid))
      const inventorySnapshot = await getDocs(inventoryQuery)

      const deletePromises = []
      inventorySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref))
      })

      await Promise.all(deletePromises)

      // 2. Delete user's store data
      await deleteDoc(doc(db, "stores", user.uid))

      // 3. Delete user's profile data
      await deleteDoc(doc(db, "users", user.uid))

      // 4. Delete user's storage files
      const storageRef = ref(storage, `users/${user.uid}`)
      const inventoryStorageRef = ref(storage, `inventory/${user.uid}`)

      try {
        // Delete profile images
        const profileFiles = await listAll(storageRef)
        const profileDeletePromises = profileFiles.items.map((fileRef) => deleteObject(fileRef))
        await Promise.all(profileDeletePromises)

        // Delete inventory images
        const inventoryFiles = await listAll(inventoryStorageRef)
        const inventoryDeletePromises = inventoryFiles.items.map((fileRef) => deleteObject(fileRef))
        await Promise.all(inventoryDeletePromises)
      } catch (storageErr) {
        console.error("Error deleting storage files:", storageErr)
        // Continue with account deletion even if storage deletion fails
      }

      // 5. Delete Firebase Auth user
      await deleteUser(user)

      // Redirect to landing page
      navigate("/")
    } catch (err) {
      console.error("Error deleting account:", err)
      setError("Failed to delete account. Please try again.")
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown"
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="account-settings">
      <h2 className="section-title">Account Settings</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="account-info">
        <div className="info-item">
          <span className="info-label">Email</span>
          <span className="info-value">{user?.email}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Account Created</span>
          <span className="info-value">{formatDate(accountInfo.createdAt)}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Current Plan</span>
          <span className="info-value plan-badge">{accountInfo.plan}</span>
        </div>
      </div>

      <div className="account-actions">
        <button className="secondary-btn logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="btn-icon" />
          <span>Log Out</span>
        </button>

        {!showDeleteConfirm ? (
          <button className="danger-btn delete-btn" onClick={() => setShowDeleteConfirm(true)}>
            <FaTrash className="btn-icon" />
            <span>Delete Account</span>
          </button>
        ) : (
          <div className="delete-confirmation">
            <div className="confirmation-message">
              <FaInfoCircle className="warning-icon" />
              <p>
                Are you sure you want to delete your account? This action cannot be undone and will permanently delete
                all your data.
              </p>
            </div>
            <div className="confirmation-actions">
              <button className="outline-btn cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="danger-btn confirm-delete-btn" onClick={handleDeleteAccount} disabled={loading}>
                {loading ? "Deleting..." : "Yes, Delete My Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountSettings

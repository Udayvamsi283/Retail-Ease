"use client"

import { useState, useEffect } from "react"
import { db } from "../../firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { FaStore } from "react-icons/fa"
import "../../styles/settings/StoreDetails.css"

const StoreDetails = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [storeData, setStoreData] = useState({
    storeName: "",
    address: "",
    contactNumber: "",
    gstin: "",
    storeType: "",
  })

  const storeTypes = [
    "Kirana Store",
    "Medical Store",
    "Bookstore",
    "Electronics",
    "Clothing",
    "Hardware",
    "Stationery",
    "Other",
  ]

  useEffect(() => {
    if (!user) return

    // Fetch store details from Firestore
    const fetchStoreData = async () => {
      try {
        const storeDoc = await getDoc(doc(db, "stores", user.uid))
        if (storeDoc.exists()) {
          setStoreData(storeDoc.data())
        }
      } catch (err) {
        console.error("Error fetching store data:", err)
      }
    }

    fetchStoreData()
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setStoreData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Save store details to Firestore
      await setDoc(
        doc(db, "stores", user.uid),
        {
          ...storeData,
          updatedAt: new Date(),
        },
        { merge: true },
      )

      setSuccess("Store details updated successfully!")
    } catch (err) {
      console.error("Error updating store details:", err)
      setError("Failed to update store details. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="store-details">
      <h2 className="section-title">Store Details</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="store-icon">
          <FaStore />
        </div>

        <div className="form-group">
          <label htmlFor="storeName">Store Name</label>
          <input
            type="text"
            id="storeName"
            name="storeName"
            value={storeData.storeName}
            onChange={handleChange}
            required
            placeholder="Enter your store name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={storeData.address}
            onChange={handleChange}
            rows="3"
            placeholder="Enter your store address"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="contactNumber">Contact Number</label>
          <input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            value={storeData.contactNumber}
            onChange={handleChange}
            placeholder="Enter store contact number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="gstin">GSTIN (Optional)</label>
          <input
            type="text"
            id="gstin"
            name="gstin"
            value={storeData.gstin}
            onChange={handleChange}
            placeholder="Enter your GSTIN"
          />
        </div>

        <div className="form-group">
          <label htmlFor="storeType">Store Type</label>
          <select id="storeType" name="storeType" value={storeData.storeType} onChange={handleChange} required>
            <option value="">Select Store Type</option>
            {storeTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="primary-btn save-btn" disabled={loading}>
          {loading ? "Saving..." : "Save Store Details"}
        </button>
      </form>
    </div>
  )
}

export default StoreDetails

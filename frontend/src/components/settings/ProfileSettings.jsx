"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { db, storage } from "../../firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { FaUser, FaCamera } from "react-icons/fa"
import "../../styles/settings/ProfileSettings.css"

const ProfileSettings = ({ user }) => {
  const { updateUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
  })
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    if (!user) return

    // Set initial values from user object
    setProfileData({
      displayName: user.displayName || "",
      email: user.email || "",
      phoneNumber: "",
    })

    if (user.photoURL) {
      setImagePreview(user.photoURL)
    }

    // Fetch additional user data from Firestore
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setProfileData((prev) => ({
            ...prev,
            phoneNumber: userData.phoneNumber || "",
          }))
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
      }
    }

    fetchUserData()
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setProfileImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      let photoURL = user.photoURL

      // Upload new profile image if selected
      if (profileImage) {
        const storageRef = ref(storage, `users/${user.uid}/profile-image`)
        await uploadBytes(storageRef, profileImage)
        photoURL = await getDownloadURL(storageRef)
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: photoURL,
      })

      // Update Firestore user document
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: profileData.displayName,
          phoneNumber: profileData.phoneNumber,
          photoURL: photoURL,
          updatedAt: new Date(),
        },
        { merge: true },
      )

      setSuccess("Profile updated successfully!")
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="profile-settings">
      <h2 className="section-title">Profile Settings</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="profile-image-upload">
          <div className="profile-image-container">
            {imagePreview ? (
              <img src={imagePreview || "/placeholder.svg"} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-placeholder">
                <FaUser />
              </div>
            )}
            <label htmlFor="profile-image" className="image-upload-label">
              <FaCamera />
            </label>
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              onChange={handleImageChange}
              className="image-upload-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="displayName">Full Name</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={profileData.displayName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={profileData.email} disabled className="disabled-input" />
          <small className="input-note">Email cannot be changed</small>
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={profileData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>

        <button type="submit" className="primary-btn save-btn" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}

export default ProfileSettings

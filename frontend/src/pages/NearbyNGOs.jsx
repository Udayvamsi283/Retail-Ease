"use client";

import {
  FaHandHoldingHeart,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "../styles/NearbyNGOs.css";

const NearbyNGOs = () => {
  // Mock data for nearby NGOs
  const ngos = [
    {
      id: 1,
      name: "Helping Hands Foundation",
      address: "123 Charity Lane, Mumbai, Maharashtra 400001",
      phone: "+91 9876543210",
      email: "contact@helpinghands.org",
      type: "Food Bank",
      description:
        "Collects and distributes food to those in need. Accepts all types of non-perishable food items and fresh produce with at least 3 days of shelf life.",
    },
    {
      id: 2,
      name: "Sunshine Orphanage",
      address: "456 Hope Street, Delhi, Delhi 110001",
      phone: "+91 9876543211",
      email: "info@sunshineorphanage.org",
      type: "Orphanage",
      description:
        "Provides shelter, education, and care for orphaned children. Accepts food, clothing, books, and toys.",
    },
    {
      id: 3,
      name: "Golden Years Home",
      address: "789 Serenity Road, Bangalore, Karnataka 560001",
      phone: "+91 9876543212",
      email: "care@goldenyears.org",
      type: "Old Age Home",
      description:
        "Caring for elderly citizens who need assistance. Accepts food, medicines, clothing, and daily essentials.",
    },
    {
      id: 4,
      name: "New Life Shelter",
      address: "234 Harmony Avenue, Chennai, Tamil Nadu 600001",
      phone: "+91 9876543213",
      email: "donate@newlifeshelter.org",
      type: "Homeless Shelter",
      description:
        "Provides temporary shelter and meals for homeless individuals. Accepts food, clothing, toiletries, and bedding materials.",
    },
    {
      id: 5,
      name: "Green Earth Initiative",
      address: "567 Eco Path, Hyderabad, Telangana 500001",
      phone: "+91 9876543214",
      email: "green@earthinitiative.org",
      type: "Environmental NGO",
      description:
        "Works on sustainable food practices and reducing food waste. Accepts excess food from events and restaurants for redistribution.",
    },
    {
      id: 6,
      name: "Seva Community Kitchen",
      address: "890 Service Road, Kolkata, West Bengal 700001",
      phone: "+91 9876543215",
      email: "kitchen@seva.org",
      type: "Community Kitchen",
      description:
        "Prepares and serves meals to underprivileged communities. Accepts food donations, especially grains, vegetables, and spices.",
    },
  ];

  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="nearby-ngos-page">
      <h1 className="page-title">Nearby NGOs & Donation Centers</h1>

      <div className="page-description">
        <FaHandHoldingHeart className="description-icon" />
        <p>
          Connect with these organizations to donate your excess inventory or
          items nearing expiry. Help reduce waste and support those in need by
          reaching out to these nearby donation centers.
        </p>
      </div>

      <div className="ngos-grid">
        {ngos.map((ngo) => (
          <div key={ngo.id} className="ngo-card">
            <div className="ngo-header">
              <h2 className="ngo-name">{ngo.name}</h2>
              <span className="ngo-type">{ngo.type}</span>
            </div>

            <p className="ngo-description">{ngo.description}</p>

            <div className="ngo-details">
              <div className="detail-item">
                <FaMapMarkerAlt className="detail-icon" />
                <p>{ngo.address}</p>
              </div>

              <div className="detail-item">
                <FaPhone className="detail-icon" />
                <p>{ngo.phone}</p>
              </div>

              {ngo.email && (
                <div className="detail-item">
                  <FaEnvelope className="detail-icon" />
                  <p>{ngo.email}</p>
                </div>
              )}
            </div>

            <div className="ngo-actions">
              <button
                className="contact-btn phone-btn"
                onClick={() => handlePhoneClick(ngo.phone)}
              >
                <FaPhone /> Call
              </button>

              {ngo.email && (
                <button
                  className="contact-btn email-btn"
                  onClick={() => handleEmailClick(ngo.email)}
                >
                  <FaEnvelope /> Email
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyNGOs;

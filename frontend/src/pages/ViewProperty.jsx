import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../services/api";
import ReviewSection from "../components/ReviewSection";
import "../styles/ViewProperty.css";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";

function ViewProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const backPath = location.state?.from || "/listings";

  const role = localStorage.getItem("role");
  const isAdmin =
    role === "ADMIN" || role === "SUB_ADMIN" || location.state?.adminMode;

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const loggedInUserId = loggedInUser?._id || loggedInUser?.id;

  const ownerId = property?.owner?._id || property?.owner;

  const isOwner =
    loggedInUserId &&
    ownerId &&
    loggedInUserId.toString() === ownerId.toString();

  useEffect(() => {
    fetchProperty();
    checkWishlist();
  }, [id]);

  // ---------------- FETCH PROPERTY ----------------
  const fetchProperty = async () => {
    try {
      const token = localStorage.getItem("token");

      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const res = await api.get(`/property/view/${id}`, config);
      setProperty(res.data.data);
    } catch (err) {
      console.log("Fetch Property Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CHECK WISHLIST ----------------
  const checkWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get(`/property/wishlist/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsWishlisted(res.data.exists);
    } catch (err) {
      console.log("Wishlist Check Error:", err.response?.data || err.message);
    }
  };

  // ---------------- LOGIN GUARD ----------------
  const requireLogin = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to continue");

      navigate("/login", {
        state: { from: location.pathname + location.search },
      });

      return null;
    }

    return token;
  };

  // ---------------- WISHLIST ----------------
  const toggleWishlist = async () => {
    try {
      const token = requireLogin();
      if (!token) return;

      await api.post(
        `/property/wishlist/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setIsWishlisted((prev) => !prev);
    } catch (err) {
      console.log("Wishlist Toggle Error:", err.response?.data || err.message);
    }
  };

  // ---------------- CHAT ----------------
  const startChat = async () => {
    try {
      const token = requireLogin();
      if (!token) return;

      const res = await api.post(
        "/chat/start",
        { propertyId: property._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      navigate(`/chat/${res.data.data._id}`);
    } catch (err) {
      console.log("Start chat error:", err.response?.data || err.message);
    }
  };

  // ---------------- ADMIN APPROVE ----------------
  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        requireLogin();
        return;
      }

      const res = await api.patch(
        `/property/admin/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setProperty(res.data.data);
      toast.success("Property approved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    }
  };

  // ---------------- ADMIN REJECT ----------------
  const handleReject = async () => {
    const reason = window.prompt("Enter rejection reason (optional):", "");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        requireLogin();
        return;
      }

      const res = await api.patch(
        `/property/admin/reject/${id}`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setProperty(res.data.data);
      toast.success("Property rejected successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    }
  };

  if (loading) return <div className="vp-loading">Loading...</div>;
  if (!property) return <div className="vp-loading">Property not found</div>;

  const ownerName = property.owner?.name || "Owner";

  return (
    <div className="view-page">
      <button className="vp-back" onClick={() => navigate(backPath)}>
        ← Back
      </button>

      {/* HEADER */}
      <div className="vp-header">
        <div>
          <h1>{property.title}</h1>
          <p>{property.city}</p>
        </div>

        <div className="vp-header-right">
          <h2>₹{property.price}</h2>

          {!isAdmin && (
            <button
              className={`vp-wishlist ${isWishlisted ? "active" : ""}`}
              onClick={toggleWishlist}
            >
              {isWishlisted ? "❤️ Saved" : "♡ Save"}
            </button>
          )}
        </div>
      </div>

      {/* ADMIN APPROVAL PANEL */}
      {isAdmin && (
        <div className="admin-approval-box">
          <h3>Admin Approval Panel</h3>

          <p>
            Current Status:{" "}
            <strong>{property.approvalStatus || "PENDING"}</strong>
          </p>

          {property.rejectionReason && (
            <p className="admin-rejection-reason">
              Reason: {property.rejectionReason}
            </p>
          )}

          <div className="admin-actions">
            <button
              className="approve-btn"
              onClick={handleApprove}
              disabled={property.approvalStatus === "APPROVED"}
            >
              {property.approvalStatus === "APPROVED"
                ? "Already Approved"
                : "Approve Property"}
            </button>

            <button
              className="reject-btn"
              onClick={handleReject}
              disabled={property.approvalStatus === "REJECTED"}
            >
              {property.approvalStatus === "REJECTED"
                ? "Already Rejected"
                : "Reject Property"}
            </button>
          </div>
        </div>
      )}

      {/* GALLERY */}
      <div className="vp-gallery">
        {property.images?.length > 0 ? (
          property.images.map((img, i) => (
            <img key={i} src={img} alt={property.title} />
          ))
        ) : (
          <div className="vp-no-image">No Image Available</div>
        )}
      </div>

      {/* MAIN GRID */}
      <div className="vp-grid">
        {/* LEFT */}
        <div className="vp-details">
          <h3>Property Details</h3>

          <div className="vp-info">
            <span>Type: {property.propertyType}</span>
            <span>Listing For: {property.listingFor}</span>
            <span>BHK: {property.bhk}</span>
            <span>Area: {property.area}</span>
            <span>Furnishing: {property.furnishing}</span>
            <span>Bathrooms: {property.bathrooms}</span>
            <span>Floor: {property.floor}</span>
            <span>Total Floors: {property.totalFloors}</span>
            <span>Status: {property.isActive ? "Active" : "Inactive"}</span>
          </div>

          <p className="vp-desc">{property.description}</p>

          <h3>Location</h3>
          <p>
            {property.fullAddress}, {property.city}, {property.state}{" "}
            {property.pinCode}
          </p>

          {property.nearbyLandmark && (
            <p>Nearby Landmark: {property.nearbyLandmark}</p>
          )}

          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              `${property.fullAddress}, ${property.city}`,
            )}&output=embed`}
            title="map"
          ></iframe>

          {!isAdmin && <ReviewSection propertyId={property._id} />}
        </div>

        {/* RIGHT */}
        <div className="vp-contact">
          <h3>Owner Details</h3>

          <div className="vp-owner-box">
            <p className="vp-owner-label">Listed by</p>
            <h4>{ownerName}</h4>

            {isAdmin && (
              <div className="admin-owner-info">
                <h4>Owner Contact Info</h4>
                <p>Email: {property.owner?.email}</p>
                <p>Phone: {property.owner?.phone}</p>
              </div>
            )}
          </div>

          {!isAdmin && !isOwner && (
            <>
              {/* ACTIONS */}
              <div className="vp-contact-actions"></div>

              <button
                className="vp-visit"
                onClick={() => {
                  const token = requireLogin();
                  if (!token) return;

                  navigate(`/schedule-visit/${property._id}`);
                }}
              >
                Schedule Visit
              </button>

              <button className="vp-chat" onClick={startChat}>
                Chat with Owner
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewProperty;

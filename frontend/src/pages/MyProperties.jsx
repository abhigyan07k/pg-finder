import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import PropertyCardSkeleton from "../components/PropertyCardSkeleton";
import "../styles/MyProperties.css";

function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const requireLogin = () => {
    navigate("/login", {
      state: {
        from: location.pathname + location.search,
      },
    });
  };

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        requireLogin();
        return;
      }

      const response = await api.get("/property/my-properties", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProperties(response.data.data || []);
      setMessage("");
    } catch (error) {
      console.log(
        "Fetch My Properties Error:",
        error.response?.data || error.message,
      );
      setMessage(error.response?.data?.message || "Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const stats = useMemo(() => {
    const active = properties.filter((p) => p.isActive).length;
    const inactive = properties.length - active;
    return { total: properties.length, active, inactive };
  }, [properties]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this property?",
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        requireLogin();
        return;
      }

      await api.delete(`/property/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProperties((prev) => prev.filter((property) => property._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete property");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        requireLogin();
        return;
      }

      const response = await api.patch(
        `/property/toggle-status/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const updatedProperty = response.data.data;

      setProperties((prev) =>
        prev.map((property) =>
          property._id === id ? updatedProperty : property,
        ),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleNextImage = (propertyId, totalImages) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]: ((prev[propertyId] || 0) + 1) % totalImages,
    }));
  };

  const handlePrevImage = (propertyId, totalImages) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]: ((prev[propertyId] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  return (
    <div className="my-properties-page">
      <section className="my-properties-hero">
        <div>
          <span className="hero-badge">Property Management</span>
          <h1>Manage Your Properties</h1>
          <p>
            View, edit, activate, deactivate, and manage all your listed
            properties from one clean place.
          </p>
        </div>

        <button
          className="hero-add-btn"
          onClick={() => navigate("/add-property")}
        >
          + Add Property
        </button>
      </section>

      <section className="property-stats">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Properties</p>
        </div>

        <div className="stat-card">
          <h3>{stats.active}</h3>
          <p>Active Listings</p>
        </div>

        <div className="stat-card">
          <h3>{stats.inactive}</h3>
          <p>Inactive Listings</p>
        </div>
      </section>

      <section className="my-properties-container">
        <div className="section-heading">
          <div>
            <h2>Your Listed Properties</h2>
            <p>Keep your property details updated for better visibility.</p>
          </div>
        </div>

        {loading ? (
          <PropertyCardSkeleton count={4} />
        ) : (
          <>
            {message && <p className="page-error">{message}</p>}

            {!message && properties.length === 0 && (
              <div className="my-empty-state">
                <h3>No properties added yet</h3>
                <p>Start by adding your first property listing.</p>

                <button onClick={() => navigate("/add-property")}>
                  Add Your First Property
                </button>
              </div>
            )}

            {!message && properties.length > 0 && (
              <div className="my-properties-grid">
                {properties.map((property) => (
                  <div key={property._id} className="my-property-card">
                    <div className="property-image-box">
                      {property.images?.length > 0 ? (
                        <>
                          <img
                            src={
                              property.images[
                                currentImageIndexes[property._id] || 0
                              ]
                            }
                            alt={property.title}
                          />

                          {property.images.length > 1 && (
                            <>
                              <button
                                className="carousel-btn prev-btn"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  handlePrevImage(
                                    property._id,
                                    property.images.length,
                                  );
                                }}
                              >
                                ❮
                              </button>

                              <button
                                className="carousel-btn next-btn"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleNextImage(
                                    property._id,
                                    property.images.length,
                                  );
                                }}
                              >
                                ❯
                              </button>

                              <div className="carousel-dots">
                                {property.images.map((_, index) => (
                                  <span
                                    key={index}
                                    className={`dot ${
                                      index ===
                                      (currentImageIndexes[property._id] || 0)
                                        ? "active-dot"
                                        : ""
                                    }`}
                                  ></span>
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="no-property-image">No Image</div>
                      )}

                      <span
                        className={`status-badge ${
                          property.isActive ? "active" : "inactive"
                        }`}
                      >
                        {property.isActive ? "Active" : "Inactive"}
                      </span>

                      {property.isFeatured && (
                        <span className="featured-badge">Featured</span>
                      )}
                    </div>

                    <div className="property-card-body">
                      <h3>{property.title}</h3>

                      <div className="property-meta">
                        <span>{property.propertyType}</span>
                        <span>{property.listingFor}</span>
                        <span>{property.bhk}</span>
                      </div>

                      <p className="property-location">{property.city}</p>

                      <h4>₹{property.price}</h4>
                      <div className="property-analytics">
                        <div className="analytics-item">
                          <span>👁</span>
                          <p>{property.views || 0} Views</p>
                        </div>

                        <div className="analytics-item">
                          <span>💬</span>
                          <p>{property.inquiryCount || 0} Inquiries</p>
                        </div>

                        <div className="analytics-item">
                          <span>❤️</span>
                          <p>{property.wishlistCount || 0} Saves</p>
                        </div>

                        <div className="analytics-item">
                          <span>📅</span>
                          <p>{property.visitCount || 0} Visits</p>
                        </div>

                        <div className="analytics-item">
                          <span>🗨️</span>
                          <p>{property.chatCount || 0} Chats</p>
                        </div>
                      </div>

                      <div className="property-actions">
                        <button
                          className="analytics-btn"
                          onClick={() =>
                            navigate(`/property/analytics/${property._id}`)
                          }
                        >
                          Analytics
                        </button>
                        <button
                          className="view-btn"
                          onClick={() =>
                            navigate(`/property/view/${property._id}`, {
                              state: {
                                from: location.pathname + location.search, //dynamic
                              },
                            })
                          }
                        >
                          View
                        </button>

                        <button
                          className="edit-btn"
                          onClick={() =>
                            navigate(`/edit-property/${property._id}`)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(property._id)}
                        >
                          Delete
                        </button>

                        <button
                          className={
                            property.isActive ? "inactive-btn" : "active-btn"
                          }
                          onClick={() => handleToggleStatus(property._id)}
                        >
                          {property.isActive ? "Mark Inactive" : "Mark Active"}
                        </button>
                        <button
                          className="boost-btn"
                          onClick={() =>
                            navigate(`/property/boost/${property._id}`)
                          }
                        >
                          Boost
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default MyProperties;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../services/api";
import "../styles/OwnerDashboard.css";

function OwnerDashboard() {
  const navigate = useNavigate();

  const [allProperties, setAllProperties] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [inquiryLoading, setInquiryLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");

  const userData = JSON.parse(localStorage.getItem("user"));
  const ownerName = userData?.name || "Owner";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await api.get("/property/my-properties", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const properties = response.data.data || [];
      setAllProperties(properties);
      setRecentProperties(properties.slice(0, 5));
      setMessage("");
    } catch (error) {
      console.log(
        "Owner Dashboard Error:",
        error.response?.data || error.message,
      );
      setMessage("Failed to load dashboard data");
      setAllProperties([]);
      setRecentProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentInquiries = async () => {
    try {
      setInquiryLoading(true);
      const token = localStorage.getItem("token");

      const response = await api.get("/inquiry/owner-recent", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRecentInquiries(response.data.data || []);
      setInquiryMessage("");
    } catch (error) {
      console.log(
        "Recent Inquiries Error:",
        error.response?.data || error.message,
      );
      setInquiryMessage("Failed to load recent inquiries");
      setRecentInquiries([]);
    } finally {
      setInquiryLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRecentInquiries();
  }, []);

  const totalProperties = allProperties.length;
  const activeProperties = allProperties.filter(
    (property) => property.isActive,
  ).length;
  const inactiveProperties = allProperties.filter(
    (property) => !property.isActive,
  ).length;

  return (
    <AppLayout title="Owner Dashboard">
      <div className="owner-dashboard-page">
        <section className="owner-hero">
          <div>
            <h1>Welcome back, {ownerName}</h1>
            <p>
              Manage your listings, track activity, and keep your property
              portfolio updated from one place.
            </p>
          </div>

          <span className="owner-hero-badge">Owner Panel</span>
        </section>

        <section className="owner-stats-grid">
          <div className="owner-stat-card">
            <p>Total Properties</p>
            <h2>{totalProperties}</h2>
            <span>All properties added by you</span>
          </div>

          <div className="owner-stat-card">
            <p>Active Listings</p>
            <h2>{activeProperties}</h2>
            <span>Currently visible properties</span>
          </div>

          <div className="owner-stat-card">
            <p>Inactive Listings</p>
            <h2>{inactiveProperties}</h2>
            <span>Listings currently not active</span>
          </div>

          <div className="owner-stat-card">
            <p>Recent Listings</p>
            <h2>{recentProperties.length}</h2>
            <span>Latest properties on your account</span>
          </div>
        </section>

        <section className="owner-main-grid">
          <div className="owner-left-column">
            <div className="owner-card">
              <div className="owner-card-header">
                <h3>Quick Actions</h3>
                <p>Common actions you can perform quickly</p>
              </div>

              <div className="owner-action-grid">
                <button
                  className="owner-primary-btn"
                  onClick={() => navigate("/add-property")}
                >
                  Add Property
                </button>

                <button
                  className="owner-secondary-btn"
                  onClick={() => navigate("/owner/my-properties")}
                >
                  My Properties
                </button>

                <button
                  className="owner-secondary-btn"
                  onClick={() => navigate("/owner/all-listings")}
                >
                  Manage Listings
                </button>
              </div>
            </div>

            <div className="owner-card">
              <div className="owner-card-header">
                <h3>Recent Properties</h3>
                <p>Your latest added property listings</p>
              </div>

              {loading ? (
                <p className="owner-info-text">Loading properties...</p>
              ) : message ? (
                <p className="owner-error-text">{message}</p>
              ) : recentProperties.length === 0 ? (
                <div className="owner-empty-state">
                  <p className="owner-empty-title">No properties added yet</p>
                  <p className="owner-empty-subtitle">
                    Start by adding your first property listing.
                  </p>
                  <button
                    className="owner-primary-btn"
                    onClick={() => navigate("/add-property")}
                  >
                    Add Your First Property
                  </button>
                </div>
              ) : (
                <div className="owner-property-list">
                  {recentProperties.map((property) => (
                    <div className="owner-property-row" key={property._id}>
                      <div className="owner-property-info">
                        <h4>{property.title}</h4>
                        <p>
                          {property.city} • {property.propertyType} • ₹
                          {property.price}
                        </p>
                      </div>

                      <div className="owner-property-actions">
                        <span
                          className={`owner-status-badge ${
                            property.isActive ? "active" : "inactive"
                          }`}
                        >
                          {property.isActive ? "Active" : "Inactive"}
                        </span>

                        <button
                          className="owner-row-btn"
                          onClick={() =>
                            navigate(`/property/view/${property._id}`, {
                              state: { from: "/owner-dashboard" },
                            })
                          }
                        >
                          View
                        </button>

                        <button
                          className="owner-row-btn"
                          onClick={() =>
                            navigate(`/owner/edit-property/${property._id}`)
                          }
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="owner-right-column">
            <div className="owner-card">
              <div className="owner-card-header">
                <h3>Recent Inquiries</h3>
                <p>Latest inquiry activity on your properties</p>
              </div>

              {inquiryLoading ? (
                <p className="owner-info-text">Loading inquiries...</p>
              ) : inquiryMessage ? (
                <p className="owner-error-text">{inquiryMessage}</p>
              ) : recentInquiries.length === 0 ? (
                <div className="owner-empty-state">
                  <p className="owner-empty-title">No inquiries yet</p>
                  <p className="owner-empty-subtitle">
                    When users contact you about your properties, they will
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="owner-inquiry-list">
                  {recentInquiries.map((item) => (
                    <div className="owner-inquiry-item" key={item._id}>
                      <div className="owner-inquiry-header">
                        <p className="owner-inquiry-name">{item.name}</p>
                        <span className="owner-inquiry-status">
                          {item.status || "NEW"}
                        </span>
                      </div>

                      <p className="owner-inquiry-meta">
                        Property: {item.property?.title || "N/A"}
                      </p>

                      <p className="owner-inquiry-meta">Phone: {item.phone}</p>

                      {item.email && (
                        <p className="owner-inquiry-meta">
                          Email: {item.email}
                        </p>
                      )}

                      <p className="owner-inquiry-message">{item.message}</p>

                      <p className="owner-inquiry-time">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="owner-card">
              <div className="owner-card-header">
                <h3>Owner Insights</h3>
                <p>Useful tips to improve your listings</p>
              </div>

              <div className="owner-insight-list">
                <div className="owner-insight-item">
                  <p>Add high-quality images</p>
                  <span>
                    Listings with clear images usually look more professional
                    and complete.
                  </span>
                </div>

                <div className="owner-insight-item">
                  <p>Keep details updated</p>
                  <span>
                    Make sure price, address, and furnishing details stay
                    accurate.
                  </span>
                </div>

                <div className="owner-insight-item">
                  <p>Review inactive listings</p>
                  <span>
                    Inactive properties should be updated or reactivated when
                    available.
                  </span>
                </div>
              </div>
            </div>

            <div className="owner-card">
              <div className="owner-card-header">
                <h3>Account Summary</h3>
                <p>Quick overview of your owner activity</p>
              </div>

              <div className="owner-summary-box">
                <div className="owner-summary-row">
                  <span>Role</span>
                  <strong>OWNER</strong>
                </div>

                <div className="owner-summary-row">
                  <span>Properties Added</span>
                  <strong>{totalProperties}</strong>
                </div>

                <div className="owner-summary-row">
                  <span>Dashboard Status</span>
                  <strong>Active</strong>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

export default OwnerDashboard;

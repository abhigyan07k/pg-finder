import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiMapPin, FiSearch, FiTrash2 } from "react-icons/fi";
import api from "../services/api";
import PropertyCardSkeleton from "../components/PropertyCardSkeleton";
import "../styles/Wishlist.css";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/property/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlist(res.data.data || []);
      setMessage("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    const confirmRemove = window.confirm("Remove this property from wishlist?");
    if (!confirmRemove) return;

    try {
      const token = localStorage.getItem("token");

      await api.post(
        `/property/wishlist/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setWishlist((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to remove property from wishlist");
    }
  };

  const propertyTypes = useMemo(() => {
    return [...new Set(wishlist.map((p) => p.propertyType).filter(Boolean))];
  }, [wishlist]);

  const filteredWishlist = useMemo(() => {
    return wishlist.filter((p) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        p.title?.toLowerCase().includes(search) ||
        p.city?.toLowerCase().includes(search) ||
        p.fullAddress?.toLowerCase().includes(search);

      const matchesType = selectedType ? p.propertyType === selectedType : true;

      return matchesSearch && matchesType;
    });
  }, [wishlist, searchTerm, selectedType]);

  const stats = useMemo(() => {
    const cities = new Set(wishlist.map((p) => p.city).filter(Boolean)).size;

    const avgPrice =
      wishlist.length > 0
        ? Math.round(
            wishlist.reduce((sum, p) => sum + Number(p.price || 0), 0) /
              wishlist.length,
          )
        : 0;

    return {
      saved: wishlist.length,
      cities,
      avgPrice,
    };
  }, [wishlist]);

  return (
    <div className="wishlist-page">
      <section className="wishlist-hero">
        <span className="wishlist-badge">Saved Properties</span>
        <h1>Your Wishlist</h1>
        <p>
          Keep track of the properties you like and compare them before making a
          decision.
        </p>
      </section>

      <section className="wishlist-stats">
        <div className="wl-stat-card">
          <h3>{stats.saved}</h3>
          <p>Saved Properties</p>
        </div>

        <div className="wl-stat-card">
          <h3>{stats.cities}</h3>
          <p>Cities Covered</p>
        </div>

        <div className="wl-stat-card">
          <h3>₹{stats.avgPrice}</h3>
          <p>Average Price</p>
        </div>
      </section>

      <section className="wishlist-container">
        <div className="wishlist-controls">
          <div>
            <h2>Saved Listings</h2>
            <p>{filteredWishlist.length} matching properties found</p>
          </div>

          <div className="wishlist-filter-row">
            <div className="wl-search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search by title, city or address"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <PropertyCardSkeleton count={6} />
        ) : message ? (
          <p className="wl-error">{message}</p>
        ) : wishlist.length === 0 ? (
          <div className="wl-empty">
            <div className="wl-empty-icon">
              <FiHeart />
            </div>
            <h3>No saved properties yet</h3>
            <p>Start exploring listings and save the properties you like.</p>
            <button onClick={() => navigate("/listings")}>
              Browse Listings
            </button>
          </div>
        ) : filteredWishlist.length === 0 ? (
          <div className="wl-empty">
            <div className="wl-empty-icon">
              <FiSearch />
            </div>
            <h3>No matching properties</h3>
            <p>Try changing your search or filter options.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedType("");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {filteredWishlist.map((p) => {
              const isOwn = p.owner?._id === currentUserId;

              return (
                <article className="wishlist-card" key={p._id}>
                  <div className="wl-img">
                    {p.images?.length > 0 ? (
                      <img src={p.images[0]} alt={p.title} />
                    ) : (
                      <div className="wl-no-image">No Image</div>
                    )}

                    <span className="saved-pill">
                      <FiHeart />
                      Saved
                    </span>

                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(p._id)}
                      title="Remove from wishlist"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className="wl-body">
                    <div className="wl-title-row">
                      <h3>{p.title}</h3>
                      {isOwn && <span className="wl-badge-small">Yours</span>}
                    </div>

                    <p className="wl-location">
                      <FiMapPin />
                      {p.city || "Location not available"}
                    </p>

                    <h4>₹{p.price}</h4>

                    <div className="wl-chips">
                      <span>{p.propertyType || "Property"}</span>
                      <span>{p.listingFor || "Listing"}</span>
                      <span>{p.bhk || "BHK N/A"}</span>
                    </div>

                    <p className="wl-owner">
                      Owner: {isOwn ? "You" : p.owner?.name || "N/A"}
                    </p>

                    <div className="wl-actions">
                      <button
                        className="wl-view"
                        onClick={() =>
                          navigate(`/property/view/${p._id}`, {
                            state: { from: "/wishlist" },
                          })
                        }
                      >
                        View Details
                      </button>

                      <button
                        className="wl-remove-text"
                        onClick={() => handleRemove(p._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Wishlist;

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ListingsHeader from "../components/ListingsHeader";
import api from "../services/api";
import { FiHeart } from "react-icons/fi";
import PropertyCardSkeleton from "../components/PropertyCardSkeleton";
import "../styles/AllListings.css";

function AllListings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBhk, setSelectedBhk] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);

  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();

  const currentUserId = localStorage.getItem("userId");

  const requireLogin = () => {
    navigate("/login", {
      state: {
        from: location.pathname + location.search,
      },
    });
  };

  const fetchActiveListings = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const res = await api.get(
        `/property/active-listings?page=${page}&limit=8`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      );

      const listings =
        res.data.data ||
        res.data.properties ||
        res.data.listings ||
        res.data.property ||
        [];

      setProperties(Array.isArray(listings) ? listings : []);
      setTotalPages(res.data.totalPages || res.data.pages || 1);
    } catch (err) {
      console.log("All listings error:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Failed to load listings");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistIds = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/property/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ids = new Set((res.data.data || []).map((p) => p._id));
      setWishlistIds(ids);
    } catch (err) {
      console.log("Wishlist fetch error:", err.response?.data || err.message);
    }
  };

  const toggleWishlist = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        requireLogin();
        return;
      }

      await api.post(
        `/property/wishlist/${propertyId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setWishlistIds((prev) => {
        const updated = new Set(prev);

        if (updated.has(propertyId)) {
          updated.delete(propertyId);
        } else {
          updated.add(propertyId);
        }

        return updated;
      });
    } catch (err) {
      console.log("Wishlist toggle error:", err.response?.data || err.message);
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

  useEffect(() => {
    fetchActiveListings();
  }, [page]);

  useEffect(() => {
    fetchWishlistIds();
  }, []);

  const cityOptions = useMemo(() => {
    return [...new Set(properties.map((p) => p.city).filter(Boolean))];
  }, [properties]);

  const bhkOptions = useMemo(() => {
    return [...new Set(properties.map((p) => p.bhk).filter(Boolean))];
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        !search ||
        p.title?.toLowerCase().includes(search) ||
        p.city?.toLowerCase().includes(search) ||
        p.fullAddress?.toLowerCase().includes(search);

      const matchesCity = selectedCity ? p.city === selectedCity : true;
      const matchesType = selectedType ? p.propertyType === selectedType : true;
      const matchesBhk = selectedBhk
        ? String(p.bhk) === String(selectedBhk)
        : true;

      return matchesSearch && matchesCity && matchesType && matchesBhk;
    });
  }, [properties, searchTerm, selectedCity, selectedType, selectedBhk]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCity("");
    setSelectedType("");
    setSelectedBhk("");
    setMinPrice(0);
    setMaxPrice(100000);
  };

  return (
    <div className="listings-page">
      <ListingsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedBhk={selectedBhk}
        setSelectedBhk={setSelectedBhk}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        cityOptions={cityOptions}
        bhkOptions={bhkOptions}
        onReset={handleResetFilters}
      />

      <div className="listings-container">
        <div className="listings-top">
          <h2>Available Properties</h2>
          <span>
            Showing {filteredProperties.length} of {properties.length} results
          </span>
        </div>

        {loading ? (
          <PropertyCardSkeleton count={8} />
        ) : message ? (
          <div className="empty-state">
            <h3>{message}</h3>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="empty-state">
            <h3>No properties found</h3>
            <p>Try changing filters</p>
            <button onClick={handleResetFilters}>Reset Filters</button>
          </div>
        ) : (
          <div className="listings-grid">
            {filteredProperties.map((p) => {
              const isOwn = p.owner?._id === currentUserId;

              return (
                <div className="listing-card" key={p._id}>
                  <div className="card-img">
                    {p.images?.length > 0 ? (
                      <>
                        <img
                          src={p.images[currentImageIndexes[p._id] || 0]}
                          alt={p.title}
                        />

                        {p.images.length > 1 && (
                          <>
                            <button
                              className="carousel-btn prev-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrevImage(p._id, p.images.length);
                              }}
                            >
                              ❮
                            </button>

                            <button
                              className="carousel-btn next-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNextImage(p._id, p.images.length);
                              }}
                            >
                              ❯
                            </button>

                            <div className="carousel-dots">
                              {p.images.map((_, index) => (
                                <span
                                  key={index}
                                  className={`dot ${
                                    index === (currentImageIndexes[p._id] || 0)
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
                      <div className="no-image-box">No Image</div>
                    )}

                    <button
                      className={`heart-btn ${wishlistIds.has(p._id) ? "active" : ""}`}
                      onClick={() => toggleWishlist(p._id)}
                    >
                      <FiHeart />
                    </button>
                    {isOwn && (
                      <span className="property-badge">Your Property</span>
                    )}
                  </div>

                  <div className="card-body">
                    <h3>{p.title}</h3>
                    <p>{p.city}</p>

                    <div className="listing-chips">
                      <span>{p.propertyType}</span>
                      <span>{p.listingFor}</span>
                      <span>{p.bhk}</span>
                    </div>

                    <h4>₹{p.price}</h4>

                    <button
                      className="view-btn"
                      onClick={() =>
                        navigate(`/property/view/${p._id}`, {
                          state: {
                            from: location.pathname + location.search,
                          },
                        })
                      }
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllListings;

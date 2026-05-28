import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import img1 from "../images/hero-image-1.jpg";
import img2 from "../images/hero-image-2.jpg";
import img3 from "../images/hero-image-3.jpg";
import img4 from "../images/hero-image-4.jpg";
import img5 from "../images/hero-image-5.jpg";

import {
  FiSearch,
  FiHome,
  FiShield,
  FiHeart,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";
import api from "../services/api";
import "../styles/Home.css";

const heroImages = [img1, img2, img3, img4, img5];

function Home() {
  const navigate = useNavigate();

  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [searchCity, setSearchCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const res = await api.get("/property/active-listings?page=1&limit=8");
      setFeaturedProperties(res.data.data || []);
    } catch (error) {
      console.log(
        "Featured properties error:",
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const handleSearch = () => {
    navigate("/listings", {
      state: {
        searchCity,
        propertyType,
      },
    });
  };

  const handleAddProperty = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to add new property");
      return navigate("/");
    }
    navigate("/add-property");
  };

  return (
    <>
      <main className="home-page">
        <section className="hero-section">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`hero-bg-slide ${index === currentImage ? "active" : ""}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="hero-overlay"></div>

          <div className="hero-content">
            <span className="hero-badge">Verified Property Listings</span>

            <h1>Your Next Home is at PGs Finder</h1>

            <p>
              Skip the middleman. Discover affordable, bachelor-friendly living
              spaces in your favorite neighborhoods.
            </p>

            <div className="hero-actions">
              <button
                onClick={() => navigate("/listings")}
                className="primary-hero-btn"
              >
                Find My Room
                <FiArrowRight />
              </button>

              <button
                onClick={handleAddProperty}
                className="secondary-hero-btn"
              >
                Add Property
              </button>
            </div>

            <div className="glass-search-card">
              <div className="search-field">
                <label>City</label>
                <input
                  type="text"
                  placeholder="Search city"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
              </div>

              <div className="search-field">
                <label>Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="FLAT">Flat</option>
                  <option value="PG">PG</option>
                  <option value="ROOM">Room</option>
                </select>
              </div>

              <button className="search-btn" onClick={handleSearch}>
                <FiSearch />
                Search
              </button>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="stat-card">
            <h3>500+</h3>
            <p>Listed Properties</p>
          </div>

          <div className="stat-card">
            <h3>100+</h3>
            <p>Verified Owners</p>
          </div>

          <div className="stat-card">
            <h3>20+</h3>
            <p>Popular Cities</p>
          </div>
        </section>

        <section className="featured-section">
          <div className="section-heading">
            <span>Featured Listings</span>
            <h2>Explore Latest Properties</h2>
            <p>Quickly browse recently added active properties.</p>
          </div>

          <div className="featured-grid">
            {featuredProperties.length === 0 ? (
              <div className="empty-featured">No properties available yet.</div>
            ) : (
              featuredProperties.map((property) => (
                <div className="featured-card" key={property._id}>
                  <div className="featured-image-wrap">
                    {property.images?.length > 0 ? (
                      <img src={property.images[0]} alt={property.title} />
                    ) : (
                      <div className="featured-no-image">No Image</div>
                    )}

                    <span className="featured-type">
                      {property.propertyType}
                    </span>
                  </div>

                  <div className="featured-body">
                    <h3>{property.title}</h3>

                    <p className="featured-location">
                      <FiMapPin />
                      {property.city || "N/A"}
                    </p>

                    <p className="featured-price">₹{property.price}</p>

                    <button
                      className="view-property-btn"
                      onClick={() => navigate(`/property/view/${property._id}`)}
                    >
                      View Property
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="view-all-wrap">
            <button
              onClick={() => navigate("/listings")}
              className="view-all-btn"
            >
              View All Listings
              <FiArrowRight />
            </button>
          </div>
        </section>

        <section className="why-section">
          <div className="section-heading">
            <span>Why Choose Us</span>
            <h2>Simple, Secure & User Friendly</h2>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <FiHome />
              <h3>Easy Property Management</h3>
              <p>Add, edit and manage your own properties from one place.</p>
            </div>

            <div className="why-card">
              <FiSearch />
              <h3>Smart Discovery</h3>
              <p>Search and filter properties by city, type, budget and BHK.</p>
            </div>

            <div className="why-card">
              <FiShield />
              <h3>Protected Actions</h3>
              <p>Only logged-in users can save, inquire or add properties.</p>
            </div>

            <div className="why-card">
              <FiHeart />
              <h3>Wishlist Support</h3>
              <p>Save properties and revisit your preferred options anytime.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div>
            <h2>Ready to list your property?</h2>
            <p>Create an account and start managing your properties today.</p>
          </div>

          <button onClick={() => navigate("/register")}>
            Get Started <FiArrowRight />
          </button>
        </section>
      </main>
    </>
  );
}

export default Home;

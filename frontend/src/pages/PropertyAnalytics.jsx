import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiEye,
  FiHeart,
  FiMessageSquare,
  FiCalendar,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import api from "../services/api";
import "../styles/PropertyAnalytics.css";

function PropertyAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`/property/view/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProperty(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load analytics");
      navigate("/my-properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  if (loading) {
    return <div className="analytics-page">Loading analytics...</div>;
  }

  if (!property) {
    return <div className="analytics-page">Property not found</div>;
  }

  const views = property.views || 0;
  const uniqueViews = property.uniqueViews?.length || 0;
  const inquiries = property.inquiryCount || 0;
  const saves = property.wishlistCount || 0;
  const visits = property.visitCount || 0;
  const chats = property.chatCount || 0;

  const conversionRate =
    views > 0 ? (((inquiries + visits + chats) / views) * 100).toFixed(1) : 0;

  const engagementScore =
    views +
    uniqueViews * 2 +
    inquiries * 5 +
    saves * 3 +
    visits * 4 +
    chats * 4;

  return (
    <div className="analytics-page">
      <button className="analytics-back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft />
        Back
      </button>

      <section className="analytics-hero">
        <div>
          <span>Property Analytics</span>
          <h1>{property.title}</h1>
          <p>{property.city}</p>
        </div>

        <div className="analytics-score-box">
          <h3>{engagementScore}</h3>
          <p>Engagement Score</p>
        </div>
      </section>

      <section className="analytics-grid">
        <div className="analytics-card">
          <FiEye />
          <h3>{views}</h3>
          <p>Total Views</p>
        </div>

        <div className="analytics-card">
          <FiUsers />
          <h3>{uniqueViews}</h3>
          <p>Unique Visitors</p>
        </div>

        <div className="analytics-card">
          <FiMessageSquare />
          <h3>{inquiries}</h3>
          <p>Inquiries</p>
        </div>

        <div className="analytics-card">
          <FiHeart />
          <h3>{saves}</h3>
          <p>Wishlist Saves</p>
        </div>

        <div className="analytics-card">
          <FiCalendar />
          <h3>{visits}</h3>
          <p>Visit Requests</p>
        </div>

        <div className="analytics-card">
          <FiMessageSquare />
          <h3>{chats}</h3>
          <p>Chat Starts</p>
        </div>
      </section>

      <section className="analytics-insights">
        <div className="insight-card">
          <FiTrendingUp />
          <div>
            <h3>{conversionRate}%</h3>
            <p>Conversion Rate</p>
          </div>
        </div>

        <div className="insight-note">
          <h3>Performance Insight</h3>
          <p>
            Higher views with low inquiries means your property image, price, or
            description may need improvement. More saves and visits indicate
            strong buyer/renter interest.
          </p>
        </div>
      </section>
    </div>
  );
}

export default PropertyAnalytics;

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import "../styles/AdminReviewApproval.css";
import { FiCheckCircle, FiXCircle, FiStar } from "react-icons/fi";

import { useNavigate } from "react-router-dom";

function AdminReviewApproval() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);

      const res = await api.get("/reviews/admin/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const handleApprove = async (reviewId) => {
    try {
      await api.patch(
        `/reviews/admin/approve/${reviewId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Review approved successfully");
      fetchPendingReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve review");
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await api.patch(
        `/reviews/admin/reject/${reviewId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Review rejected successfully");
      fetchPendingReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject review");
    }
  };

  if (loading) {
    return (
      <div className="admin-review-loading">Loading pending reviews...</div>
    );
  }

  return (
    <div className="admin-review-page">
      <button className="admin-review-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="admin-review-header">
        <div>
          <p className="admin-review-subtitle">Admin Panel</p>
          <h2>Review Approvals</h2>
          <p>Approve or reject user reviews before they become public.</p>
        </div>

        <div className="pending-review-count">
          <span>{reviews.length}</span>
          <p>Pending</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-review-box">
          <FiCheckCircle />
          <h3>No pending reviews</h3>
          <p>All reviews are already checked.</p>
        </div>
      ) : (
        <div className="admin-review-grid">
          {reviews.map((review) => (
            <div className="admin-review-card" key={review._id}>
              <div className="review-card-top">
                <div>
                  <h3>{review.property?.title || "Property unavailable"}</h3>
                  <p>
                    {review.property?.city || "N/A"} • ₹
                    {review.property?.price || "N/A"}
                  </p>
                </div>

                <span className="review-status-badge">Pending</span>
              </div>

              <div className="review-user-box">
                <div className="review-user-avatar">
                  {review.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div>
                  <h4>{review.user?.name || "Unknown User"}</h4>
                  <p>{review.user?.email || "No email"}</p>
                </div>
              </div>

              <div className="review-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={star <= review.rating ? "star-filled" : ""}
                  />
                ))}
                <span>{review.rating}/5</span>
              </div>

              <p className="review-comment">“{review.comment}”</p>

              <div className="review-action-buttons">
                <button
                  className="approve-review-btn"
                  onClick={() => handleApprove(review._id)}
                >
                  <FiCheckCircle />
                  Approve
                </button>

                <button
                  className="reject-review-btn"
                  onClick={() => handleReject(review._id)}
                >
                  <FiXCircle />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminReviewApproval;

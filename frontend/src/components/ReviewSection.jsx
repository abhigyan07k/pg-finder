import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import "../styles/ReviewSection.css";

function ReviewSection({ propertyId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [hover, setHover] = useState(0);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editHover, setEditHover] = useState(0);

  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = userData?._id || userData?.id;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const roundedRating = Math.round(Number(averageRating));

  const fetchReviews = async () => {
    try {
      setReviewLoading(true);

      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};

      const res = await api.get(`/reviews/property/${propertyId}`, config);
      setReviews(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) fetchReviews();
  }, [propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login to submit a review");
      return;
    }

    if (!rating || !comment.trim()) {
      toast.error("Rating and comment are required");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        `/reviews/property/${propertyId}`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message || "Review added successfully");
      setComment("");
      setRating(5);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add review");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm("Delete this review?");
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message || "Review deleted");
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditComment("");
    setEditRating(5);
    setEditHover(0);
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editRating || !editComment.trim()) {
      toast.error("Rating and comment are required");
      return;
    }

    try {
      const res = await api.put(
        `/reviews/${reviewId}`,
        {
          rating: editRating,
          comment: editComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message || "Review updated");
      handleCancelEdit();
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update review");
    }
  };

  return (
    <section className="review-section">
      <div className="review-heading">
        <div>
          <span className="review-badge">User Feedback</span>
          <h3>Reviews & Ratings</h3>
          <p>
            {reviews.length > 0
              ? `${reviews.length} review${reviews.length > 1 ? "s" : ""} from users`
              : "No reviews yet. Be the first to share your experience."}
          </p>
        </div>

        <div className="average-rating-box">
          <strong>{averageRating}</strong>
          <span>
            {"★".repeat(roundedRating)}
            {"☆".repeat(5 - roundedRating)}
          </span>
        </div>
      </div>

      <form className="review-form" onSubmit={handleSubmit}>
        <div className="review-form-top">
          <div>
            <label>Your Rating</label>
            <div className="star-rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-btn ${star <= (hover || rating) ? "active" : ""}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <button
            className="review-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        <textarea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </form>

      <div className="review-list">
        {reviewLoading ? (
          <div className="review-empty">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="review-empty">
            No reviews available for this property.
          </div>
        ) : (
          reviews.map((review) => {
            const isMyReview =
              review.user?._id === currentUserId ||
              review.user?.id === currentUserId;

            return (
              <article className="review-card" key={review._id}>
                <div className="review-top">
                  <div className="review-user-box">
                    <div className="review-avatar">
                      {(review.user?.name || "U").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>{review.user?.name || "User"}</strong>
                      <small>
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString()
                          : ""}
                      </small>
                    </div>
                  </div>

                  <span className="review-stars">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>

                {editingReviewId === review._id ? (
                  <div className="edit-review-box">
                    <label>Edit Rating</label>

                    <div className="star-rating-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className={`star-btn ${
                            star <= (editHover || editRating) ? "active" : ""
                          }`}
                          onClick={() => setEditRating(star)}
                          onMouseEnter={() => setEditHover(star)}
                          onMouseLeave={() => setEditHover(0)}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                    />

                    <div className="edit-review-buttons">
                      <button
                        type="button"
                        onClick={() => handleUpdateReview(review._id)}
                      >
                        Update
                      </button>

                      <button type="button" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="review-comment">{review.comment}</p>
                )}

                {isMyReview && editingReviewId !== review._id && (
                  <div className="review-actions">
                    <button
                      type="button"
                      className="edit"
                      onClick={() => handleEditClick(review)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete"
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default ReviewSection;

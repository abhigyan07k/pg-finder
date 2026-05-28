import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/ScheduleVisit.css";

function ScheduleVisit() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    visitDate: "",
    visitTime: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      setLoading(true);

      await api.post(
        "/visits/create",
        {
          propertyId,
          visitDate: formData.visitDate,
          visitTime: formData.visitTime,
          message: formData.message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Visit request sent successfully!");
      navigate(`/property/view/${propertyId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send visit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-page">
      <div className="schedule-card">
        <button className="schedule-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h2>Schedule Visit</h2>
        <p>Choose your preferred date and time for property visit.</p>

        <form onSubmit={handleSubmit}>
          <label>Visit Date</label>
          <input
            type="date"
            name="visitDate"
            value={formData.visitDate}
            onChange={handleChange}
            required
          />

          <label>Visit Time</label>
          <input
            type="time"
            name="visitTime"
            value={formData.visitTime}
            onChange={handleChange}
            required
          />

          <label>Message</label>
          <textarea
            name="message"
            placeholder="Write a short message..."
            value={formData.message}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Visit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ScheduleVisit;

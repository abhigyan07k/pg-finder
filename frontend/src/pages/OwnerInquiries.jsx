import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "../styles/OwnerInquiries.css";

function OwnerInquiries() {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    closed: 0,
  });

  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchStats = async () => {
    const token = localStorage.getItem("token");

    const res = await api.get("/inquiry/owner/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setStats(res.data.data);
  };

  const fetchInquiries = async () => {
    const token = localStorage.getItem("token");

    const res = await api.get("/inquiry/owner-recent", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data.data || [];
    setInquiries(data);
    setSelectedInquiry(data[0] || null);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchStats(), fetchInquiries()]);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInquiries = useMemo(() => {
    if (activeStatus === "ALL") return inquiries;
    return inquiries.filter((item) => item.status === activeStatus);
  }, [inquiries, activeStatus]);

  return (
    <div className="inquiries-page">
      <section className="inquiries-hero">
        <span className="inquiries-badge">Inquiry Inbox</span>
        <h1>Manage Property Inquiries</h1>
        <p>
          View all user messages in one clean inbox and follow up with leads
          faster.
        </p>
      </section>

      <section className="inquiry-stats-grid">
        <div className="inquiry-stat-card">
          <h3>{stats.total}</h3>
          <p>Total</p>
        </div>

        <div className="inquiry-stat-card">
          <h3>{stats.new}</h3>
          <p>New</p>
        </div>

        <div className="inquiry-stat-card">
          <h3>{stats.contacted}</h3>
          <p>Contacted</p>
        </div>

        <div className="inquiry-stat-card">
          <h3>{stats.closed}</h3>
          <p>Closed</p>
        </div>
      </section>

      <section className="inquiries-container">
        <div className="inquiry-filter-row">
          {["ALL", "NEW", "CONTACTED", "CLOSED"].map((status) => (
            <button
              key={status}
              className={activeStatus === status ? "active" : ""}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="inquiry-state-card">Loading inquiries...</div>
        ) : message ? (
          <div className="inquiry-error">{message}</div>
        ) : inquiries.length === 0 ? (
          <div className="inquiry-state-card">
            <h3>No inquiries found</h3>
            <p>Once users send inquiries, they will appear here.</p>
          </div>
        ) : (
          <div className="inquiry-inbox-layout">
            <div className="inquiry-chat-list">
              <div className="chat-list-header">
                <h2>Chats</h2>
                <span>{filteredInquiries.length}</span>
              </div>

              {filteredInquiries.length === 0 ? (
                <div className="no-chat-found">No chats in this status.</div>
              ) : (
                filteredInquiries.map((item) => (
                  <button
                    key={item._id}
                    className={`chat-item ${
                      selectedInquiry?._id === item._id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedInquiry(item)}
                  >
                    <div className="chat-avatar">
                      {(item.name || "U").charAt(0).toUpperCase()}
                    </div>

                    <div className="chat-content">
                      <div className="chat-top">
                        <strong>{item.name}</strong>
                        <span
                          className={`status-pill ${item.status?.toLowerCase()}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p>{item.message}</p>
                      <small>
                        {item.property?.title || "Property not available"}
                      </small>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="inquiry-detail-panel">
              {!selectedInquiry ? (
                <div className="empty-detail">
                  <h3>Select a chat</h3>
                  <p>Choose any inquiry from the left side to view details.</p>
                </div>
              ) : (
                <>
                  <div className="detail-header">
                    <div className="detail-user">
                      <div className="detail-avatar">
                        {(selectedInquiry.name || "U").charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h2>{selectedInquiry.name}</h2>
                        <p>
                          {selectedInquiry.property?.title ||
                            "Property not available"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`status-pill ${selectedInquiry.status?.toLowerCase()}`}
                    >
                      {selectedInquiry.status}
                    </span>
                  </div>

                  <div className="message-bubble">
                    <p>{selectedInquiry.message}</p>
                  </div>

                  <div className="lead-info-grid">
                    <div>
                      <span>Phone</span>
                      <strong>{selectedInquiry.phone || "N/A"}</strong>
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>{selectedInquiry.email || "N/A"}</strong>
                    </div>

                    <div>
                      <span>Property</span>
                      <strong>
                        {selectedInquiry.property?.title || "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span>Status</span>
                      <strong>{selectedInquiry.status || "N/A"}</strong>
                    </div>
                  </div>

                  <div className="inquiry-actions">
                    {selectedInquiry.phone && (
                      <a href={`tel:${selectedInquiry.phone}`}>Call</a>
                    )}

                    {selectedInquiry.phone && (
                      <a
                        href={`https://wa.me/91${selectedInquiry.phone}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default OwnerInquiries;

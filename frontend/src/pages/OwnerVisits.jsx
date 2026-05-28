import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiClock, FiMail, FiUser } from "react-icons/fi";
import api from "../services/api";
import "../styles/OwnerVisits.css";

function OwnerVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState("");
  const [message, setMessage] = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");

  const fetchOwnerVisits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await api.get("/visits/owner-visits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVisits(res.data.data || []);
      setMessage("");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to load visit requests",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (visitId, status, reason = "") => {
    try {
      setStatusLoading(visitId);
      setMessage("");

      const token = localStorage.getItem("token");

      await api.patch(
        `/visits/status/${visitId}`,
        {
          status,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchOwnerVisits();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusLoading("");
    }
  };

  const handleApprove = (visitId) => {
    updateStatus(visitId, "APPROVED");
  };

  const handleReject = (visitId) => {
    const reason = window.prompt(
      "Enter rejection reason for renter (optional):",
    );

    if (reason === null) return;

    updateStatus(visitId, "REJECTED", reason.trim());
  };

  useEffect(() => {
    fetchOwnerVisits();
  }, []);

  const stats = useMemo(() => {
    return {
      total: visits.length,
      pending: visits.filter((v) => v.status === "PENDING").length,
      approved: visits.filter((v) => v.status === "APPROVED").length,
      rejected: visits.filter((v) => v.status === "REJECTED").length,
    };
  }, [visits]);

  const filteredVisits = useMemo(() => {
    if (activeStatus === "ALL") return visits;
    return visits.filter((visit) => visit.status === activeStatus);
  }, [visits, activeStatus]);

  return (
    <div className="visits-page">
      <section className="visits-hero">
        <span className="visits-badge">Visit Requests</span>
        <h1>Manage Property Visits</h1>
        <p>
          Review visit requests from interested users and approve or reject them
          based on your availability.
        </p>
      </section>

      <section className="visits-stats-grid">
        <div className="visit-stat-card">
          <h3>{stats.total}</h3>
          <p>Total Requests</p>
        </div>

        <div className="visit-stat-card">
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>

        <div className="visit-stat-card">
          <h3>{stats.approved}</h3>
          <p>Approved</p>
        </div>

        <div className="visit-stat-card">
          <h3>{stats.rejected}</h3>
          <p>Rejected</p>
        </div>
      </section>

      <section className="visits-container">
        <div className="visits-top-row">
          <div>
            <h2>Visit Schedule</h2>
            <p>{filteredVisits.length} requests found</p>
          </div>

          <div className="visit-filter-row">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                className={activeStatus === status ? "active" : ""}
                onClick={() => setActiveStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {message && <div className="visit-error">{message}</div>}

        {loading ? (
          <div className="visit-state-card">Loading visit requests...</div>
        ) : visits.length === 0 ? (
          <div className="visit-state-card">
            <h3>No visit requests found</h3>
            <p>When users schedule visits, requests will appear here.</p>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="visit-state-card">
            <h3>No requests in this status</h3>
            <p>Try selecting another filter.</p>
          </div>
        ) : (
          <div className="visits-grid">
            {filteredVisits.map((visit) => (
              <article key={visit._id} className="visit-card">
                <div className="visit-card-header">
                  <div>
                    <h3>{visit.property?.title || "Property"}</h3>
                    <p>{visit.property?.city || "Location not available"}</p>
                  </div>

                  <span
                    className={`visit-status ${visit.status?.toLowerCase()}`}
                  >
                    {visit.status}
                  </span>
                </div>

                <div className="visit-info-grid">
                  <div>
                    <FiUser />
                    <span>Renter</span>
                    <strong>{visit.renter?.name || "N/A"}</strong>
                  </div>

                  <div>
                    <FiMail />
                    <span>Email</span>
                    <strong>{visit.renter?.email || "N/A"}</strong>
                  </div>

                  <div>
                    <FiCalendar />
                    <span>Date</span>
                    <strong>{visit.visitDate || "N/A"}</strong>
                  </div>

                  <div>
                    <FiClock />
                    <span>Time</span>
                    <strong>{visit.visitTime || "N/A"}</strong>
                  </div>
                </div>

                {visit.message && (
                  <div className="visit-message">
                    <span>Message</span>
                    <p>{visit.message}</p>
                  </div>
                )}

                {visit.rejectReason && (
                  <div className="visit-message rejected-reason">
                    <span>Rejection Reason</span>
                    <p>{visit.rejectReason}</p>
                  </div>
                )}

                {visit.status === "PENDING" && (
                  <div className="visit-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(visit._id)}
                      disabled={statusLoading === visit._id}
                    >
                      {statusLoading === visit._id ? "Updating..." : "Approve"}
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => handleReject(visit._id)}
                      disabled={statusLoading === visit._id}
                    >
                      {statusLoading === visit._id ? "Updating..." : "Reject"}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default OwnerVisits;

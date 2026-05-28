import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../services/api";

function AdminPropertyManagement() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  const fetchAllProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await api.get("/property/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProperties(res.data.data || []);
      setMessage("");
    } catch (error) {
      console.log(
        "Admin Property Fetch Error:",
        error.response?.data || error.message,
      );
      setMessage(error.response?.data?.message || "Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProperties();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.patch(
        `/property/admin/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProperties((prev) =>
        prev.map((item) => (item._id === id ? res.data.data : item)),
      );
    } catch (error) {
      console.log("Approve Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to approve property");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter rejection reason (optional):", "");

    try {
      const token = localStorage.getItem("token");

      const res = await api.patch(
        `/property/admin/reject/${id}`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProperties((prev) =>
        prev.map((item) => (item._id === id ? res.data.data : item)),
      );
    } catch (error) {
      console.log("Reject Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to reject property");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this property?",
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/property/admin/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProperties((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.log("Delete Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to delete property");
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        property.title?.toLowerCase().includes(search) ||
        property.city?.toLowerCase().includes(search) ||
        property.owner?.name?.toLowerCase().includes(search);

      const matchesStatus = statusFilter
        ? property.approvalStatus === statusFilter
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [properties, searchTerm, statusFilter]);

  return (
    <AppLayout title="Admin Property Management">
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2 style={styles.pageTitle}>Admin Property Management</h2>
          <p style={styles.countText}>
            {filteredProperties.length} of {properties.length} properties
          </p>
        </div>

        <div style={styles.filterBox}>
          <input
            type="text"
            placeholder="Search by title, city or owner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p style={styles.infoText}>Loading properties...</p>
        ) : message ? (
          <p style={styles.errorText}>{message}</p>
        ) : filteredProperties.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyTitle}>No properties found</p>
            <p style={styles.emptySub}>Try changing search or filter.</p>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Owner</th>
                  <th style={styles.th}>City</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Approval</th>
                  <th style={styles.th}>Active</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProperties.map((property) => (
                  <tr key={property._id}>
                    <td style={styles.td}>{property.title}</td>
                    <td style={styles.td}>{property.owner?.name || "N/A"}</td>
                    <td style={styles.td}>{property.city}</td>
                    <td style={styles.td}>{property.propertyType}</td>
                    <td style={styles.td}>₹{property.price}</td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor:
                            property.approvalStatus === "APPROVED"
                              ? "#dcfce7"
                              : property.approvalStatus === "REJECTED"
                                ? "#fee2e2"
                                : "#fef3c7",
                          color:
                            property.approvalStatus === "APPROVED"
                              ? "#166534"
                              : property.approvalStatus === "REJECTED"
                                ? "#991b1b"
                                : "#92400e",
                        }}
                      >
                        {property.approvalStatus || "PENDING"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: property.isActive
                            ? "#dcfce7"
                            : "#fee2e2",
                          color: property.isActive ? "#166534" : "#991b1b",
                        }}
                      >
                        {property.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        <button
                          style={styles.viewBtn}
                          onClick={() =>
                            navigate(`/property/view/${property._id}`, {
                              state: {
                                from: "/admin/property-management",
                                adminMode: true,
                              },
                            })
                          }
                        >
                          View
                        </button>

                        <button
                          style={styles.approveBtn}
                          onClick={() => handleApprove(property._id)}
                          disabled={property.approvalStatus === "APPROVED"}
                        >
                          Approve
                        </button>

                        <button
                          style={styles.rejectBtn}
                          onClick={() => handleReject(property._id)}
                          disabled={property.approvalStatus === "REJECTED"}
                        >
                          Reject
                        </button>

                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(property._id)}
                        >
                          Delete
                        </button>
                      </div>

                      {property.rejectionReason && (
                        <p style={styles.reasonText}>
                          Reason: {property.rejectionReason}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const styles = {
  container: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "10px",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  pageTitle: {
    margin: 0,
    color: "#0f172a",
  },

  countText: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
  },

  filterBox: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "12px",
    backgroundColor: "#fff",
    padding: "14px",
    borderRadius: "14px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },

  input: {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },

  select: {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#fff",
  },

  tableWrap: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },

  th: {
    textAlign: "left",
    padding: "14px",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "14px",
    backgroundColor: "#f8fafc",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #e2e8f0",
    verticalAlign: "top",
    fontSize: "14px",
    color: "#475569",
  },

  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
  },

  actionRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  viewBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  approveBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#16a34a",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  rejectBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#f59e0b",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  deleteBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#dc2626",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  reasonText: {
    margin: "8px 0 0 0",
    color: "#991b1b",
    fontSize: "12px",
    fontWeight: "600",
  },

  infoText: {
    color: "#475569",
  },

  errorText: {
    color: "#dc2626",
    fontWeight: "600",
  },

  emptyBox: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
    textAlign: "center",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
  },

  emptySub: {
    margin: "8px 0 0 0",
    fontSize: "14px",
    color: "#64748b",
  },
};

export default AdminPropertyManagement;

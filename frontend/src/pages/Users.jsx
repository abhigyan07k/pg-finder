import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AppLayout from "../components/AppLayout";

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    let filtered = users;
    const searchValue = search.toLowerCase();

    if (searchValue) {
      filtered = filtered.filter((user) => {
        return (
          user.name?.toLowerCase().includes(searchValue) ||
          user.email?.toLowerCase().includes(searchValue) ||
          user.role?.toLowerCase().includes(searchValue) ||
          user.userType?.toLowerCase().includes(searchValue)
        );
      });
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((user) =>
        statusFilter === "ACTIVE" ? user.isActive : !user.isActive,
      );
    }

    setFilteredUsers(filtered);
  }, [search, users, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await api.get(
        `/user/all-users?page=${page}&limit=${limit}&search=${debouncedSearch}&role=${roleFilter}&status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const usersWithSelectedRole = (res.data.data || []).map((user) => ({
        ...user,
        selectedRole: user.role,
      }));

      setUsers(usersWithSelectedRole);
      setFilteredUsers(usersWithSelectedRole);
      setTotalUsers(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/user/delete-user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleRoleSelectChange = (id, value) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === id ? { ...user, selectedRole: value } : user,
      ),
    );
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      await api.put(
        "/user/change-role",
        { userId, role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change role");
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedUser(null);
  };

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <AppLayout title="Users">
      <div style={styles.pageHeader}>
        <h2 style={styles.heading}>All Users ({totalUsers})</h2>

        {(role === "ADMIN" || role === "SUB_ADMIN") && (
          <button
            style={styles.createButton}
            onClick={() => navigate("/create-user")}
          >
            + Create User
          </button>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by name, email, role, user type"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="ALL">All Roles</option>
          <option value="USER">USER</option>
          <option value="SUB_ADMIN">SUB_ADMIN</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>User Type</th>
              <th style={styles.th}>Status</th>
              {role === "ADMIN" && <th style={styles.th}>Change Role</th>}
              {(role === "ADMIN" || role === "SUB_ADMIN") && (
                <th style={styles.th}>Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={styles.noData}>
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={role === "ADMIN" ? 7 : role === "SUB_ADMIN" ? 6 : 5}
                  style={styles.noData}
                >
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td style={styles.td}>{user.name}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.role}</td>
                  <td style={styles.td}>{user.userType}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: user.isActive ? "#dcfce7" : "#fee2e2",
                        color: user.isActive ? "#166534" : "#991b1b",
                      }}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {role === "ADMIN" && (
                    <td style={styles.td}>
                      <div style={styles.roleBox}>
                        <select
                          style={styles.select}
                          value={user.selectedRole}
                          onChange={(e) =>
                            handleRoleSelectChange(user._id, e.target.value)
                          }
                        >
                          <option value="USER">USER</option>
                          <option value="SUB_ADMIN">SUB_ADMIN</option>
                          {/* <option value="ADMIN">ADMIN</option> */}
                        </select>

                        <button
                          style={styles.roleButton}
                          onClick={() =>
                            handleRoleChange(user._id, user.selectedRole)
                          }
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  )}

                  {(role === "ADMIN" || role === "SUB_ADMIN") && (
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          style={styles.viewButton}
                          onClick={() => handleViewUser(user)}
                        >
                          View
                        </button>

                        <button
                          style={styles.editButton}
                          onClick={() => navigate(`/edit-user/${user._id}`)}
                        >
                          Edit
                        </button>

                        {role === "ADMIN" && (
                          <button
                            style={styles.deleteButton}
                            onClick={() => handleDelete(user._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.pagination}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          style={{
            ...styles.pageButton,
            opacity: page === 1 ? 0.5 : 1,
            cursor: page === 1 ? "not-allowed" : "pointer",
          }}
        >
          Prev
        </button>

        <span style={styles.pageInfo}>
          Page {page} of {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
          style={{
            ...styles.pageButton,
            opacity: page === totalPages || totalPages === 0 ? 0.5 : 1,
            cursor:
              page === totalPages || totalPages === 0
                ? "not-allowed"
                : "pointer",
          }}
        >
          Next
        </button>
      </div>

      {viewModalOpen && (
        <div style={styles.modalOverlay} onClick={closeViewModal}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>User Details</h3>
              <button style={styles.closeButton} onClick={closeViewModal}>
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Name:</span>
                <span style={styles.detailValue}>{selectedUser?.name}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Email:</span>
                <span style={styles.detailValue}>{selectedUser?.email}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Role:</span>
                <span style={styles.detailValue}>{selectedUser?.role}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>User Type:</span>
                <span style={styles.detailValue}>{selectedUser?.userType}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status:</span>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: selectedUser?.isActive
                      ? "#dcfce7"
                      : "#fee2e2",
                    color: selectedUser?.isActive ? "#166534" : "#991b1b",
                  }}
                >
                  {selectedUser?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.modalCloseBtn} onClick={closeViewModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

const styles = {
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "12px",
    flexWrap: "wrap",
  },
  heading: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#334155",
  },
  createButton: {
    padding: "10px 18px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  error: {
    color: "red",
    marginBottom: "16px",
  },
  filterBar: {
    marginBottom: "20px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: "220px",
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
  },
  filterSelect: {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    minWidth: "150px",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "#fff",
  },
  tableWrapper: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    overflowX: "auto",
    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "16px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f8fafc",
    color: "#475569",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "16px",
    borderBottom: "1px solid #e5e7eb",
    color: "#334155",
    verticalAlign: "middle",
  },
  noData: {
    textAlign: "center",
    padding: "24px",
    color: "#64748b",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-block",
  },
  roleBox: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  select: {
    padding: "8px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
  },
  roleButton: {
    padding: "8px 12px",
    backgroundColor: "#7c3aed",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  viewButton: {
    padding: "8px 14px",
    backgroundColor: "#0ea5e9",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  editButton: {
    padding: "8px 14px",
    backgroundColor: "#f59e0b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  deleteButton: {
    padding: "8px 14px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    marginTop: "20px",
  },
  pageButton: {
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#2563eb",
    color: "#fff",
  },
  pageInfo: {
    fontWeight: "600",
    color: "#334155",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "520px",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    borderBottom: "1px solid #e5e7eb",
  },
  modalTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#1e293b",
  },
  closeButton: {
    background: "transparent",
    border: "none",
    fontSize: "28px",
    cursor: "pointer",
    color: "#64748b",
    lineHeight: 1,
  },
  modalBody: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  detailLabel: {
    fontWeight: "700",
    color: "#475569",
    minWidth: "120px",
  },
  detailValue: {
    color: "#0f172a",
    textAlign: "right",
    wordBreak: "break-word",
  },
  modalFooter: {
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
  },
  modalCloseBtn: {
    padding: "10px 18px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default Users;

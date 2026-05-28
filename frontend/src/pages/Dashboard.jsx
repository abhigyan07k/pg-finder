import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalSubAdmins: 0,
    activeUsers: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        totalUsersRes,
        totalAdminsRes,
        totalSubAdminsRes,
        activeUsersRes,
        recentUsersRes,
      ] = await Promise.all([
        api.get("/user/all-users?page=1&limit=1", { headers }),
        api.get("/user/all-users?page=1&limit=1&role=ADMIN", { headers }),
        api.get("/user/all-users?page=1&limit=1&role=SUB_ADMIN", { headers }),
        api.get("/user/all-users?page=1&limit=1&status=ACTIVE", { headers }),
        api.get("/user/all-users?page=1&limit=5", { headers }),
      ]);

      setStats({
        totalUsers: totalUsersRes.data.total || 0,
        totalAdmins: totalAdminsRes.data.total || 0,
        totalSubAdmins: totalSubAdminsRes.data.total || 0,
        activeUsers: activeUsersRes.data.total || 0,
      });

      setRecentUsers(recentUsersRes.data.data || []);
    } catch (error) {
      console.log("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Dashboard">
      <div style={styles.wrapper}>
        <h2 style={styles.pageHeading}>Dashboard Overview</h2>

        <div style={styles.cardGrid}>
          <div style={{ ...styles.card, borderLeft: "5px solid #4e73df" }}>
            <p style={styles.cardTitle}>Total Users</p>
            <h3 style={styles.cardValue}>{stats.totalUsers}</h3>
          </div>

          <div style={{ ...styles.card, borderLeft: "5px solid #1cc88a" }}>
            <p style={styles.cardTitle}>Admins</p>
            <h3 style={styles.cardValue}>{stats.totalAdmins}</h3>
          </div>

          <div style={{ ...styles.card, borderLeft: "5px solid #36b9cc" }}>
            <p style={styles.cardTitle}>Sub Admins</p>
            <h3 style={styles.cardValue}>{stats.totalSubAdmins}</h3>
          </div>

          <div style={{ ...styles.card, borderLeft: "5px solid #f6c23e" }}>
            <p style={styles.cardTitle}>Active Users</p>
            <h3 style={styles.cardValue}>{stats.activeUsers}</h3>
          </div>
        </div>

        <div style={styles.tableSection}>
          <div style={styles.tableCard}>
            <h3 style={styles.tableHeading}>Recent Users</h3>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>

                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={styles.emptyText}>
                        Loading dashboard data...
                      </td>
                    </tr>
                  ) : recentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={styles.emptyText}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    recentUsers.map((user) => (
                      <tr key={user._id}>
                        <td style={styles.td}>{user.name}</td>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}>{user.role}</td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: user.isActive
                                ? "#dcfce7"
                                : "#fee2e2",
                              color: user.isActive ? "#166534" : "#991b1b",
                            }}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  wrapper: {
    width: "100%",
  },
  pageHeading: {
    color: "#5a5c69",
    marginBottom: "20px",
    fontSize: "28px",
    fontWeight: "600",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)",
  },
  cardTitle: {
    margin: 0,
    fontSize: "13px",
    color: "#858796",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  cardValue: {
    margin: 0,
    fontSize: "24px",
    color: "#5a5c69",
    fontWeight: "700",
  },
  tableSection: {
    marginTop: "30px",
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)",
    overflow: "hidden",
  },
  tableHeading: {
    margin: 0,
    padding: "18px 20px",
    borderBottom: "1px solid #e3e6f0",
    color: "#4e73df",
    fontSize: "18px",
    fontWeight: "700",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    backgroundColor: "#f8f9fc",
    color: "#6e707e",
    fontSize: "13px",
    borderBottom: "1px solid #e3e6f0",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #e3e6f0",
    color: "#5a5c69",
    fontSize: "14px",
  },
  emptyText: {
    padding: "20px",
    color: "#858796",
    textAlign: "center",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-block",
  },
};

export default Dashboard;

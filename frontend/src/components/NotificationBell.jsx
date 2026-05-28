import { useEffect, useState } from "react";
import api from "../services/api";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.log("Notification fetch error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.patch(
        `/notifications/read/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchNotifications();
    } catch (err) {
      console.log("Mark read error:", err.response?.data || err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.patch(
        "/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchNotifications();
    } catch (err) {
      console.log("Mark all read error:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div style={styles.wrapper}>
      <button style={styles.bellBtn} onClick={() => setOpen((prev) => !prev)}>
        🔔
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
      </button>

      {open && (
        <div style={styles.dropdown}>
          <div style={styles.header}>
            <h4 style={styles.title}>Notifications</h4>

            {unreadCount > 0 && (
              <button style={styles.readAllBtn} onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <p style={styles.emptyText}>Loading...</p>
          ) : notifications.length === 0 ? (
            <p style={styles.emptyText}>No notifications yet.</p>
          ) : (
            <div style={styles.list}>
              {notifications.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  style={{
                    ...styles.item,
                    backgroundColor: item.isRead ? "#fff" : "#eff6ff",
                  }}
                  onClick={() => !item.isRead && markAsRead(item._id)}
                >
                  <p style={styles.itemTitle}>{item.title}</p>
                  <p style={styles.itemMessage}>{item.message}</p>

                  {item.property?.title && (
                    <p style={styles.propertyText}>
                      Property: {item.property.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <button style={styles.viewAllBtn}>View All</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
  },

  bellBtn: {
    position: "relative",
    border: "none",
    background: "#fff",
    borderRadius: "50%",
    width: "42px",
    height: "42px",
    cursor: "pointer",
    fontSize: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  badge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    minWidth: "18px",
    height: "18px",
    padding: "0 5px",
    borderRadius: "999px",
    backgroundColor: "#dc2626",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  dropdown: {
    position: "absolute",
    top: "50px",
    right: 0,
    width: "320px",
    maxHeight: "430px",
    backgroundColor: "#fff",
    borderRadius: "14px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
    zIndex: 3000,
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },

  header: {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "16px",
  },

  readAllBtn: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "12px",
  },

  list: {
    maxHeight: "310px",
    overflowY: "auto",
  },

  item: {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    cursor: "pointer",
  },

  itemTitle: {
    margin: "0 0 4px",
    color: "#0f172a",
    fontWeight: "700",
    fontSize: "14px",
  },

  itemMessage: {
    margin: 0,
    color: "#475569",
    fontSize: "13px",
    lineHeight: "1.4",
  },

  propertyText: {
    margin: "6px 0 0",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "600",
  },

  emptyText: {
    margin: 0,
    padding: "18px",
    color: "#64748b",
    fontSize: "14px",
  },

  viewAllBtn: {
    width: "100%",
    padding: "12px",
    border: "none",
    backgroundColor: "#f8fafc",
    color: "#2563eb",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default NotificationBell;

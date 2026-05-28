import { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../styles/AppLayout.css";
import {
  FiHome,
  FiUsers,
  FiGrid,
  FiList,
  FiHeart,
  FiMessageCircle,
  FiStar,
} from "react-icons/fi";
import api from "../services/api";

function AppLayout({ title, children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userType = localStorage.getItem("userType");

  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [inquiryStats, setInquiryStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    closed: 0,
  });

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userName = userData?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userType");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handlePasswordInputChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      alert("All fields are required");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("token");

      const res = await api.put(
        "/auth/change-password",
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert(res.data.message || "Password changed successfully");

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowChangePassword(false);
      handleLogout();
    } catch (error) {
      alert(error.response?.data?.message || "Password change failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log("NOTIFICATION RESPONSE:", res.data);

      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.log(
        "Notification Fetch Error:",
        error.response?.data || error.message,
      );
    }
  };

  const handleMarkAllAsRead = async () => {
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

      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true })),
      );
    } catch (error) {
      console.log("Mark Read Error:", error.response?.data || error.message);
    }
  };

  const handleNotificationClick = async (item) => {
    try {
      const token = localStorage.getItem("token");

      if (!item.isRead) {
        await api.patch(
          `/notifications/read/${item._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)),
      );

      if (!item.isRead) {
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      }

      setNotificationOpen(false);

      if (item.type === "VISIT_REQUEST") {
        navigate("/owner/visits");
        return;
      }

      if (item.type === "VISIT_APPROVED" || item.type === "VISIT_REJECTED") {
        navigate("/listings");
        return;
      }

      if (item.property?._id) {
        navigate(`/property/view/${item.property._id}`);
      }
    } catch (error) {
      console.log(
        "Notification click error:",
        error.response?.data || error.message,
      );
    }
  };

  const fetchInquiryStats = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token || userType !== "OWNER") return;

      const res = await api.get("/inquiry/owner/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setInquiryStats(res.data.data);
      }
    } catch (error) {
      console.log(
        "Inquiry Stats Error:",
        error.response?.data || error.message,
      );
    }
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchInquiryStats();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const panelTitle =
    role === "ADMIN" || role === "SUB_ADMIN"
      ? "Admin Panel"
      : userType === "OWNER"
        ? "Owner Panel"
        : userType === "RENTER"
          ? "Renter Panel"
          : "User Panel";

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="sidebar-brand">
          <div className="sidebar-brand-circle">U</div>
          <div className="sidebar-brand-text">{panelTitle}</div>
        </div>

        <div className="sidebar-section-title">Main</div>

        <div className="sidebar-menu">
          {(role === "ADMIN" || role === "SUB_ADMIN") && (
            <>
              <NavLink
                to="/dashboard"
                onClick={closeSidebarOnMobile}
                className={({ isActive }) =>
                  `sidebar-btn ${isActive ? "active" : ""}`
                }
              >
                <FiHome className="sidebar-icon" />
                Dashboard
              </NavLink>

              <NavLink
                to="/users"
                onClick={closeSidebarOnMobile}
                className={({ isActive }) =>
                  `sidebar-btn ${isActive ? "active" : ""}`
                }
              >
                <FiUsers className="sidebar-icon" />
                Users
              </NavLink>

              <NavLink
                to="/admin/properties"
                onClick={closeSidebarOnMobile}
                className={({ isActive }) =>
                  `sidebar-btn ${isActive ? "active" : ""}`
                }
              >
                <FiGrid className="sidebar-icon" />
                Properties
              </NavLink>
              <NavLink
                to="/admin/reviews"
                onClick={closeSidebarOnMobile}
                className={({ isActive }) =>
                  `sidebar-btn ${isActive ? "active" : ""}`
                }
              >
                <FiStar className="sidebar-icon" />
                Review Approvals
              </NavLink>
            </>
          )}

          {role === "USER" && (
            <>
              <NavLink
                to="/owner-dashboard"
                onClick={closeSidebarOnMobile}
                className={({ isActive }) =>
                  `sidebar-btn ${isActive ? "active" : ""}`
                }
              >
                <FiHome className="sidebar-icon" />
                Dashboard
              </NavLink>

              <NavLink
                to="/owner/all-listings"
                onClick={closeSidebarOnMobile}
                className={({ isActive }) =>
                  `sidebar-btn ${isActive ? "active" : ""}`
                }
              >
                <FiGrid className="sidebar-icon" />
                All Listings
              </NavLink>

              <NavLink
                to="/owner/my-properties"
                onClick={closeSidebarOnMobile}
                className={({ isActive }) =>
                  `sidebar-btn ${isActive ? "active" : ""}`
                }
              >
                <FiList className="sidebar-icon" />
                My Properties
              </NavLink>

              <NavLink
                to="/wishlist"
                onClick={closeSidebarOnMobile}
                className={({ isActive }) =>
                  `sidebar-btn ${isActive ? "active" : ""}`
                }
              >
                <FiHeart className="sidebar-icon" />
                Wishlist
              </NavLink>

              <NavLink
                to="/owner/inquiries"
                onClick={closeSidebarOnMobile}
                className={({ isActive }) =>
                  `sidebar-btn ${isActive ? "active" : ""}`
                }
              >
                <FiMessageCircle className="sidebar-icon" />
                Inquiries
              </NavLink>

              <NavLink
                to="/owner/visits"
                onClick={closeSidebarOnMobile}
                className={({ isActive }) =>
                  `sidebar-btn ${isActive ? "active" : ""}`
                }
              >
                <FiMessageCircle className="sidebar-icon" />
                Visit Requests
              </NavLink>
            </>
          )}
        </div>
      </aside>

      <div className="main-panel">
        <div className="topbar">
          <div className="topbar-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <div className="topbar-title">{title}</div>
          </div>

          <div className="topbar-right">
            <div className="notification-box" ref={notificationRef}>
              <div
                className="notification-icon"
                onClick={() => setNotificationOpen((prev) => !prev)}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </div>

              {notificationOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <span>Notifications</span>

                    {notifications.length > 0 && (
                      <button
                        className="mark-read-btn"
                        onClick={handleMarkAllAsRead}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="notification-empty">No notifications yet</p>
                  ) : (
                    <div className="notification-list">
                      {notifications.map((item) => (
                        <div
                          key={item._id}
                          className={`notification-item ${
                            item.isRead ? "read" : "unread"
                          }`}
                          onClick={() => handleNotificationClick(item)}
                        >
                          <p className="notification-title">{item.title}</p>
                          <p className="notification-message">{item.message}</p>

                          {item.property?.title && (
                            <p className="notification-property">
                              Property: {item.property.title}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="profile-box" ref={profileRef}>
              <div
                className="profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="profile-avatar">{userInitial}</div>
              </div>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <p className="profile-name">{userName}</p>
                    <p className="profile-email">{userData?.email}</p>
                    <span className="profile-role">
                      {userType === "OWNER"
                        ? "Owner"
                        : userType === "RENTER"
                          ? "Renter"
                          : "User"}
                    </span>
                  </div>

                  <div className="profile-divider"></div>

                  <button
                    className="dropdown-btn"
                    onClick={() => {
                      setShowChangePassword(true);
                      setProfileOpen(false);
                    }}
                  >
                    Change Password
                  </button>

                  <div className="theme-toggle">
                    <span>Theme</span>

                    <div className="theme-actions">
                      <button
                        className={`theme-btn ${
                          theme === "light" ? "active" : ""
                        }`}
                        onClick={() => setTheme("light")}
                      >
                        Light
                      </button>

                      <button
                        className={`theme-btn ${
                          theme === "dark" ? "active" : ""
                        }`}
                        onClick={() => setTheme("dark")}
                      >
                        Dark
                      </button>
                    </div>
                  </div>

                  <div className="profile-divider"></div>

                  <button
                    className="dropdown-btn logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="page-content">{children}</div>

        {showChangePassword && (
          <div className="modal-overlay">
            <div className="change-password-modal">
              <div className="modal-header">
                <h3>Change Password</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowChangePassword(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Old Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter old password"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  className="change-password-submit"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppLayout;

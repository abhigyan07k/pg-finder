import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiHeart,
  FiMessageSquare,
  FiCalendar,
  FiChevronDown,
  FiSettings,
  FiBell,
  FiCheck,
  FiMessageCircle,
} from "react-icons/fi";

import "../styles/Navbar.css";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/notificationApi";

function Navbar() {
  const navigate = useNavigate();
  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;

    return `http://localhost:8000${image}`;
  };

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {},
  );
  const userName = user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const profileImage = getImageUrl(user?.profileImage);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const profileRef = useRef();
  const notificationRef = useRef();

  const isAdmin = role === "ADMIN" || role === "SUB_ADMIN";
  const isNormalUser = role === "USER";

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
    setNotificationOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    closeMenu();
    navigate("/");
  };

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      setNotifLoading(true);

      const res = await getNotifications(1, 5);

      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.log("Notification fetch error:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification._id);
      }

      setNotificationOpen(false);
      fetchNotifications();

      if (
        notification.type === "VISIT_REQUEST" ||
        notification.type === "VISIT_APPROVED" ||
        notification.type === "VISIT_REJECTED"
      ) {
        navigate("/my-visits");
        return;
      }

      if (notification.type === "INQUIRY") {
        navigate("/my-inquiries");
        return;
      }

      if (
        notification.type === "PROPERTY_APPROVED" ||
        notification.type === "PROPERTY_REJECTED" ||
        notification.type === "PROPERTY_DELETED"
      ) {
        navigate("/my-properties");
        return;
      }

      if (notification.property?._id) {
        navigate(`/property/view/${notification.property._id}`);
        return;
      }

      navigate("/listings");
    } catch (err) {
      console.log("Notification click error:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.log("Mark all notifications read error:", err);
    }
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return "Just now";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    return notificationDate.toLocaleDateString();
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  useEffect(() => {
    const loadUser = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user")) || {};
      setUser(updatedUser);
    };

    window.addEventListener("profileUpdated", loadUser);

    return () => {
      window.removeEventListener("profileUpdated", loadUser);
    };
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

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!storedToken || !userId) return;

    const socket = io("http://localhost:8000", {
      withCredentials: true,
    });

    socket.emit("join", userId);

    socket.on("newNotification", () => {
      fetchNotifications();
    });

    return () => socket.disconnect();
  }, []);

  return (
    <nav className="site-navbar">
      <div className="navbar-inner">
        <div
          className="navbar-logo"
          onClick={() => {
            closeMenu();
            navigate("/");
          }}
        >
          PGs Finder
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>
            <FiHome />
            Home
          </NavLink>

          <NavLink to="/listings" onClick={closeMenu}>
            <FiSearch />
            Listings
          </NavLink>

          {token && isNormalUser && (
            <>
              <NavLink to="/my-visits" onClick={closeMenu}>
                <FiCalendar />
                Visits
              </NavLink>

              <NavLink to="/my-chats" onClick={closeMenu}>
                <FiMessageCircle />
                Messages
              </NavLink>

              <NavLink to="/add-property" onClick={closeMenu}>
                <FiPlusSquare color="#38bdf8" size="1.5em" />
              </NavLink>
            </>
          )}

          {token && isAdmin && (
            <NavLink to="/dashboard" onClick={closeMenu}>
              Admin Dashboard
            </NavLink>
          )}

          {!token ? (
            <div className="navbar-auth">
              <button
                className="nav-login-btn"
                onClick={() => {
                  closeMenu();
                  navigate("/login");
                }}
              >
                Login
              </button>

              <button
                className="nav-register-btn"
                onClick={() => {
                  closeMenu();
                  navigate("/register");
                }}
              >
                Register
              </button>
            </div>
          ) : (
            <>
              <div className="navbar-notification" ref={notificationRef}>
                <button
                  className="notification-trigger"
                  onClick={() => {
                    setNotificationOpen((prev) => !prev);
                    setProfileOpen(false);
                  }}
                >
                  <FiBell />

                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <div>
                        <h4>Notifications</h4>
                        <p>{unreadCount} unread</p>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          className="mark-all-btn"
                          onClick={handleMarkAllAsRead}
                        >
                          <FiCheck />
                          Mark all
                        </button>
                      )}
                    </div>

                    <div className="notification-list">
                      {notifLoading ? (
                        <p className="notification-empty">Loading...</p>
                      ) : notifications.length === 0 ? (
                        <p className="notification-empty">
                          No notifications yet
                        </p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`notification-item ${
                              !notification.isRead ? "unread" : ""
                            }`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <div className="notification-dot"></div>

                            <div className="notification-content">
                              <h5>{notification.title}</h5>
                              <p>{notification.message}</p>

                              {notification.property?.title && (
                                <span>
                                  Property: {notification.property.title}
                                </span>
                              )}

                              <span className="notification-time">
                                {getRelativeTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="navbar-profile" ref={profileRef}>
                <button
                  className="profile-trigger"
                  onClick={() => {
                    setProfileOpen((prev) => !prev);
                    setNotificationOpen(false);
                  }}
                >
                  <div className="profile-avatar">
                    {profileImage ? (
                      <img src={profileImage} alt={userName} />
                    ) : (
                      userInitial
                    )}
                  </div>

                  <span className="profile-name-color">{userName}</span>

                  <FiChevronDown className={profileOpen ? "rotate-icon" : ""} />
                </button>

                {profileOpen && (
                  <div className="profile-dropdown-menu">
                    <div className="profile-dropdown-header">
                      <div className="profile-avatar large">
                        {profileImage ? (
                          <img src={profileImage} alt={userName} />
                        ) : (
                          userInitial
                        )}
                      </div>

                      <div>
                        <h4>{userName}</h4>
                        <p>{user?.email || "user@example.com"}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        closeMenu();
                        navigate("/profile");
                      }}
                    >
                      <FiUser />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        closeMenu();
                        navigate("/my-properties");
                      }}
                    >
                      <FiHome />
                      My Properties
                    </button>

                    <button
                      onClick={() => {
                        closeMenu();
                        navigate("/wishlist");
                      }}
                    >
                      <FiHeart />
                      My Wishlists
                    </button>

                    <button
                      onClick={() => {
                        closeMenu();
                        navigate("/change-password");
                      }}
                    >
                      <FiSettings />
                      Change Password
                    </button>

                    <button className="logout-option" onClick={handleLogout}>
                      <FiLogOut />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

import { useEffect, useState } from "react";
import {
  FiCamera,
  FiCheckCircle,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import api from "../services/api";
import "../styles/MyProfile.css";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function MyProfile() {
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    phone: "",
  });

  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `http://localhost:8000${image}`;
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.data);
      setEditData({
        name: res.data.data.name || "",
        phone: res.data.data.phone || "",
      });
      setPreview(getImageUrl(res.data.data.profileImage));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const isGoogleUser = user?.authProvider === "GOOGLE";

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (isGoogleUser) {
      setError("Profile photo is managed by Google");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const res = await api.patch("/auth/profile-photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedImage = getImageUrl(res.data.profileImage);

      setPreview(updatedImage);

      const localUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = {
        ...localUser,
        profileImage: res.data.profileImage,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));

      setMessage(res.data.message || "Profile photo updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile photo");
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setError("");
    setMessage("");

    if (!editData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (editData.phone && editData.phone.length !== 10) {
      setError("Phone number must be 10 digits");
      return;
    }

    try {
      setUpdating(true);

      const res = await api.patch("/auth/update-profile", editData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = res.data.user || res.data.data;

      setUser(updatedUser);
      setEditMode(false);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      window.dispatchEvent(new Event("profileUpdated"));

      setMessage(res.data.message || "Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return <div className="profile-page">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-top-bar">
        <button className="profile-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
          Back
        </button>
      </div>
      <div className="profile-container">
        <div className="profile-left-card">
          <div className="profile-photo-box">
            {preview ? (
              <img src={preview} alt={user.name} />
            ) : (
              <div className="profile-initial-large">{userInitial}</div>
            )}

            {!isGoogleUser && (
              <label className="change-photo-btn">
                <FiCamera />
                {uploading ? "Uploading..." : "Change Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={uploading}
                  hidden
                />
              </label>
            )}
          </div>

          <h2>{user.name}</h2>
          <p>{user.email}</p>

          {isGoogleUser && (
            <span className="google-managed-badge">
              <FiLock /> Photo managed by Google
            </span>
          )}
        </div>

        <div className="profile-right-card">
          <h3>Account Information</h3>

          <div className="info-grid">
            <div className="info-item">
              <FiUser />
              <div>
                <label>Full Name</label>

                {editMode ? (
                  <input
                    className="profile-edit-input"
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                ) : (
                  <p>{user.name}</p>
                )}
              </div>
            </div>

            <div className="info-item">
              <FiMail />
              <div>
                <label>Email</label>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="info-item">
              <FiPhone />
              <div>
                <label>Phone</label>

                {editMode ? (
                  <input
                    className="profile-edit-input"
                    type="tel"
                    value={editData.phone}
                    maxLength={10}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                ) : (
                  <p>{user.phone || "Not added"}</p>
                )}
              </div>
            </div>

            <div className="info-item">
              <FiCheckCircle />
              <div>
                <label>Email Status</label>
                <p>{user.isEmailVerified ? "Verified" : "Not Verified"}</p>
              </div>
            </div>
          </div>

          <div className="profile-badges">
            <span>{user.role}</span>
            <span>{user.authProvider}</span>
          </div>

          <div className="profile-action-row">
            {editMode ? (
              <>
                <button
                  className="profile-save-btn"
                  onClick={handleProfileUpdate}
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>

                <button
                  className="profile-cancel-btn"
                  onClick={() => {
                    setEditMode(false);
                    setEditData({
                      name: user.name || "",
                      phone: user.phone || "",
                    });
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="profile-edit-btn"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {message && <p className="profile-success">{message}</p>}
          {error && <p className="profile-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default MyProfile;

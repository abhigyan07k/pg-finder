import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";
import "../styles/ChangePassword.css";

function ChangePassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      return toast.error("All fields are required");
    }

    if (formData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New password and confirm password do not match");
    }

    try {
      setLoading(true);

      const res = await api.patch("/auth/change-password", formData);

      toast.success(res.data.message || "Password changed successfully");

      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        <div className="change-password-icon">
          <FiLock />
        </div>

        <h2>Change Password</h2>
        <p className="change-password-subtitle">
          Update your account password securely
        </p>

        <form onSubmit={handleSubmit}>
          <div className="password-field">
            <input
              type={showPassword.oldPassword ? "text" : "password"}
              name="oldPassword"
              placeholder="Old Password"
              value={formData.oldPassword}
              onChange={handleChange}
            />
            <button type="button" onClick={() => togglePassword("oldPassword")}>
              {showPassword.oldPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="password-field">
            <input
              type={showPassword.newPassword ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
            />
            <button type="button" onClick={() => togglePassword("newPassword")}>
              {showPassword.newPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="password-field">
            <input
              type={showPassword.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => togglePassword("confirmPassword")}
            >
              {showPassword.confirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            className="change-password-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          <button
            type="button"
            className="cancel-password-btn"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;

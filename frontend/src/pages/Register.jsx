import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";
import "../styles/Auth.css";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
    userType: "OWNER",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getDashboardPath = (user) => {
    if (user?.role === "ADMIN" || user?.role === "SUB_ADMIN") {
      return "/admin/dashboard";
    }

    return "/listings";
  };

  // SEND OTP
  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!formData.email) {
      setError("Please enter email");
      return;
    }

    try {
      setSendingOtp(true);

      const res = await api.post("/auth/send-register-otp", {
        email: formData.email,
      });

      setOtpSent(true);
      setMessage(res.data.message || "OTP sent successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  //VERIFY OTP
  const handleVerifyOtp = async (value) => {
    const cleanOtp = value.replace(/\D/g, "");

    setFormData((prev) => ({
      ...prev,
      otp: cleanOtp,
    }));

    setError("");
    setMessage("");

    if (cleanOtp.length !== 6) {
      setOtpVerified(false);
      return;
    }

    try {
      setOtpVerifying(true);

      const res = await api.post("/auth/verify-register-otp", {
        email: formData.email.toLowerCase().trim(),
        otp: cleanOtp,
      });

      if (res.data.success) {
        setOtpVerified(true);
        setMessage("OTP Verified successfully");
      }
    } catch (err) {
      setOtpVerified(false);
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  // REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (formData.phone.length !== 10) {
      setError("Phone number must be 10 digits");
      return;
    }

    if (!otpSent) {
      setError("Please verify your email first");
      return;
    }
    if (!otpVerified) {
      setError("Please enter a valid OTP first");
      return;
    }

    try {
      setRegisterLoading(true);

      const res = await api.post("/auth/register", formData);

      const token = res.data.token;
      const user = res.data.user || res.data.data;

      if (token) {
        localStorage.setItem("token", token);
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user.id);
        localStorage.setItem("role", user.role);
      }

      setMessage(res.data.message || "Registered successfully");

      const redirectPath = location.state?.from || getDashboardPath(user);

      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/login");
    }
  };

  //GOOGLE SIGNUP
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError("");
      setMessage("");

      const res = await api.post("/auth/google-login", {
        credential: credentialResponse.credential,
      });

      const token = res.data.token;
      const user = res.data.user;

      if (token) {
        localStorage.setItem("token", token);
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user.id);
        localStorage.setItem("role", user.role);
      }

      setMessage("Google login successful");

      const redirectPath = location.state?.from || getDashboardPath(user);

      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <button className="login-back-btn" onClick={handleBack}>
        ← Back
      </button>

      <div className="auth-card">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />
            <label>Name</label>
          </div>

          {/* EMAIL + OTP BUTTON */}
          <div className="email-otp-row">
            <div className="input-group">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
              <label>Email</label>
            </div>

            <button
              type="button"
              className="otp-btn"
              onClick={handleSendOtp}
              disabled={sendingOtp}
            >
              {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
            </button>
          </div>

          {/* OTP FIELD */}
          {otpSent && (
            <div className="input-group">
              <input
                type="text"
                name="otp"
                required
                value={formData.otp}
                onChange={(e) => handleVerifyOtp(e.target.value)}
                maxLength={6}
              />
              <label>Enter OTP</label>
            </div>
          )}
          {otpVerifying && <p className="otp-info">Verifying OTP...</p>}

          {formData.otp.length === 6 && otpVerified && (
            <p className="otp-success">OTP Verified ✅</p>
          )}

          {formData.otp.length === 6 && !otpVerified && !otpVerifying && (
            <p className="otp-error">Invalid OTP ❌</p>
          )}

          <div className="input-group">
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
            />
            <label>Phone Number</label>
          </div>
          <div className="auth-input-group">
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="auth-input"
              required
            >
              <option value="OWNER">Owner</option>
              <option value="AGENT">Agent</option>
            </select>
          </div>

          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <label>Password</label>

            <span
              className="eye-icon"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <button className="primary-btn" type="submit">
            {registerLoading ? "Registering..." : "Verify & Register"}
          </button>
        </form>

        <div className="divider">or</div>

        <div className="google-login-box">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
          />
        </div>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <p className="switch">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;

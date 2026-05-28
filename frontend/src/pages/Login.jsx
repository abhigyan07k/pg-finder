import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import api from "../services/api";
import "../styles/Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || "/listings";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/listings");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", formData);

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id || user.id);

      // console.log("Backend Response:", res.data);
      if (user.role === "ADMIN" || user.role === "SUB_ADMIN") {
        navigate("/dashboard");
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Back Button */}
      <button className="login-back-btn" onClick={handleBack}>
        ← Back
      </button>

      <div className="auth-card">
        <h2>Welcome Back 👋</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              required
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
            />
            <label>Email</label>
          </div>

          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder=" "
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

          <p
            className="forgot-link"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </p>

          <button className="primary-btn" type="submit">
            Login
          </button>
        </form>

        <div className="divider">or</div>

        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              const res = await api.post("/auth/google-login", {
                credential: credentialResponse.credential,
              });

              const { token, user } = res.data;

              //ALL STORAGE FIXED
              localStorage.setItem("token", token);
              localStorage.setItem("role", user.role);
              localStorage.setItem("user", JSON.stringify(user));
              localStorage.setItem("userId", user.id || user._id);

              toast.success("Google Login successful");

              //REDIRECT LOGIC AS NORMAL LOGIN
              if (user.role === "ADMIN" || user.role === "SUB_ADMIN") {
                navigate("/dashboard");
              } else {
                navigate(redirectPath);
              }
            } catch (err) {
              console.error("Google Login Error:", err.response?.data || err);
              toast.error(err.response?.data?.message || "Google login failed");
            }
          }}
          onError={() => {
            console.log("Google Login Failed");
            toast.error("Google login failed");
          }}
        />

        {error && <p className="error">{error}</p>}

        <p className="switch">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}

export default Login;

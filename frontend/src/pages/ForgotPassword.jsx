import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import "../styles/Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();

  const startTimer = () => {
    let time = 60;
    setTimer(time);

    const interval = setInterval(() => {
      time -= 1;
      setTimer(time);

      if (time <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/forgot-password", {
        email,
      });

      toast.success(`Your OTP is: ${res.data.otp}`, {
        duration: 5000,
      });

      startTimer();

      setTimeout(() => {
        navigate("/reset-password", {
          state: { email },
        });
      }, 5000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" disabled={loading || timer > 0}>
            {loading
              ? "Sending..."
              : timer > 0
                ? `Resend OTP in ${timer}s`
                : "Get OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiTrendingUp,
  FiStar,
  FiShield,
} from "react-icons/fi";

import "../styles/BoostProperty.css";

function BoostProperty() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [selectedPlan, setSelectedPlan] = useState("PREMIUM");
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      key: "BASIC",
      title: "Basic Boost",
      price: "₹99",
      duration: "3 Days",
      icon: <FiTrendingUp />,
      features: [
        "Appear above normal listings",
        "More visibility",
        "Increase property reach",
      ],
    },

    {
      key: "PREMIUM",
      title: "Premium Boost",
      price: "₹299",
      duration: "7 Days",
      icon: <FiStar />,
      features: ["Featured badge", "Higher ranking", "Priority visibility"],
    },

    {
      key: "ELITE",
      title: "Elite Boost",
      price: "₹599",
      duration: "15 Days",
      icon: <FiShield />,
      features: [
        "Top search ranking",
        "Verified owner badge",
        "Maximum exposure",
      ],
    },
  ];

  const handleActivateBoost = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.patch(
        `/property/boost/${id}`,
        {
          plan: selectedPlan,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert(res.data.message);

      navigate("/my-properties");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to activate boost");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="boost-page">
      <button className="boost-back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft />
        Back
      </button>

      <section className="boost-hero">
        <span className="boost-badge">Featured Property Promotion</span>

        <h1>Boost Your Property Visibility</h1>

        <p>
          Get more views, inquiries, chats, and visits by promoting your
          property at the top of listings.
        </p>
      </section>

      <section className="boost-grid">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={`boost-card ${
              selectedPlan === plan.key ? "active-plan" : ""
            }`}
          >
            <div className="boost-icon">{plan.icon}</div>

            <h2>{plan.title}</h2>

            <h3>{plan.price}</h3>

            <p>{plan.duration}</p>

            <div className="boost-features">
              {plan.features.map((feature, index) => (
                <div key={index} className="boost-feature-item">
                  <FiCheckCircle />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              className="select-plan-btn"
              onClick={() => setSelectedPlan(plan.key)}
            >
              {selectedPlan === plan.key ? "Selected" : "Choose This Plan"}
            </button>
          </div>
        ))}
      </section>

      <div className="boost-bottom-bar">
        <div>
          <h3>Selected Plan: {selectedPlan}</h3>
          <p>Secure payment integration will be added with Razorpay.</p>
        </div>

        <button className="activate-boost-btn" onClick={handleActivateBoost}>
          {loading ? "Activating..." : "Activate Boost"}
        </button>
      </div>
    </div>
  );
}

export default BoostProperty;

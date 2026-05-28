import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    userType: "RENTER",
    isActive: true,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const res = await api.get(`/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = res.data.data;

      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "USER",
        userType: user.userType || "RENTER",
        isActive: user.isActive ?? true,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch user");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "isActive" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const updateData = { ...formData };

      // blank password backend ko mat bhejo
      if (!updateData.password.trim()) {
        delete updateData.password;
      }

      const res = await api.put(`/user/update-user/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(res.data.message || "User updated successfully");

      setTimeout(() => {
        navigate("/users");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Edit User</h2>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter name"
              style={styles.input}
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              style={styles.input}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter new password"
              style={styles.input}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Role</label>
            <select
              name="role"
              style={styles.input}
              value={formData.role}
              onChange={handleChange}
            >
              <option value="USER">USER</option>
              <option value="SUB_ADMIN">SUB_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>User Type</label>
            <select
              name="userType"
              style={styles.input}
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="RENTER">RENTER</option>
              <option value="OWNER">OWNER</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Status</label>
            <select
              name="isActive"
              style={styles.input}
              value={String(formData.isActive)}
              onChange={handleChange}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.updateButton}>
              Update User
            </button>

            <button
              type="button"
              style={styles.backButton}
              onClick={() => navigate("/users")}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f7fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "24px",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "12px",
  },
  success: {
    color: "green",
    textAlign: "center",
    marginBottom: "12px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "8px",
    fontWeight: "500",
    color: "#333",
  },
  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
  },
  updateButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f59e0b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  },
  backButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  },
};

export default EditUser;

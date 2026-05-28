import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../services/api";

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    propertyTitle: "",
    propertyType: "FLAT",
    listingFor: "RENT",
    propertyDescription: "",
    fullAddress: "",
    city: "",
    state: "",
    pinCode: "",
    nearbyLandmark: "",
    bhk: "",
    floor: "",
    totalFloors: "",
    area: "",
    furnishing: "UNFURNISHED",
    bathrooms: "",
    price: "",
    phone: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (existingImages.length + selectedImages.length + files.length > 8) {
      setMessage("Total images cannot exceed 8");
      setMessageType("error");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    const invalidFile = files.find(
      (file) =>
        !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024,
    );

    if (invalidFile) {
      setMessage("Only jpg, jpeg, png, webp images under 5MB are allowed");
      setMessageType("error");
      return;
    }

    setSelectedImages((prev) => [...prev, ...files]);
    setMessage("");
    setMessageType("");
    e.target.value = "";
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const removeSelectedImage = (indexToRemove) => {
    setSelectedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const fetchProperty = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(`/property/view/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const property = response.data.data;

      setFormData({
        propertyTitle: property.title || "",
        propertyType: property.propertyType || "FLAT",
        listingFor: property.listingFor || "RENT",
        propertyDescription: property.description || "",
        fullAddress: property.fullAddress || "",
        city: property.city || "",
        state: property.state || "",
        pinCode: property.pinCode || "",
        nearbyLandmark: property.nearbyLandmark || "",
        bhk: property.bhk || "",
        floor: property.floor || "",
        totalFloors: property.totalFloors || "",
        area: property.area || "",
        furnishing: property.furnishing || "UNFURNISHED",
        bathrooms: property.bathrooms || "",
        price: property.price || "",
        phone: property.phone || "",
      });

      setExistingImages(property.images || []);
    } catch (error) {
      console.log(
        "Fetch Single Property Error:",
        error.response?.data || error.message,
      );
      setMessage(error.response?.data?.message || "Failed to load property");
      setMessageType("error");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = new FormData();

      payload.append("title", formData.propertyTitle);
      payload.append("propertyType", formData.propertyType);
      payload.append("listingFor", formData.listingFor);
      payload.append("description", formData.propertyDescription);
      payload.append("fullAddress", formData.fullAddress);
      payload.append("city", formData.city);
      payload.append("state", formData.state);
      payload.append("pinCode", formData.pinCode);
      payload.append("nearbyLandmark", formData.nearbyLandmark);
      payload.append("bhk", formData.bhk);
      payload.append("floor", formData.floor);
      payload.append("totalFloors", formData.totalFloors);
      payload.append("area", formData.area);
      payload.append("furnishing", formData.furnishing);
      payload.append("bathrooms", formData.bathrooms);
      payload.append("price", formData.price);
      payload.append("phone", formData.phone);
      payload.append("existingImages", JSON.stringify(existingImages));

      selectedImages.forEach((image) => {
        payload.append("images", image);
      });

      const response = await api.put(`/property/update/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(response.data?.message || "Property updated successfully");
      setMessageType("success");

      setTimeout(() => {
        navigate("/owner/my-properties");
      }, 1000);
    } catch (error) {
      console.log(
        "Update Property Error:",
        error.response?.data || error.message,
      );
      setMessage(error.response?.data?.message || "Failed to update property");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.stateBox}>
          <button
            type="button"
            style={styles.backBtn}
            onClick={() => navigate("/owner/my-properties")}
          >
            ← Back
          </button>
          <p style={styles.messageText}>Loading property...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <form
        onSubmit={handleSubmit}
        style={{
          ...styles.container,
          padding: isMobile ? "0 2px" : "0",
        }}
      >
        <div style={styles.topActions}>
          <button
            type="button"
            style={styles.backBtn}
            onClick={() => navigate("/owner/my-properties")}
          >
            ← Back
          </button>
        </div>

        <div
          style={{
            ...styles.section,
            padding: isMobile ? "16px" : "20px",
          }}
        >
          <h3 style={styles.heading}>Basic Info</h3>

          <input
            name="propertyTitle"
            placeholder="Property Title"
            value={formData.propertyTitle}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <div
            style={{
              ...styles.grid2,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="FLAT">Flat</option>
              <option value="PG">PG</option>
              <option value="ROOM">Room</option>
            </select>

            <select
              name="listingFor"
              value={formData.listingFor}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="RENT">Rent</option>
              <option value="SALE">Sale</option>
            </select>
          </div>

          <textarea
            name="propertyDescription"
            placeholder="Description"
            value={formData.propertyDescription}
            onChange={handleChange}
            style={styles.textarea}
            required
          />
        </div>

        <div
          style={{
            ...styles.section,
            padding: isMobile ? "16px" : "20px",
          }}
        >
          <h3 style={styles.heading}>Location</h3>

          <input
            name="fullAddress"
            placeholder="Full Address"
            value={formData.fullAddress}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <div
            style={{
              ...styles.grid2,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <input
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              name="pinCode"
              placeholder="Pin Code"
              value={formData.pinCode}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="nearbyLandmark"
              placeholder="Nearby Landmark"
              value={formData.nearbyLandmark}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </div>

        <div
          style={{
            ...styles.section,
            padding: isMobile ? "16px" : "20px",
          }}
        >
          <h3 style={styles.heading}>Property Details</h3>

          <div
            style={{
              ...styles.grid2,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <input
              name="bhk"
              placeholder="BHK"
              value={formData.bhk}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              name="floor"
              placeholder="Floor"
              value={formData.floor}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="totalFloors"
              placeholder="Total Floors"
              value={formData.totalFloors}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="area"
              placeholder="Area (sqft)"
              value={formData.area}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div
            style={{
              ...styles.grid2,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <select
              name="furnishing"
              value={formData.furnishing}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="UNFURNISHED">Unfurnished</option>
              <option value="FURNISHED">Furnished</option>
              <option value="SEMI_FURNISHED">Semi Furnished</option>
            </select>

            <input
              name="bathrooms"
              placeholder="Bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </div>

        <div
          style={{
            ...styles.section,
            padding: isMobile ? "16px" : "20px",
          }}
        >
          <h3 style={styles.heading}>Pricing & Contact</h3>

          <div
            style={{
              ...styles.grid2,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              name="phone"
              placeholder="Owner Phone Number"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div
          style={{
            ...styles.section,
            padding: isMobile ? "16px" : "20px",
          }}
        >
          <h3 style={styles.heading}>Existing Images</h3>

          {existingImages.length === 0 ? (
            <p style={styles.helperText}>No existing images</p>
          ) : (
            <div
              style={{
                ...styles.imageGrid,
                gridTemplateColumns: isMobile
                  ? "1fr 1fr"
                  : isTablet
                    ? "1fr 1fr"
                    : "repeat(auto-fill, minmax(180px, 1fr))",
              }}
            >
              {existingImages.map((img, index) => (
                <div key={index} style={styles.imageCard}>
                  <img
                    src={img}
                    alt={`property-${index}`}
                    style={styles.image}
                  />
                  <button
                    type="button"
                    style={styles.removeBtn}
                    onClick={() => removeExistingImage(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            ...styles.section,
            padding: isMobile ? "16px" : "20px",
          }}
        >
          <h3 style={styles.heading}>Add New Images</h3>

          <input
            type="file"
            name="images"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            onChange={handleImageChange}
            style={styles.input}
          />

          <p style={styles.helperText}>
            Total images after update cannot exceed 8
          </p>

          {selectedImages.length > 0 && (
            <div style={styles.previewBox}>
              <p style={styles.previewTitle}>New Selected Images:</p>
              {selectedImages.map((file, index) => (
                <div key={index} style={styles.previewItemRow}>
                  <span style={styles.previewItemText}>
                    {index + 1}. {file.name}
                  </span>
                  <button
                    type="button"
                    style={styles.smallRemoveBtn}
                    onClick={() => removeSelectedImage(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Updating..." : "Update Property"}
        </button>

        {message && (
          <p
            style={{
              ...styles.message,
              color: messageType === "error" ? "#dc2626" : "#16a34a",
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    padding: "32px 20px",
  },

  container: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  topActions: {
    display: "flex",
    justifyContent: "flex-start",
  },

  backBtn: {
    padding: "10px 16px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    backgroundColor: "#fff",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: "600",
  },

  stateBox: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    color: "#334155",
  },

  messageText: {
    margin: 0,
    color: "#475569",
    fontWeight: "500",
  },

  section: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  heading: {
    marginBottom: "8px",
    color: "#334155",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  input: {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
  },

  textarea: {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    minHeight: "100px",
    resize: "vertical",
    outline: "none",
  },

  button: {
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  message: {
    marginTop: "10px",
    fontWeight: "600",
  },

  helperText: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  previewBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "12px",
  },

  previewTitle: {
    margin: "0 0 8px 0",
    fontWeight: "600",
    color: "#334155",
  },

  previewItemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },

  previewItemText: {
    fontSize: "14px",
    color: "#475569",
    wordBreak: "break-word",
    flex: 1,
  },

  smallRemoveBtn: {
    padding: "6px 10px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "12px",
  },

  imageCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
  },

  removeBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default EditProperty;

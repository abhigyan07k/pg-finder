import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import "../styles/AddProperty.css";

function AddProperty() {
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
    roomFeatures: {
      acType: "NON_AC",
      attachedBathroom: false,
      balcony: false,
    },

    amenities: [],
    tenantPreference: "ANYONE",
    rules: {
      smokingAllowed: false,
      drinkingAllowed: false,
      visitorAllowed: false,
    },
    depositAmount: "",
    maintenanceCharges: "",
    availableFrom: "",
    minimumStay: "",
    availableImmediately: false,
    noticePeriod: "",
    leaseDuration: "",
    rentNegotiable: false,
    sharingType: "NONE",
    foodDetails: {
      vegFood: false,
      nonVegFood: false,
      breakfastIncluded: false,
      lunchIncluded: false,
      dinnerIncluded: false,
    },
    electricityIncluded: false,
    waterIncluded: false,
    extraCharges: "",
    securityFeatures: [],
    nearbyEssentials: [],
    facing: "NONE",
    parkingType: "NONE",
    workFriendly: false,
    highSpeedInternet: false,
    couplesAllowed: false,
    studentsAllowed: false,
    workingProfessionalsAllowed: false,
    propertyAge: "UNKNOWN",
    balconyView: "NONE",
    ownerInstructions: "",
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
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

    const updatedImages = [...selectedImages, ...files];

    if (updatedImages.length > 8) {
      setMessage("You can upload maximum 8 images only");
      setMessageType("error");
      return;
    }

    setSelectedImages(updatedImages);
    setPreviewUrls(updatedImages.map((file) => URL.createObjectURL(file)));
    setMessage("");
    setMessageType("");
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = [...selectedImages];
    const updatedPreviews = [...previewUrls];

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setSelectedImages(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

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
      payload.append("roomFeatures", JSON.stringify(formData.roomFeatures));

      payload.append("amenities", JSON.stringify(formData.amenities));

      payload.append("rules", JSON.stringify(formData.rules));

      payload.append("tenantPreference", formData.tenantPreference);

      payload.append("depositAmount", formData.depositAmount);

      payload.append("maintenanceCharges", formData.maintenanceCharges);

      payload.append("availableFrom", formData.availableFrom);

      payload.append("minimumStay", formData.minimumStay);
      payload.append("availableImmediately", formData.availableImmediately);
      payload.append("noticePeriod", formData.noticePeriod);
      payload.append("leaseDuration", formData.leaseDuration);
      payload.append("rentNegotiable", formData.rentNegotiable);
      payload.append("sharingType", formData.sharingType);

      payload.append("foodDetails", JSON.stringify(formData.foodDetails));

      payload.append("electricityIncluded", formData.electricityIncluded);
      payload.append("waterIncluded", formData.waterIncluded);
      payload.append("extraCharges", formData.extraCharges);

      payload.append(
        "securityFeatures",
        JSON.stringify(formData.securityFeatures),
      );
      payload.append(
        "nearbyEssentials",
        JSON.stringify(formData.nearbyEssentials),
      );

      payload.append("facing", formData.facing);
      payload.append("parkingType", formData.parkingType);

      payload.append("workFriendly", formData.workFriendly);
      payload.append("highSpeedInternet", formData.highSpeedInternet);
      payload.append("couplesAllowed", formData.couplesAllowed);
      payload.append("studentsAllowed", formData.studentsAllowed);
      payload.append(
        "workingProfessionalsAllowed",
        formData.workingProfessionalsAllowed,
      );

      payload.append("propertyAge", formData.propertyAge);
      payload.append("balconyView", formData.balconyView);
      payload.append("ownerInstructions", formData.ownerInstructions);

      selectedImages.forEach((image) => {
        payload.append("images", image);
      });

      const response = await api.post("/property/create", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(
        response.data?.message ||
          "Property submitted successfully. PG Finder team will review and approve your listing shortly.",
      );
      setMessageType("success");

      toast(
        "Property submitted! PG Finder team will approve it after verification.",
        {
          icon: "📌",
        },
      );

      setFormData({
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
        roomFeatures: {
          acType: "NON_AC",
          attachedBathroom: false,
          balcony: false,
        },

        amenities: [],
        tenantPreference: "ANYONE",
        rules: {
          smokingAllowed: false,
          drinkingAllowed: false,
          visitorAllowed: false,
        },
        depositAmount: "",
        maintenanceCharges: "",
        availableFrom: "",
        minimumStay: "",
        availableImmediately: false,
        noticePeriod: "",
        leaseDuration: "",
        rentNegotiable: false,
        sharingType: "NONE",
        foodDetails: {
          vegFood: false,
          nonVegFood: false,
          breakfastIncluded: false,
          lunchIncluded: false,
          dinnerIncluded: false,
        },
        electricityIncluded: false,
        waterIncluded: false,
        extraCharges: "",
        securityFeatures: [],
        nearbyEssentials: [],
        facing: "NONE",
        parkingType: "NONE",
        workFriendly: false,
        highSpeedInternet: false,
        couplesAllowed: false,
        studentsAllowed: false,
        workingProfessionalsAllowed: false,
        propertyAge: "UNKNOWN",
        balconyView: "NONE",
        ownerInstructions: "",
      });

      setSelectedImages([]);
      setPreviewUrls([]);

      setTimeout(() => {
        navigate("/my-properties");
      }, 800);
    } catch (err) {
      console.log("Add Property Error:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Error adding property");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const amenitiesOptions = [
    "WiFi",
    "Parking",
    "Power Backup",
    "Lift",
    "CCTV",
    "RO Water",
    "Geyser",
    "Laundry",
    "Gym",
    "Mess/Food Available",
    "Pet Friendly",
  ];

  const securityFeatureOptions = [
    "Security Guard",
    "Biometric Entry",
    "Gated Society",
    "Fire Safety",
  ];

  const nearbyEssentialOptions = [
    "Metro Nearby",
    "Bus Stop Nearby",
    "Hospital Nearby",
    "College Nearby",
    "Market Nearby",
  ];

  const handleArrayToggle = (field, value) => {
    setFormData((prev) => {
      const alreadyExists = prev[field].includes(value);

      return {
        ...prev,
        [field]: alreadyExists
          ? prev[field].filter((item) => item !== value)
          : [...prev[field], value],
      };
    });
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => {
      const alreadyExists = prev.amenities.includes(amenity);

      return {
        ...prev,
        amenities: alreadyExists
          ? prev.amenities.filter((item) => item !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  return (
    <div className="add-property-page">
      <section className="add-property-hero">
        <button
          className="back-link-btn"
          onClick={() => navigate("/my-properties")}
        >
          ← Back to My Properties
        </button>

        <span className="hero-badge">Create Listing</span>
        <h1>Add a New Property</h1>
        <p>
          Share accurate property details, upload clear images, and make your
          listing attractive for renters and buyers.
        </p>
      </section>

      <form className="add-property-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="section-title">
            <span>01</span>
            <div>
              <h3>Basic Info</h3>
              <p>Start with title, type, listing purpose, and description.</p>
            </div>
          </div>

          <input
            name="propertyTitle"
            placeholder="Property Title"
            value={formData.propertyTitle}
            onChange={handleChange}
            required
          />

          <div className="form-grid">
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
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
            required
          />
        </div>

        <div className="form-section">
          <div className="section-title">
            <span>02</span>
            <div>
              <h3>Location</h3>
              <p>
                Add complete address so users can understand the area easily.
              </p>
            </div>
          </div>

          <input
            name="fullAddress"
            placeholder="Full Address"
            value={formData.fullAddress}
            onChange={handleChange}
            required
          />

          <div className="form-grid">
            <input
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />

            <input
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              required
            />

            <input
              name="pinCode"
              placeholder="Pin Code"
              value={formData.pinCode}
              onChange={handleChange}
            />

            <input
              name="nearbyLandmark"
              placeholder="Nearby Landmark"
              value={formData.nearbyLandmark}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span>03</span>
            <div>
              <h3>Property Details</h3>
              <p>
                Mention BHK, area, furnishing, floors, and bathroom details.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <input
              name="bhk"
              placeholder="BHK"
              value={formData.bhk}
              onChange={handleChange}
              required
            />

            <input
              name="floor"
              placeholder="Floor"
              value={formData.floor}
              onChange={handleChange}
            />

            <input
              name="totalFloors"
              placeholder="Total Floors"
              value={formData.totalFloors}
              onChange={handleChange}
            />

            <input
              name="area"
              placeholder="Area (sqft)"
              value={formData.area}
              onChange={handleChange}
              required
            />

            <select
              name="furnishing"
              value={formData.furnishing}
              onChange={handleChange}
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
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span>04</span>
            <div>
              <h3>Pricing & Contact</h3>
              <p>Add price and contact number for interested users.</p>
            </div>
          </div>

          <div className="form-grid">
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              placeholder="Owner Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span>05</span>

            <div>
              <h3>Room Features & Amenities</h3>

              <p>
                Add modern facilities and tenant preferences for better
                visibility.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <select
              value={formData.roomFeatures.acType}
              onChange={(e) =>
                handleNestedChange("roomFeatures", "acType", e.target.value)
              }
            >
              <option value="NON_AC">Non AC</option>
              <option value="AC">AC</option>
            </select>

            <select
              name="tenantPreference"
              value={formData.tenantPreference}
              onChange={handleChange}
            >
              <option value="ANYONE">Anyone</option>
              <option value="BOYS">Boys</option>
              <option value="GIRLS">Girls</option>
              <option value="FAMILY">Family</option>
            </select>

            <input
              type="number"
              name="depositAmount"
              placeholder="Deposit Amount"
              value={formData.depositAmount}
              onChange={handleChange}
            />

            <input
              type="number"
              name="maintenanceCharges"
              placeholder="Maintenance Charges"
              value={formData.maintenanceCharges}
              onChange={handleChange}
            />

            <input
              type="date"
              name="availableFrom"
              value={formData.availableFrom}
              onChange={handleChange}
            />

            <input
              name="minimumStay"
              placeholder="Minimum Stay (Example: 3 Months)"
              value={formData.minimumStay}
              onChange={handleChange}
            />
          </div>

          <div className="checkbox-grid">
            <label>
              <input
                type="checkbox"
                checked={formData.roomFeatures.attachedBathroom}
                onChange={(e) =>
                  handleNestedChange(
                    "roomFeatures",
                    "attachedBathroom",
                    e.target.checked,
                  )
                }
              />
              Attached Bathroom
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.roomFeatures.balcony}
                onChange={(e) =>
                  handleNestedChange(
                    "roomFeatures",
                    "balcony",
                    e.target.checked,
                  )
                }
              />
              Balcony
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.rules.smokingAllowed}
                onChange={(e) =>
                  handleNestedChange(
                    "rules",
                    "smokingAllowed",
                    e.target.checked,
                  )
                }
              />
              Smoking Allowed
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.rules.drinkingAllowed}
                onChange={(e) =>
                  handleNestedChange(
                    "rules",
                    "drinkingAllowed",
                    e.target.checked,
                  )
                }
              />
              Drinking Allowed
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.rules.visitorAllowed}
                onChange={(e) =>
                  handleNestedChange(
                    "rules",
                    "visitorAllowed",
                    e.target.checked,
                  )
                }
              />
              Visitor Allowed
            </label>
          </div>

          <div className="amenities-wrapper">
            <h4>Select Amenities</h4>

            <div className="amenities-grid">
              {amenitiesOptions.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  className={
                    formData.amenities.includes(amenity)
                      ? "amenity-btn active"
                      : "amenity-btn"
                  }
                  onClick={() => handleAmenityChange(amenity)}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span>06</span>
            <div>
              <h3>Rental Terms & Extra Details</h3>
              <p>
                Add availability, food, parking, security and nearby details.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <select
              name="sharingType"
              value={formData.sharingType}
              onChange={handleChange}
            >
              <option value="NONE">Sharing Type</option>
              <option value="PRIVATE">Private Room</option>
              <option value="DOUBLE">Double Sharing</option>
              <option value="TRIPLE">Triple Sharing</option>
              <option value="FOUR_PLUS">4+ Sharing</option>
            </select>

            <select
              name="facing"
              value={formData.facing}
              onChange={handleChange}
            >
              <option value="NONE">Facing</option>
              <option value="EAST">East</option>
              <option value="WEST">West</option>
              <option value="NORTH">North</option>
              <option value="SOUTH">South</option>
              <option value="NORTH_EAST">North East</option>
              <option value="NORTH_WEST">North West</option>
              <option value="SOUTH_EAST">South East</option>
              <option value="SOUTH_WEST">South West</option>
            </select>

            <select
              name="parkingType"
              value={formData.parkingType}
              onChange={handleChange}
            >
              <option value="NONE">No Parking</option>
              <option value="BIKE">Bike Parking</option>
              <option value="CAR">Car Parking</option>
              <option value="BOTH">Bike + Car Parking</option>
            </select>

            <select
              name="propertyAge"
              value={formData.propertyAge}
              onChange={handleChange}
            >
              <option value="UNKNOWN">Property Age</option>
              <option value="NEW">New</option>
              <option value="ONE_TO_THREE">1-3 Years</option>
              <option value="THREE_TO_FIVE">3-5 Years</option>
              <option value="FIVE_PLUS">5+ Years</option>
            </select>

            <select
              name="balconyView"
              value={formData.balconyView}
              onChange={handleChange}
            >
              <option value="NONE">Balcony View</option>
              <option value="GARDEN_VIEW">Garden View</option>
              <option value="CITY_VIEW">City View</option>
              <option value="ROAD_VIEW">Road View</option>
            </select>

            <input
              name="noticePeriod"
              placeholder="Notice Period"
              value={formData.noticePeriod}
              onChange={handleChange}
            />

            <input
              name="leaseDuration"
              placeholder="Lease Duration"
              value={formData.leaseDuration}
              onChange={handleChange}
            />

            <input
              type="number"
              name="extraCharges"
              placeholder="Extra Charges"
              value={formData.extraCharges}
              onChange={handleChange}
            />
          </div>

          <div className="checkbox-grid">
            {[
              ["availableImmediately", "Available Immediately"],
              ["rentNegotiable", "Rent Negotiable"],
              ["electricityIncluded", "Electricity Included"],
              ["waterIncluded", "Water Included"],
              ["workFriendly", "Work Friendly"],
              ["highSpeedInternet", "High Speed Internet"],
              ["couplesAllowed", "Couples Allowed"],
              ["studentsAllowed", "Students Allowed"],
              ["workingProfessionalsAllowed", "Working Professionals Allowed"],
            ].map(([field, label]) => (
              <label key={field}>
                <input
                  type="checkbox"
                  checked={formData[field]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field]: e.target.checked,
                    }))
                  }
                />
                {label}
              </label>
            ))}
          </div>

          <div className="checkbox-grid">
            {Object.entries({
              vegFood: "Veg Food",
              nonVegFood: "Non-Veg Food",
              breakfastIncluded: "Breakfast Included",
              lunchIncluded: "Lunch Included",
              dinnerIncluded: "Dinner Included",
            }).map(([field, label]) => (
              <label key={field}>
                <input
                  type="checkbox"
                  checked={formData.foodDetails[field]}
                  onChange={(e) =>
                    handleNestedChange("foodDetails", field, e.target.checked)
                  }
                />
                {label}
              </label>
            ))}
          </div>

          <div className="amenities-wrapper">
            <h4>Security Features</h4>
            <div className="amenities-grid">
              {securityFeatureOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    formData.securityFeatures.includes(item)
                      ? "amenity-btn active"
                      : "amenity-btn"
                  }
                  onClick={() => handleArrayToggle("securityFeatures", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="amenities-wrapper">
            <h4>Nearby Essentials</h4>
            <div className="amenities-grid">
              {nearbyEssentialOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    formData.nearbyEssentials.includes(item)
                      ? "amenity-btn active"
                      : "amenity-btn"
                  }
                  onClick={() => handleArrayToggle("nearbyEssentials", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <textarea
            name="ownerInstructions"
            placeholder="Owner Instructions / House Rules"
            value={formData.ownerInstructions}
            onChange={handleChange}
          />
        </div>

        <div className="form-section">
          <div className="section-title">
            <span>07</span>
            <div>
              <h3>Images</h3>
              <p>Upload up to 8 clear images. Each image must be below 5MB.</p>
            </div>
          </div>

          <label className="image-upload-box">
            <input
              type="file"
              name="images"
              accept=".jpg,.jpeg,.png,.webp"
              multiple
              onChange={handleImageChange}
            />
            <strong>Click to upload images</strong>
            <small>jpg, jpeg, png, webp only</small>
          </label>

          {previewUrls.length > 0 && (
            <div className="preview-grid">
              {previewUrls.map((url, index) => (
                <div key={index} className="preview-item">
                  <img src={url} alt="preview" />

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && (
          <p
            className={`form-message ${messageType === "error" ? "error" : "success"}`}
          >
            {message}
          </p>
        )}

        <button
          className="submit-property-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Add Property"}
        </button>
      </form>
    </div>
  );
}

export default AddProperty;

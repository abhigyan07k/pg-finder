import { useEffect, useState } from "react";
import "./admin.css";

function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchProperties = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/property/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error("Fetch properties error:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveProperty = async (id) => {
    await fetch(`http://localhost:8000/api/property/admin/approve/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchProperties();
  };

  const rejectProperty = async (id) => {
    const reason = prompt("Enter rejection reason:");

    await fetch(`http://localhost:8000/api/property/admin/reject/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    fetchProperties();
  };

  const deleteProperty = async (id) => {
    const confirmDelete = window.confirm("Delete this property?");

    if (!confirmDelete) return;

    await fetch(`http://localhost:8000/api/property/admin/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchProperties();
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading) {
    return <h2>Loading properties...</h2>;
  }

  return (
    <div>
      <h1>Property Approvals</h1>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Owner</th>
              <th>City</th>
              <th>Price</th>
              <th>Status</th>
              <th>Approval</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {properties.length === 0 ? (
              <tr>
                <td colSpan="8">No properties found</td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property._id}>
                  <td>
                    <img
                      src={property.images?.[0]}
                      alt={property.title}
                      className="admin-property-img"
                    />
                  </td>

                  <td>{property.title}</td>
                  <td>{property.owner?.name || "N/A"}</td>
                  <td>{property.city}</td>
                  <td>₹{property.price}</td>

                  <td>
                    <span
                      className={
                        property.isActive ? "status-active" : "status-inactive"
                      }
                    >
                      {property.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <span className="approval-badge">
                      {property.approvalStatus || "PENDING"}
                    </span>
                  </td>

                  <td>
                    <div className="admin-actions">
                      <button
                        className="approve-btn"
                        onClick={() => approveProperty(property._id)}
                      >
                        Approve
                      </button>

                      <button
                        className="reject-btn"
                        onClick={() => rejectProperty(property._id)}
                      >
                        Reject
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteProperty(property._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProperties;

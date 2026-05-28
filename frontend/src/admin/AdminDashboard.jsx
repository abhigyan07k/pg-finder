function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>

      <div style={{ marginTop: "20px", display: "flex", gap: "20px" }}>
        <div style={cardStyle}>
          <h3>Total Users</h3>
          <p>--</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Properties</h3>
          <p>--</p>
        </div>

        <div style={cardStyle}>
          <h3>Pending Approvals</h3>
          <p>--</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  width: "200px",
};

export default AdminDashboard;

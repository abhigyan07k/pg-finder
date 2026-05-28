import { Navigate } from "react-router-dom";

function RoleProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  //If Not Logged In
  if (!token) {
    return <Navigate to="/" replace />;
  }

  //Unauthorized Role
  if (!allowedRoles.includes(role)) {
    if (role === "ADMIN" || role === "SUB_ADMIN") {
      return <Navigate to="/dashboard" replace />;
    } else if (role === "USER") {
      return <Navigate to="/owner-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default RoleProtectedRoute;

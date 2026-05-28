import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles = [],
  allowedUserTypes = [],
}) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userType = localStorage.getItem("userType");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

// frontend/src/components/auth/RoleRoute.js
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";

const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Role-based route protection

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Checking authorization...</p>
      </div>
    );
  }

  // If not logged in, redirect to login with return path
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has at least one of the required roles
  const hasRequiredRole = Array.isArray(roles)
    ? roles.includes(user.role)
    : user.role === roles;

  // If user doesn't have the required role, redirect to home page
  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  // Allow access to the protected route
  return children;
};

export default RoleRoute;

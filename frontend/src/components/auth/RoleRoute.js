// frontend/src/components/auth/RoleRoute.js
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";

const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Add console logs to debug
  console.log("RoleRoute - Current user:", user);
  console.log("RoleRoute - Required roles:", roles);
  console.log("RoleRoute - Loading state:", loading);

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
    console.log("RoleRoute - No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has at least one of the required roles
  const hasRequiredRole = Array.isArray(roles)
    ? roles.includes(user.role)
    : user.role === roles;

  console.log("RoleRoute - User has required role:", hasRequiredRole);

  // If user doesn't have the required role, redirect to home page
  if (!hasRequiredRole) {
    console.log("RoleRoute - User missing required role, redirecting to home");
    return <Navigate to="/" replace />;
  }

  // Allow access to the protected route
  return children;
};

export default RoleRoute;

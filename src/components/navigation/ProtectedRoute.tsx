import { Navigate } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

/** Shows its children to signed-in users and sends everyone else to the login. */
const ProtectedRoute = ({ isAuthenticated, children }: ProtectedRouteProps) =>
  isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;

export default ProtectedRoute;

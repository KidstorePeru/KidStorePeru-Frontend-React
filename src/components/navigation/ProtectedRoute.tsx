import { Navigate, useLocation } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const ProtectedRoute = ({ isAuthenticated, children }: ProtectedRouteProps) => {

  const location = useLocation();

  if (!isAuthenticated) {
    const fallback = location.pathname === "/" ? "/gifts" : "/";

    // ✅ Don't redirect to the same route you're already on
    if (location.pathname !== fallback) {
      return <Navigate to={fallback} replace />;
    }

    // ✅ Otherwise render nothing to prevent looping
    return <div className="text-center text-gray-300 mt-10">Redirecting...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

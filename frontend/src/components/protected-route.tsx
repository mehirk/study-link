import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "@store/auth-store";

type ProtectedRouteProps = {
  children: ReactNode;
  requireAuth: boolean;
  redirectTo: string;
};

const ProtectedRoute = ({
  children,
  requireAuth,
  redirectTo,
}: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  // While loading, show nothing to prevent flashing
  if (isLoading) return null;

  // For auth-required routes: redirect to login if not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // For non-auth routes (like login): redirect to dashboard if already authenticated
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If all conditions pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;

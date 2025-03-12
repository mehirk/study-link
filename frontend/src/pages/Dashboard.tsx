import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // This will not render while redirecting
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] p-4">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-3xl font-bold text-center">Dashboard</h1>
        <p className="text-center">Welcome to your dashboard{user?.name ? `, ${user.name}` : ''}</p>
        {/* Add dashboard content here */}
      </div>
    </div>
  );
};

export default Dashboard; 
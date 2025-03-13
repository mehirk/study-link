import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Calendar } from "lucide-react";

const Profile = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/auth');
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
      <div className="max-w-md w-full space-y-8 p-8 border rounded-lg shadow-sm">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-center">
            {user?.name || "User Profile"}
          </h1>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email || "No email provided"}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Joined</p>
              <p className="text-sm text-muted-foreground">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString() 
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <h2 className="text-xl font-semibold">Account Settings</h2>
          <p className="text-sm text-muted-foreground">
            You can update your profile information and password from here.
            (Settings functionality coming soon)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
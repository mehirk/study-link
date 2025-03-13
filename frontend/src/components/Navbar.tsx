import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { LogOut, User, BookOpen, Home } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center w-full px-6 py-4 border-b">
      <Link to="/" className="text-xl font-bold">
        Study Link
      </Link>
      
      <div className="flex items-center gap-6">
        <Link to="/" className="hover:underline flex items-center gap-1">
          <Home className="h-4 w-4" />
          Home
        </Link>
        
        {isLoading ? (
          <span className="flex items-center gap-1 text-sm">
            <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-primary"></div>
            Loading...
          </span>
        ) : (
          <>
            {isAuthenticated ? (
              /* Authenticated user navigation */
              <>
                <Link to="/dashboard" className="hover:underline flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link to="/profile" className="hover:underline flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              /* Non-authenticated user navigation */
              <Link to="/auth" className="hover:underline">
                Sign In / Sign Up
              </Link>
            )}
          </>
        )}
        
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar; 
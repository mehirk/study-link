import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { LogOut, User, BookOpen, Home } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
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
          <span className="text-sm">Loading...</span>
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
              </>
            ) : (
              /* Non-authenticated user navigation */
              <Link to="/auth" className="hover:underline">
                Sign In / Sign Up
              </Link>
            )}
          </>
        )}
        
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
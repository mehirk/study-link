import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="flex justify-between items-center w-full px-6 py-4 border-b">
      <Link to="/" className="text-xl font-bold">
        Study Link
      </Link>
      
      <div className="flex items-center gap-6">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        {isAuthenticated && (
          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>
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
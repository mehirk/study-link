import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./ui/mode-toggle";
import { useAuth } from "../hooks/auth";
import { Button } from "./ui/button";
import { LogOut, User, BookOpen, Loader2 } from "lucide-react";
import { authClient } from "@lib/api-client";

const Navbar = () => {
  const {
    isAuthenticated,
    isLoading,
    setUser,
    setSessionToken,
    setIsAuthenticated,
  } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut();
    setUser(null);
    setSessionToken(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center w-full px-6 py-2 border-b">
      <Link to="/" className="text-xl font-bold">
        Study Link
      </Link>

      <div className="flex items-center gap-6">
        {isLoading ? (
          <span className="flex items-center gap-1 text-sm">
            <Loader2 className="animate-spin" />
          </span>
        ) : (
          <>
            {isAuthenticated && (
              /* Authenticated user navigation */
              <>
                <Link
                  to="/dashboard"
                  className="font-semibold text-sm flex items-center gap-1"
                >
                  <BookOpen className="h-4 w-4 font-semibold" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="font-semibold text-sm flex items-center gap-1"
                >
                  <User className="h-4 w-4 font-semibold" />
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
            )}
          </>
        )}

        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;

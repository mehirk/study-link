import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "@components/ui/mode-toggle";
import { Button } from "@components/ui/button";
import { LogOut, User, BookOpen } from "lucide-react";
import useAuthStore from "@store/auth-store";

const Navbar = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) return null;

  return (
    <nav className="flex justify-between items-center w-full px-6 py-2 border-b">
      <Link to="/" className="text-xl font-bold">
        Study Link
      </Link>

      <div className="flex items-center gap-6">
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
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;

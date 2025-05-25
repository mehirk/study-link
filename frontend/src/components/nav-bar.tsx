import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "@components/ui/mode-toggle";
import { Button } from "@components/ui/button";
import { LogOut, User, BookOpen, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
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
    <nav className="flex justify-between items-center w-full px-3 sm:px-6 py-1 sm:py-2 border-b">
      <Link to="/" className="text-xl font-bold">
        Study Link
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        {isAuthenticated && (
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

      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center gap-2">
        <ModeToggle />
        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="p-0 m-0">
              <Button variant="ghost" size="default">
                <Menu className="h-8 w-8" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <BookOpen className="mx-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mx-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mx-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

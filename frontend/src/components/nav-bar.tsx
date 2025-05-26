import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "@components/ui/mode-toggle";
import { Button } from "@components/ui/button";
import { LogOut, User, BookOpen, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
    <nav className="flex justify-between items-center w-full px-4 sm:px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <Link
        to="/"
        className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
      >
        Study Link
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2">
        <ModeToggle />
        {isAuthenticated && (
          <>
            <div className="flex items-center gap-1 mr-4">
              <Link
                to="/dashboard"
                className="group relative px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                Dashboard
                <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
              <Link
                to="/profile"
                className="group relative px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                Profile
                <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
            </div>
            <div className="h-6 w-px bg-border mr-3" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="ml-3 flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200 group"
            >
              <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              Logout
            </Button>
          </>
        )}
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

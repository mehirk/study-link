import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "@components/ui/mode-toggle";
import { Button } from "@components/ui/button";
import { LogOut, Menu } from "lucide-react";
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
      <div className="hidden lg:flex items-center gap-4">
        <ModeToggle />

        {/* External Links */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open("https://shahcodes.in", "_blank")}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            Developer
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.open(
                "https://github.com/shahbaz-athwal/study-link",
                "_blank"
              )
            }
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            Source Code
          </Button>
        </div>

        {isAuthenticated && (
          <>
            <div className="h-5 w-px bg-border" />

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                Profile
              </Button>
            </div>

            <div className="h-5 w-px bg-border" />

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200 group"
            >
              <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              Logout
            </Button>
          </>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="flex lg:hidden items-center gap-3">
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => window.open("https://shahcodes.in", "_blank")}
            >
              Developer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  "https://github.com/shahbaz-athwal/study-link",
                  "_blank"
                )
              }
            >
              Source Code
            </DropdownMenuItem>
            {isAuthenticated && (
              <>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;

import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center w-full px-6 py-4 border-b">
      <Link to="/" className="text-xl font-bold">
        Study Link
      </Link>
      
      <div className="flex items-center gap-6">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar; 
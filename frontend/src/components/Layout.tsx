import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@hooks/use-theme";
import Navbar from "@components/navbar";

const Layout = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Layout;

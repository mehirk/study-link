import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./pages/layout";
import Auth from "./pages/auth.page";
import Dashboard from "./pages/dashboard.page";
import NotFound from "./pages/not-found.page";
import Profile from "./pages/profile.page";
import ProtectedRoute from "./components/protected-route";
import { Toaster } from "@components/ui/toaster";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Layout wrapper for all pages */}
        <Route path="/" element={<Layout />}>
          {/* Public route, redirect to dashboard if already logged in */}
          <Route
            index
            element={
              <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
                <Auth />
              </ProtectedRoute>
            }
          />

          {/* Profile page - requires auth */}
          <Route
            path="profile"
            element={
              <ProtectedRoute requireAuth={true} redirectTo="/">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Dashboard - requires auth */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requireAuth={true} redirectTo="/">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@components/Layout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "@components/ui/toaster";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Layout wrapper for all pages */}
          <Route path="/" element={<Layout />}>
            {/* Public route, redirect to dashboard if already logged in */}
            <Route
              index
              element={
                <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Auth route, redirect to dashboard if already logged in */}
            <Route
              path="auth"
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
                <ProtectedRoute requireAuth={true} redirectTo="/auth">
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Dashboard - requires auth */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute requireAuth={true} redirectTo="/auth">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;

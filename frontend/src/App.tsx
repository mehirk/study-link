import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@components/Layout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Layout wrapper for home, auth, profile pages */}
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

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Dashboard has its own layout, no need for the Layout wrapper */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requireAuth={true} redirectTo="/auth">
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

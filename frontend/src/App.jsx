import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ⭐ IMPORT AUTH PROVIDER
import { AuthProvider } from "./context/AuthContext";

// Components & Pages
import Navbar from "./pages/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Hiring workflows
import HiringDashboard from "./pages/HiringDashboard.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import JobSubmission from "./pages/JobSubmission.jsx";

// OAuth Success
import OAuthSuccess from "./pages/OAuthSuccess.jsx";

// Preloader
import QuantumPreloader from "./pages/preloader.jsx";

export default function App() {

  const shouldShowLoader = window.location.pathname === "/";
  const [loading, setLoading] = useState(shouldShowLoader);

  return (
    <>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #02020a;
          color: white;
          overflow-x: hidden;
        }

        .main-content {
          opacity: 0;
          animation: fadeInContent 1.2s ease-out forwards;
        }

        @keyframes fadeInContent {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {loading ? (
        <QuantumPreloader onFinish={() => setLoading(false)} />
      ) : (

        // ⭐⭐⭐ THIS IS THE MOST IMPORTANT FIX ⭐⭐⭐
        <AuthProvider>
          <div className="main-content">
            <Router>

              <Navbar />

              <Routes>

                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* OAuth Success */}
                <Route path="/oauth-success" element={<OAuthSuccess />} />

                {/* Protected Routes */}
                <Route
                  path="/hiring"
                  element={
                    <ProtectedRoute>
                      <HiringDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/hiring/job/:jobId"
                  element={
                    <ProtectedRoute>
                      <JobDetails />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/hiring/create"
                  element={
                    <ProtectedRoute>
                      <JobSubmission />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/jobs/new"
                  element={
                    <ProtectedRoute>
                      <JobSubmission />
                    </ProtectedRoute>
                  }
                />

              </Routes>

            </Router>
          </div>
        </AuthProvider>
      )}
    </>
  );
}

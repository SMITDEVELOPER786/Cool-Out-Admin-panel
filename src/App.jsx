import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase"; // Make sure to create this firebase config file
import Sidebar from "./components/Sidebar";

// Pages
import Dashboard from "./pages/Dashboard";
import GetAllUsers from "./pages/GetAllUsers";
import UserDetails from "./pages/UserDetails";
import GetAllPosts from "./pages/GetAllPosts";
import PostDetails from "./pages/PostDetails";
import Questions from "./pages/QnA";
import AddVideo from "./pages/AddVideo";
import AddAudio from "./pages/AddAudio";
import AddLesson from "./pages/AddLesson";
import Activity from "./pages/Activity";
import Quotes from "./pages/Quotes";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import ViewSection from "./pages/ViewSection";
import UserPosts from "./pages/UserPosts";
import Reports from "./pages/reports"
import ViewMore from "./pages/ViewMore";

// Add this route to your existing routes
import AdminManagement from "./pages/Management";

// In your Routes component, add:


function AppWrapper() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUser(user);
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", user.email);
      } else {
        // User is signed out
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
      }
      setAuthChecked(true);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleLogin = async (user) => {
    setLoading(true);
    setTransitioning(true);
    
    // Firebase already handles the authentication, so we just show the transition
    setTimeout(() => {
      setTransitioning(false);
      setLoading(false);
    }, 2000);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      // The onAuthStateChanged listener will handle the state update
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication state
  if (!authChecked) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#9EC7C9",
          color: "white",
          fontFamily: "Poppins, sans-serif",
          textAlign: "center",
          animation: "fadeIn 0.5s ease",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "5px solid rgba(255,255,255,0.4)",
            borderTopColor: "#fff",
            animation: "spin 1.2s linear infinite",
            marginBottom: "25px",
          }}
        ></div>
        <h2 style={{ fontWeight: "500", fontSize: "22px", letterSpacing: "0.5px", color: "#fff" }}>
          Checking authentication...
        </h2>
        <p style={{ fontSize: "14px", opacity: 0.8, marginTop: "10px" }}>
          Please wait a moment
        </p>

        <style>
          {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
        </style>
      </div>
    );
  }

  // 🌈 Aesthetic transition loader
  if (transitioning) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#9EC7C9",
          color: "white",
          fontFamily: "Poppins, sans-serif",
          textAlign: "center",
          animation: "fadeIn 0.5s ease",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "5px solid rgba(255,255,255,0.4)",
            borderTopColor: "#fff",
            animation: "spin 1.2s linear infinite",
            marginBottom: "25px",
          }}
        ></div>
        <h2 style={{ fontWeight: "500", fontSize: "22px", letterSpacing: "0.5px", color: "#fff" }}>
          Loading your dashboard...
        </h2>
        <p style={{ fontSize: "14px", opacity: 0.8, marginTop: "10px" }}>
          Welcome back
        </p>

        <style>
          {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
        </style>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} loading={loading} />;
  }

  return (
    <div style={{ display: "flex", background: "#ffffffff", minHeight: "100vh" }}>
      <Sidebar onLogout={handleLogout} userEmail={user?.email} />
      <div style={{ flex: 1, padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<GetAllUsers />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/users/postUser/:userId" element={<UserPosts />} />
          <Route path="/posts" element={<GetAllPosts />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/add-video" element={<AddVideo />} />
          <Route path="/view-section/:id" element={<ViewSection />} />
          <Route path="/add-audio" element={<AddAudio />} />
          <Route path="/add-lesson" element={<AddLesson />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/" />} />
           <Route path="/users/ViewMore/:id" element={<ViewMore />} />
           <Route path="/management" element={<AdminManagement />} />
          
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
// src/pages/Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Adjust path as needed

export default function Logout({ onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Sign out from Firebase
        await signOut(auth);
        
        // Clear local storage
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        
        // Call parent logout handler if provided
        if (onLogout) {
          onLogout();
        }

        // Navigate to login page after successful logout
        setTimeout(() => {
          navigate("/", { replace: true }); // Changed from "/login" to "/" since Login is your main route
        }, 1500);

      } catch (error) {
        console.error("Logout error:", error);
        
        // Even if Firebase logout fails, clear local storage and redirect
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      }
    };

    performLogout();
  }, [navigate, onLogout]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#9EC7C9",
        color: "#fff",
        fontFamily: "Poppins, sans-serif",
        textAlign: "center",
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
        Logging you out...
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
        `}
      </style>
    </div>
  );
}
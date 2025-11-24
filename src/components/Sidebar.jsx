import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { 
  FaTachometerAlt, FaUserAlt, FaBookOpen, FaQuestionCircle, 
  FaVideo, FaHeadphones, FaChalkboardTeacher, FaBars, FaTimes,
  FaFeatherAlt, FaPuzzlePiece, FaSignOutAlt, FaFileAlt, FaCog
} from "react-icons/fa";

const Sidebar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const links = [
    { to: "/", icon: <FaTachometerAlt />, label: "Dashboard" },
    { to: "/users", icon: <FaUserAlt />, label: "Users" },
    { to: "/posts", icon: <FaBookOpen />, label: "Posts" },
    { to: "/quotes", icon: <FaFeatherAlt />, label: "Quotes" },
    { to: "/activity", icon: <FaPuzzlePiece />, label: "Activity" },
    { to: "/management", icon: <FaCog />, label: "Management" }, // ✅ Added Management page
    { to: "/questions", icon: <FaQuestionCircle />, label: "Questions" },
    { to: "/add-video", icon: <FaVideo />, label: "Add Video" },
    { to: "/add-audio", icon: <FaHeadphones />, label: "Add Audio" },
    { to: "/add-lesson", icon: <FaChalkboardTeacher />, label: "Add Lesson" },
    { to: "/reports", icon: <FaFileAlt />, label: "Reports" },
    { to: "/logout", icon: <FaSignOutAlt />, label: "Logout" },
  ];

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setOpen(!open)}
          style={{
            position: "fixed",
            top: "15px",
            left: "10px",
            zIndex: 150,
            background: open ? "#fff" : "#9EC7C9",
            color: open ? "#000" : "#fff",
            border: "none",
            padding: "6px",
            borderRadius: "5px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      )}

      <div
        style={{
          width: isMobile ? "220px" : "250px",
          height: "100vh",
          background: "linear-gradient(180deg, #9EC7C9, #15d3ddff)",
          color: "white",
          padding: "20px 10px",
          position: "fixed",
          left: isMobile ? (open ? "0" : "-220px") : "0",
          top: 0,
          transition: isMobile ? "left 0.3s ease" : "none",
          zIndex: 100,
          overflow: "hidden",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#fff" }}>
          Admin Panel
        </h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "black" : "white",
                background: isActive ? "white" : "transparent",
                padding: "6px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                justifyContent: "flex-start",
                fontSize: "14px",
              })}
              onClick={() => isMobile && setOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
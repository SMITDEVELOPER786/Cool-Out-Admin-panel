/**
 * Dashboard Component - Admin Overview
 * 
 * PURPOSE:
 * - Main admin dashboard displaying platform statistics and quick actions
 * - Shows both mock data (Users, Posts) and real-time Firebase data
 * - Provides navigation to various management sections
 * - Includes notification bell that navigates to reports page
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../style/Dashboard.module.css";
import {
  FaUsers,
  FaNewspaper,
  FaBook,
  FaVideo,
  FaMusic,
  FaQuoteRight,
  FaPlus,
  FaBell,
} from "react-icons/fa";
import DashboardChart from "../components/DashboardChart";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const Dashboard = () => {
  const navigate = useNavigate();

  // --- Mock + Real Counts ---
  const [usersCount] = useState(120);
  const [postsCount] = useState(80);
  const [quotesCount, setQuotesCount] = useState(0);
  const [videosCount, setVideosCount] = useState(0);
  const [audioCategoriesCount, setAudioCategoriesCount] = useState(0);
  const [affirmationsCount, setAffirmationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- Fetch Real Data ---
  useEffect(() => {
    const fetchRealCounts = async () => {
      try {
        setLoading(true);

        const quotesSnapshot = await getDocs(collection(db, "quotes"));
        setQuotesCount(quotesSnapshot.size);

        const videosSnapshot = await getDocs(collection(db, "videoLink"));
        setVideosCount(videosSnapshot.size);

        const audioCategoriesSnapshot = await getDocs(
          collection(db, "audioCategories")
        );
        setAudioCategoriesCount(audioCategoriesSnapshot.size);

        const affirmationsSnapshot = await getDocs(
          collection(db, "affirmations")
        );
        setAffirmationsCount(affirmationsSnapshot.size);
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealCounts();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
            fontSize: "18px",
            color: "#666",
            textAlign: "center",
            padding: "20px",
            marginTop: "50px",
          }}
        >
          Loading dashboard data...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* ---------- TOP HEADER WITH BELL ---------- */}
      <div className={styles.dashboardHeader}>
        <div>
          <h2 className={styles.dashboardTitle}>Admin Dashboard</h2>
          <p className={styles.dashboardSubtitle}>Overview of your platform</p>
        </div>

        {/* 🛎️ Notification Bell */}
        <div
          className={styles.bellContainer}
          onClick={() => navigate("/reports")}
          title="View Reports"
        >
          <FaBell className={styles.bellIcon} />
          {/* 🔴 Notification Dot (optional) */}
          <span className={styles.bellDot}></span>
        </div>
      </div>

      {/* ---------- STATS GRID ---------- */}
      <div className={styles.statsGrid}>
        <div
          className={styles.statCard}
          onClick={() => navigate("/users")}
          style={{ cursor: "pointer" }}
        >
          <FaUsers className={`${styles.statIcon} ${styles.users}`} />
          <h3>{usersCount}</h3>
          <p>Total Users</p>
        </div>

        <div
          className={styles.statCard}
          onClick={() => navigate("/posts")}
          style={{ cursor: "pointer" }}
        >
          <FaNewspaper className={`${styles.statIcon} ${styles.posts}`} />
          <h3>{postsCount}</h3>
          <p>Total Posts</p>
        </div>

        <div
          className={styles.statCard}
          onClick={() => navigate("/quotes")}
          style={{ cursor: "pointer" }}
        >
          <FaQuoteRight className={`${styles.statIcon} ${styles.quotes}`} />
          <h3>{quotesCount}</h3>
          <p>Affirmation Quotes</p>
        </div>

        <div
          className={styles.statCard}
          onClick={() => navigate("/add-video")}
          style={{ cursor: "pointer" }}
        >
          <FaVideo className={`${styles.statIcon} ${styles.videos}`} />
          <h3>{videosCount}</h3>
          <p>Video Links</p>
        </div>

        <div
          className={styles.statCard}
          onClick={() => navigate("/add-audio")}
          style={{ cursor: "pointer" }}
        >
          <FaMusic className={`${styles.statIcon} ${styles.audios}`} />
          <h3>{audioCategoriesCount}</h3>
          <p>Audio Categories</p>
        </div>

        <div
          className={styles.statCard}
          onClick={() => navigate("/add-lesson")}
          style={{ cursor: "pointer" }}
        >
          <FaBook className={`${styles.statIcon} ${styles.lessons}`} />
          <h3>{affirmationsCount}</h3>
          <p>Affirmations</p>
        </div>
      </div>

      {/* ---------- CHART ---------- */}
      <DashboardChart />

      {/* ---------- QUICK ACTIONS ---------- */}
      <div className={styles.dashboardBottom}>
        <h3>Quick Actions</h3>
        <div className={styles.quickActions}>
          <button className={styles.btn} onClick={() => navigate("/posts")}>
            <FaPlus /> Add Post
          </button>

          <button className={styles.btn} onClick={() => navigate("/add-video")}>
            <FaVideo /> Add Video
          </button>
          <button className={styles.btn} onClick={() => navigate("/add-audio")}>
            <FaMusic /> Add Audio Category
          </button>
          <button
            className={styles.btn}
            onClick={() => navigate("/add-lesson")}
          >
            <FaBook /> Add Affirmation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

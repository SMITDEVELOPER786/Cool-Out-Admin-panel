import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./UserDetails.css";
import { FaArrowLeft } from "react-icons/fa";
import defaultTeamData  from "../pages/GetAllUsers";

import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users] = useState(defaultTeamData);

  const user = users.find((u) => u.id === Number(id?.trim()));
  if (!user) return <p style={{ textAlign: "center" }}>User not found.</p>;

  const thisWeek = "week1";

  const mainColor = "#9EC7C9";

  // Chart Data
  const emojiData = {
    labels: user.emojis ? Object.keys(user.emojis) : [],
    datasets: [
      {
        data: user.emojis ? Object.values(user.emojis) : [],
        backgroundColor: [
          mainColor,
          "#b9d8da",
          "#a2c9ca",
          "#8cb9ba",
          "#c3dfe1",
          "#7daaad",
        ],
        borderColor: "#ffffff",
        borderWidth: 1,
      },
    ],
  };

  const moodData = {
    labels: user.moods?.[thisWeek] ? Object.keys(user.moods[thisWeek]) : [],
    datasets: [
      {
        label: "Mood Counts",
        data: user.moods?.[thisWeek] ? Object.values(user.moods[thisWeek]) : [],
        backgroundColor: mainColor,
        borderRadius: 6,
      },
    ],
  };

  const moodsArray = user.moods?.[thisWeek]
    ? Object.entries(user.moods[thisWeek])
    : [];
  const topMood =
    moodsArray.length > 0
      ? moodsArray.reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev), moodsArray[0])[0]
      : "N/A";

  return (
    <div className="user-container">
      {/* Back Button */}
      <button className="backbtn" onClick={() => navigate("/users")}>
        <FaArrowLeft style={{ marginRight: "8px" }} />
        Back
      </button>

      <h1 className="user-title">User Details & Analytics</h1>

      <div className="user-profile">
        <img src={user.avatar} alt={user.name} className="user-avatar" />
        <div className="user-info">
          <h2>{user.name}</h2>
          <p className="user-gender">{user.gender}</p>
        </div>
      </div>

      <div className="charts-wrapper">
        <div className="chart-box" style={{ height: "240px", width: "100%" }}>
          <h4>Emoji Usage</h4>
          <Pie
            data={emojiData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: "#334155" } } },
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div className="chart-box" style={{ height: "240px", width: "100%" }}>
          <h4>This Week Mood</h4>
          <Bar
            data={moodData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: "#475569" }, grid: { display: false } },
                y: { ticks: { color: "#475569" }, grid: { color: "#e2e8f0" } },
              },
            }}
            style={{ width: "100%", height: "100%" }}
          />
          <p className="top-mood">Top Mood: {topMood}</p>
        </div>
      </div>

      <div className="activity-section">
        <h3>Activity (minutes spent)</h3>
        {user.activity &&
          Object.entries(user.activity).map(([act, mins]) => (
            <div key={act} className="activity-row">
              <span className="activity-name">{act}:</span>
              <span className="activity-mins">{mins} min</span>
              <div className="activity-bar-bg">
                <div
                  className="activity-bar-fill"
                  style={{
                    width: `${Math.min((mins / 300) * 100, 100)}%`,
                    backgroundColor: mainColor,
                  }}
                ></div>
              </div>
            </div>
          ))}
      </div>

      <div className="action-plan-section">
        <h3>Action Plan Completed</h3>
        <div className="action-plan-buttons">
          {user.actionPlan &&
            Object.entries(user.actionPlan).map(([action, completed]) => (
              <div
                key={action}
                className={`action-btn ${completed ? "completed" : "not-completed"}`}
                style={{
                  backgroundColor: completed ? mainColor : "#e2e8f0",
                  color: completed ? "#fff" : "#475569",
                }}
              >
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </div>
            ))}
        </div>
      </div>

      <div className="journal-section">
        <h3>Journals</h3>
        {user.journals && user.journals.length > 0 ? (
          <div className="journal-list">
            {user.journals.map((entry, index) => (
              <div key={index} className="journal-entry">
                <div className="journal-date">{entry.date}</div>
                <div className="journal-emoji">{entry.emoji}</div>
                <div className="journal-content">{entry.content}</div>
              </div>
            ))}
          </div>
        ) : (
          <p>No journal entries found.</p>
        )}
      </div>
    </div>
  );
};

export default UserDetails;

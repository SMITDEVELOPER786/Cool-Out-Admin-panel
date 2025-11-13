"use client";

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ViewMore.css";

const ViewMore = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get userId from location state
  const userId = location.state?.user?.id;

  useEffect(() => {
    const fetchUserAssessments = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "userAssessments"),
          where("userId", "==", userId)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          // Usually one document per user
          const userDoc = snapshot.docs[0].data();
          setAssessments(userDoc.answers || []);
        } else {
          setAssessments([]);
        }
      } catch (error) {
        console.error("Error fetching user assessments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAssessments();
  }, [userId]);

  if (loading) {
    return (
      <div className="viewmore-loader">
        <Loader2 className="animate-spin" size={30} />
        <p>Loading user assessments...</p>
      </div>
    );
  }

  return (
    <div className="viewmore-container">
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          color: "black",
          gap: "6px",
        }}
      >
        <ArrowLeft size={16} /> Back to Users
      </button>

      <h1 className="viewmore-title">
        {location.state?.user?.username || "User"} - Assessment Answers
      </h1>

      {assessments.length === 0 ? (
        <p className="viewmore-empty">No assessments found for this user.</p>
      ) : (
        <div className="viewmore-list">
          {assessments.map((a, index) => (
            <div key={index} className="viewmore-card">
              <h3 className="question">
                {index + 1}. {a.question}
              </h3>
              <p>
                <b>Answer:</b>{" "}
                {Array.isArray(a.answer) ? a.answer.join(", ") : a.answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewMore;

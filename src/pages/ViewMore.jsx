"use client";

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import "./ViewMore.css";

const ViewMore = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const qList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setQuestions(qList);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="viewmore-loader">
        <Loader2 className="animate-spin" size={30} />
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="viewmore-container">
      <h1 className="viewmore-title">User Assessment Answers</h1>

      {questions.length === 0 ? (
        <p className="viewmore-empty">No questions available.</p>
      ) : (
        <div className="viewmore-list">
          {questions.map((q, index) => (
            <div key={q.id} className="viewmore-card">
              <h3 className="question">
                {index + 1}. {q.question}
              </h3>
              <ul className="options">
                {q.options.map((opt, i) => {
                  // Mock answer logic: assume first option is "selected"
                  const isSelected = i === 0; // mock data
                  return (
                    <li
                      key={i}
                      className={`option ${isSelected ? "selected" : ""}`}
                    >
                      <input
                        type={q.multiple ? "checkbox" : "radio"}
                        name={`question-${q.id}`}
                        checked={isSelected}
                        readOnly
                      />
                      <span>{opt}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewMore;

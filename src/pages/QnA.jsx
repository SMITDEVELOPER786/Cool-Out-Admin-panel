import React, { useState, useEffect } from "react";
import { PlusCircle, Save } from "lucide-react";
import { FaTrash } from "react-icons/fa";
import "./Qna.css";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const QnA = () => {
  const [questions, setQuestions] = useState([
    { question: "", options: [""], multiple: false },
  ]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [message, setMessage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const questionsRef = collection(db, "questions");

  // 🔹 Fetch questions (newest first)
  const fetchQuestions = async () => {
    try {
      const q = query(questionsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const qList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedQuestions(qList);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // 🔹 Save question to Firestore
  const saveQuestion = async (i) => {
    const q = questions[i];
    const filteredOptions = q.options.filter((opt) => opt.trim() !== "");

    if (!q.question.trim()) {
      setMessage({ type: "error", text: "Please enter a question before saving." });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (filteredOptions.length === 0) {
      setMessage({ type: "error", text: "Please add at least one option before saving." });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      const docRef = await addDoc(questionsRef, {
        ...q,
        options: filteredOptions,
        createdAt: serverTimestamp(), // ✅ add timestamp
      });

      setMessage({ type: "success", text: "Question saved successfully!" });

      const newQuestion = {
        id: docRef.id,
        ...q,
        options: filteredOptions,
        createdAt: new Date(),
      };

      // Show new question instantly at top
      setSavedQuestions((prev) => [newQuestion, ...prev]);

      // Reset input form
      const updated = [...questions];
      updated[i] = { question: "", options: [""], multiple: false };
      setQuestions(updated);
    } catch (error) {
      console.error("Error adding question:", error);
      setMessage({ type: "error", text: "Failed to save question." });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  // 🔹 Delete question
  const confirmDeleteQuestion = async () => {
    if (confirmDelete !== null) {
      const questionId = savedQuestions[confirmDelete].id;
      try {
        await deleteDoc(doc(db, "questions", questionId));
        setMessage({ type: "success", text: "Question deleted successfully!" });
        setSavedQuestions((prev) => prev.filter((_, i) => i !== confirmDelete));
      } catch (error) {
        console.error("Error deleting question:", error);
        setMessage({ type: "error", text: "Failed to delete question." });
      }
      setConfirmDelete(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // 🔹 Handlers
  const handleQuestionChange = (i, value) => {
    const updated = [...questions];
    updated[i].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleMultipleChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].multiple = value === "multiple";
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  const deleteOption = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  const handleDeleteClick = (index) => {
    setConfirmDelete(index);
  };

  return (
    <div className="qna-container">
      <h1 className="qna-title">Add Assessment Questions</h1>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="qna-card">
          <div className="qna-header">
            <input
              type="text"
              className="qna-input"
              placeholder={`Question ${qIndex + 1}`}
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
            />
          </div>

          <div className="qna-multiple-select" style={{ border: "none" }}>
            <label>Answer Type:</label>
            <select
              className="qna-select"
              value={q.multiple ? "multiple" : "single"}
              onChange={(e) => handleMultipleChange(qIndex, e.target.value)}
            >
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
            </select>
          </div>

          {q.options.map((opt, oIndex) => (
            <div key={oIndex} className="qna-option">
              <input
                type="text"
                className="qna-input"
                placeholder={`Option ${oIndex + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
              />
              <button className="btn-delete" onClick={() => deleteOption(qIndex, oIndex)}>
                <FaTrash size={18} />
              </button>
            </div>
          ))}

          <div className="qna-actions">
            <button className="btn-add" onClick={() => addOption(qIndex)}>
              <PlusCircle size={18} /> Add Option
            </button>
            <button className="btn-save" onClick={() => saveQuestion(qIndex)}>
              <Save size={18} /> Save Question
            </button>
          </div>

          {message && <div className={`inline-message ${message.type}`}>{message.text}</div>}
        </div>
      ))}

      {confirmDelete !== null && (
        <div className="modal-backdrop">
          <div className="modal-box small">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this question?</p>
            <div className="modal-actions">
              <button onClick={confirmDeleteQuestion} className="savebtn1">
                Yes, Delete
              </button>
              <button onClick={() => setConfirmDelete(null)} className="savebtn2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="saved-questions">
        <h2 className="qna-title">Saved Questions</h2>
        {savedQuestions.length === 0 ? (
          <p className="no-data">No saved questions yet.</p>
        ) : (
          <ul className="saved-list">
            {savedQuestions.map((q, qIndex) => (
              <li key={q.id || qIndex} className="saved-item">
                <div className="saved-header">
                  <strong>
                    {qIndex + 1}. {q.question}
                  </strong>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteClick(qIndex)}
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
                <ul>
                  {q.options.map((opt, oIndex) => (
                    <li key={oIndex} className="saved-option">
                      <input
                        type={q.multiple ? "checkbox" : "radio"}
                        name={`saved-${q.id}`}
                      />
                      {opt}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default QnA;
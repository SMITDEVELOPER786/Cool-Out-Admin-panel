import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import "../pages/Quotes.css";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const moods = [
  "Happy", "Sad", "Confident", "Depressed", "Motivated", "Anxious",
  "Hopeful", "Lonely", "Inspired", "Empowered", "Overwhelmed",
  "Frustrated", "Restless", "Optimistic", "Irritable", "Fulfilled",
  "Hopeless", "Calm", "Exhausted",
];

const Features = () => {
  const [selectedMood, setSelectedMood] = useState("");
  const [quote, setQuote] = useState("");
  const [allQuotes, setAllQuotes] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ✅ Fetch quotes from Firestore - SIMPLE AND RELIABLE
  const fetchQuotes = async () => {
    try {
      console.log("Fetching quotes from Firestore...");
      const snapshot = await getDocs(collection(db, "quotes"));
      const quotesList = [];
      
      snapshot.forEach((docItem) => {
        const data = docItem.data();
        console.log("Found quote:", data);
        
        // Check if quote has required fields
        if (data.mood && data.text) {
          quotesList.push({ 
            id: docItem.id, 
            mood: data.mood, 
            text: data.text,
            // For old quotes without createdAt, we'll use document ID as fallback
            sortKey: data.createdAt || docItem.id
          });
        }
      });
      
      console.log("Total quotes found:", quotesList.length);
      
      // Sort quotes to ensure consistent order
      // New quotes with createdAt will come first, then old quotes by document ID
      const sortedQuotes = quotesList.sort((a, b) => {
        // If both have createdAt, sort by date (newest first)
        if (a.sortKey && b.sortKey && a.sortKey.seconds && b.sortKey.seconds) {
          return b.sortKey.seconds - a.sortKey.seconds;
        }
        // Otherwise sort by document ID (this gives some consistency)
        return b.id.localeCompare(a.id);
      });
      
      setAllQuotes(sortedQuotes);
      
    } catch (error) {
      console.error("Error fetching quotes:", error);
      setErrorMsg("Failed to load quotes");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // ✅ Add quote to Firestore
  const handleAddQuote = async () => {
    if (!selectedMood || !quote.trim()) {
      setErrorMsg("Please select a mood and enter a quote!");
      setTimeout(() => setErrorMsg(""), 2000);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "quotes"), {
        mood: selectedMood,
        text: quote.trim(),
        createdAt: new Date() // Add timestamp for new quotes
      });

      console.log("Quote added with ID:", docRef.id);

      // 🔥 Add newly added quote at top
      setAllQuotes((prev) => [
        { 
          id: docRef.id, 
          mood: selectedMood, 
          text: quote.trim(),
          sortKey: new Date() // Add sort key for local sorting
        },
        ...prev,
      ]);

      setQuote("");
      setSelectedMood("");
      setErrorMsg("");
      setSuccessMsg("Quote added successfully!");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (error) {
      console.error("Error adding quote:", error);
      setErrorMsg("Failed to add quote!");
      setTimeout(() => setErrorMsg(""), 2000);
    }
  };

  // 🗑️ Delete confirmation
  const handleDeleteClick = (quoteObj) => {
    setConfirmDelete(quoteObj);
  };

  // ✅ Delete quote from Firestore
  const confirmDeleteQuote = async () => {
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "quotes", confirmDelete.id));
        setAllQuotes((prev) => prev.filter((q) => q.id !== confirmDelete.id));
        setConfirmDelete(null);
        setSuccessMsg("Quote deleted successfully!");
        setTimeout(() => setSuccessMsg(""), 2000);
      } catch (error) {
        console.error("Error deleting quote:", error);
        setErrorMsg("Failed to delete quote!");
        setTimeout(() => setErrorMsg(""), 2000);
      }
    }
  };

  return (
    <div className="features-page">
      <h2 style={{ color: "#9EC7C9" }}>Affirmation Quotes</h2>

      {/* ---------- Form Section ---------- */}
      <div className="form-section">
        <select
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value)}
        >
          <option value="">Select Mood</option>
          {moods.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Enter a quote..."
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
        />

        <button onClick={handleAddQuote}>Add Quote</button>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        {successMsg && <p className="success-msg">{successMsg}</p>}
      </div>

      {/* ---------- Delete Confirmation Modal ---------- */}
      {confirmDelete && (
        <div className="modal-backdrop">
          <div className="modal-box small">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this quote?</p>
            <div className="modal-actions">
              <button onClick={confirmDeleteQuote} className="savebtn1">
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="savebtn2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Saved Quotes ---------- */}
      <div className="quotes-list">
         <h2 className="qna-title">Saved Quotes</h2>
        {allQuotes.length === 0 ? (
          <p className="noDataText">No quotes yet. Add your first quote above!</p>
        ) : (
          <div className="admin-saved-grid">
            {allQuotes.map(({ id, mood, text }) => (
              <div key={id} className="admin-saved-card">
                <button
                  className="delete-top-left"
                  onClick={() => handleDeleteClick({ id, mood, text })}
                >
                  <FaTrash size={18} />
                </button>
                <div className="scrollable-quote">
                  <p className="admin-saved-text">{text}</p>
                </div>
                <p className="admin-saved-category">Mood: {mood}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Features;
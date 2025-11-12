import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import "./lessons.css";
import { FaTrash } from "react-icons/fa";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const categories = ["Self-Worth", "Mindfulness", "Strength", "All"];
const DEFAULT_CATEGORY = "";

const AdminAffirmations = () => {
  const [affirmations, setAffirmations] = useState([
    { text: "", category: DEFAULT_CATEGORY, error: "", success: "" },
  ]);

  const [savedAffirmations, setSavedAffirmations] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ✅ Fetch from Firestore - SIMPLE VERSION
  useEffect(() => {
    const fetchAffirmations = async () => {
      try {
        console.log("Fetching affirmations from Firestore...");
        const snapshot = await getDocs(collection(db, "affirmations"));
        const list = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Found affirmation:", data); // Debug log
          
          // Check if affirmation has required fields
          if (data.text && data.category) {
            list.push({
              id: doc.id,
              text: data.text,
              category: data.category,
              createdAt: data.createdAt || new Date() // Add fallback timestamp
            });
          }
        });
        
        console.log("Total affirmations found:", list.length); // Debug log
        
        // Sort by createdAt if available, otherwise by document ID for consistency
        const sortedList = list.sort((a, b) => {
          // Convert Firestore timestamp to Date if needed
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          
          // Sort by date (newest first), or by document ID as fallback
          return dateB - dateA || b.id.localeCompare(a.id);
        });
        
        setSavedAffirmations(sortedList);
        
      } catch (error) {
        console.error("Error fetching affirmations:", error);
        // Fallback: try without any sorting
        try {
          const snapshot = await getDocs(collection(db, "affirmations"));
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          // Simple reverse to show newest first
          setSavedAffirmations(list.reverse());
        } catch (fallbackError) {
          console.error("Fallback fetch also failed:", fallbackError);
        }
      }
    };
    fetchAffirmations();
  }, []);

  const handleTextChange = (index, value) => {
    const updated = [...affirmations];
    updated[index].text = value;
    updated[index].error = "";
    updated[index].success = "";
    setAffirmations(updated);
  };

  const handleCategoryChange = (index, value) => {
    const updated = [...affirmations];
    updated[index].category = value;
    updated[index].success = "";
    setAffirmations(updated);
  };

  // ✅ Save to Firestore with timestamp
  const saveAffirmation = async (index) => {
    const a = affirmations[index];
    if (!a.text.trim()) {
      const updated = [...affirmations];
      updated[index].error = "Please enter an affirmation before saving.";
      setAffirmations(updated);
      return;
    }

    if (!a.category) {
      const updated = [...affirmations];
      updated[index].error = "Please choose a category before saving.";
      setAffirmations(updated);
      return;
    }

    try {
      // Add timestamp when saving
      await addDoc(collection(db, "affirmations"), {
        text: a.text.trim(),
        category: a.category,
        createdAt: new Date(), // Add timestamp
      });

      // Refresh the list after saving
      const snapshot = await getDocs(collection(db, "affirmations"));
      const list = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.text && data.category) {
          list.push({
            id: doc.id,
            text: data.text,
            category: data.category,
            createdAt: data.createdAt || new Date()
          });
        }
      });
      
      // Sort the updated list
      const sortedList = list.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA || b.id.localeCompare(a.id);
      });
      
      setSavedAffirmations(sortedList);

      const updated = [...affirmations];
      updated[index] = {
        text: "",
        category: DEFAULT_CATEGORY,
        error: "",
        success: "Saved successfully!",
      };
      setAffirmations(updated);

      setTimeout(() => {
        const temp = [...updated];
        temp[index].success = "";
        setAffirmations(temp);
      }, 2000);
    } catch (error) {
      console.error("Error saving affirmation:", error);
      const updated = [...affirmations];
      updated[index].error = "Error saving affirmation. Please try again.";
      setAffirmations(updated);
    }
  };

  // 🗑️ Delete from Firestore
  const confirmDeleteAffirmation = async () => {
    if (confirmDelete !== null) {
      try {
        const id = savedAffirmations[confirmDelete].id;
        await deleteDoc(doc(db, "affirmations", id));
        
        // Remove from local state without refetching
        const updated = savedAffirmations.filter((_, i) => i !== confirmDelete);
        setSavedAffirmations(updated);
        setConfirmDelete(null);
      } catch (error) {
        console.error("Error deleting affirmation:", error);
      }
    }
  };

  return (
    <div className="admin-affirmations-container">
      <h1 className="admin-affirmations-title">Add Affirmations</h1>

      {affirmations.map((a, index) => (
        <div key={index} className="admin-affirmation-card">
          <div className="admin-affirmation-box">
            <div className="admin-affirmation-header">
              <textarea
                className="admin-affirmation-input"
                placeholder="Add Affirmation"
                value={a.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
              />
            </div>

            {a.error && <p className="admin-error-text">{a.error}</p>}
            {a.success && <p className="admin-success-text">{a.success}</p>}

            <div className="admin-affirmation-select">
              <label>Category:</label>
              <select
                value={a.category}
                onChange={(e) => handleCategoryChange(index, e.target.value)}
              >
                <option value="" disabled hidden>
                  Choose Category
                </option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-option-buttons">
              <button
                className="admin-save-btn"
                onClick={() => saveAffirmation(index)}
              >
                <Save size={18} /> Save
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {confirmDelete !== null && (
        <div className="modal-backdrop">
          <div className="modal-box small">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this affirmation?</p>
            <div className="modal-actions">
              <button onClick={confirmDeleteAffirmation} className="savebtn1">
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

      {/* Saved Affirmations */}
      <div className="admin-saved-questions">
        <h2 className="admin-affirmations-title1">Saved Affirmations</h2>

        {savedAffirmations.length === 0 ? (
          <p className="admin-empty-text">No saved affirmations yet.</p>
        ) : (
          <div className="admin-saved-grid">
            {savedAffirmations.map((a, index) => (
              <div key={a.id || index} className="admin-saved-card">
                <div className="scrollable-quote">
                  <h3 className="admin-saved-text">{a.text}</h3>
                </div>
                <p className="admin-saved-category">Category: {a.category}</p>

                <button
                  className="admin-small-delete-btn"
                  onClick={() => setConfirmDelete(index)}
                >
                  <FaTrash size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAffirmations;
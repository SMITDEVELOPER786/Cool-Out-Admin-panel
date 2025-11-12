import React, { useState, useRef, useEffect } from "react";
import "./AudioPage.css";
import { FaPlay, FaPause, FaUpload, FaPlus, FaTrash } from "react-icons/fa";
import { CLOUDINARY } from "../CloudinaryConfig";
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";

// 🎧 Single Audio Row Component
const AudioRow = ({ track, currentAudioRef, setCurrentAudioRef }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;

    // ⏸ Pause any other audio
    if (currentAudioRef && currentAudioRef !== audioRef.current) {
      currentAudioRef.pause();
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .then(() => setCurrentAudioRef(audioRef.current))
        .catch((err) => console.error("Play failed:", err));
    }

    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration || 0;
    setProgress(dur ? (audioRef.current.currentTime / dur) * 100 : 0);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  useEffect(() => {
    if (currentAudioRef && currentAudioRef !== audioRef.current) {
      setIsPlaying(false);
    }
  }, [currentAudioRef]);

  return (
    <div className="audio-row">
      <button className="play-btn" onClick={togglePlay}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      <span className="track-name">{track.name}</span>
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <audio
        ref={audioRef}
        src={track.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  );
};

// 🎵 Main Page
const AudioPage = () => {
  const [categories, setCategories] = useState({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [uploadStatus, setUploadStatus] = useState({});
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [message, setMessage] = useState(null);
  const [currentAudioRef, setCurrentAudioRef] = useState(null);

  // 🔥 Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "audioCategories"));
        const data = {};
        const status = {};

        snapshot.forEach((docSnap) => {
          const catData = docSnap.data();
          data[docSnap.id] = catData.tracks || [];
          status[docSnap.id] = (catData.tracks?.length || 0) > 0 ? "done" : "idle";
        });

        setCategories(data);
        setUploadStatus(status);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchCategories();
  }, []);

  // ➕ Add new category
  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setError("Category name cannot be empty");
      setTimeout(() => setError(""), 2000);
      return;
    }
    if (categories[name]) {
      setError("Category already exists");
      setTimeout(() => setError(""), 2000);
      return;
    }

    try {
      await setDoc(doc(db, "audioCategories", name), { 
        tracks: [],
      });
      
      // Add new category at the top
      setCategories((prev) => ({ [name]: [], ...prev }));
      setUploadStatus((prev) => ({ [name]: "idle", ...prev }));
      setNewCategoryName("");
      setMessage("Category added!");
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  // ☁️ Upload audio
  const handleFileUpload = async (category, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setError("Please upload an audio file");
      setTimeout(() => setError(""), 2000);
      e.target.value = "";
      return;
    }

    setUploadStatus((prev) => ({ ...prev, [category]: "uploading" }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY.UPLOAD_PRESET);

      const res = await fetch(CLOUDINARY.UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.secure_url) throw new Error("Cloudinary upload failed");

      const newTrack = {
        id: Date.now(),
        name: file.name,
        url: data.secure_url,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      const updatedTracks = [...(categories[category] || []), newTrack];
      
      await setDoc(doc(db, "audioCategories", category), { 
        tracks: updatedTracks,
      });

      // Update categories
      setCategories((prev) => ({ 
        ...prev, 
        [category]: updatedTracks 
      }));
      
      setUploadStatus((prev) => ({ ...prev, [category]: "done" }));
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus((prev) => ({ ...prev, [category]: "error" }));
      setError("Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  // 🗑️ Delete category
  const confirmDeleteCategory = async () => {
    try {
      await deleteDoc(doc(db, "audioCategories", confirmDelete));
      setCategories((prev) => {
        const updated = { ...prev };
        delete updated[confirmDelete];
        return updated;
      });
      setConfirmDelete(null);
      setMessage(" Category deleted!");
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  // 🗑️ Delete a track
  const handleDeleteTrack = async (category, trackId) => {
    const updatedTracks = (categories[category] || []).filter((t) => t.id !== trackId);
    
    await setDoc(doc(db, "audioCategories", category), { 
      tracks: updatedTracks,
    });

    // Update categories
    setCategories((prev) => ({ 
      ...prev, 
      [category]: updatedTracks 
    }));
  };

  // Convert categories to array and reverse for display (newest first)
  const reversedCategories = Object.keys(categories).reverse();

  return (
    <div className="audio-page-container">
      <h1 className="audio-page-title" style={{ color: "#9EC7C9" }}>
        Upload Audio
      </h1>

      {message && <div className="alert-message below-bar">{message}</div>}

      <div className="category-input">
        <input
          type="text"
          placeholder="New Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button className="add-category-btn" onClick={handleAddCategory}>
          <FaPlus /> Add Category
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {/* 🔥 NEW FEATURE: Show "No audio categories yet" message when empty */}
      {reversedCategories.length === 0 ? (
        <div className="no-categories-message">
          <p>No audio categories yet. Create your first category above!</p>
        </div>
      ) : (
        reversedCategories.map((category) => (
          <div key={category} className="category-box">
            <div className="category-header">
              <h2>{category}</h2>
              <div className="category-actions">
                <label className="upload-btn">
                  <FaUpload style={{ marginRight: "8px" }} />
                  {uploadStatus[category] === "done"
                    ? "Upload Again"
                    : uploadStatus[category] === "uploading"
                    ? "Uploading..."
                    : "Upload Audio"}
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileUpload(category, e)}
                    style={{ display: "none" }}
                  />
                </label>

                <button
                  className="delete-btn1"
                  onClick={() => setConfirmDelete(category)}
                >
                  <FaTrash /> Delete Category
                </button>
              </div>
            </div>

            {categories[category]?.length > 0 && (
              <div className="tracks-list">
                {categories[category].map((track) => (
                  <div key={track.id} className="track-row">
                    <AudioRow
                      track={track}
                      currentAudioRef={currentAudioRef}
                      setCurrentAudioRef={setCurrentAudioRef}
                    />
                    <div className="track-info">
                      <span className="file-size">
                        {(track.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      className="delete-track-btn"
                      onClick={() => handleDeleteTrack(category, track.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {confirmDelete && (
        <div className="modal-backdrop">
          <div className="modal-box small">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "{confirmDelete}" category?</p>
            <div className="modal-actions">
              <button onClick={confirmDeleteCategory} className="savebtn1">
                Yes, Delete
              </button>
              <button onClick={() => setConfirmDelete(null)} className="savebtn2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPage;
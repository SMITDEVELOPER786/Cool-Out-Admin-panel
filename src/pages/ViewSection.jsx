import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./ViewSection.css";
import { db } from "../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";

const CLOUDINARY_UPLOAD_PRESET = "your_unsigned_preset";
const CLOUDINARY_CLOUD_NAME = "your_cloud_name";

const ViewSection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [section, setSection] = useState(location.state?.section || null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const docRef = doc(db, "videoLink", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSection({ id: docSnap.id, ...docSnap.data() });
      }
    });
    return () => unsubscribe();
  }, [id]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleDelete = async (idx) => {
    const updatedVideos = section.videos.filter((_, i) => i !== idx);
    try {
      await updateDoc(doc(db, "videoLink", section.id), {
        videos: updatedVideos,
      });
      setSection({ ...section, videos: updatedVideos });
      showMessage("Video deleted ✅", "success");
    } catch (error) {
      showMessage("Error deleting video ❌", "error");
    }
  };

  const handleVideoUpload = async (file, idx) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      const updatedVideos = [...section.videos];
      updatedVideos[idx].link = data.secure_url;

      await updateDoc(doc(db, "videoLink", section.id), {
        videos: updatedVideos,
      });

      setSection({ ...section, videos: updatedVideos });
      showMessage("Video replaced ✅", "success");
    } catch (error) {
      showMessage("Upload failed ❌", "error");
    }
  };

  if (!section) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="view-section-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Back
      </button>

      <h2>
        {section.title} - <em>{section.type}</em>
      </h2>

      {message && (
        <div className={`message-box ${message.type}`}>{message.text}</div>
      )}

      <div className="videos-list">
        {section.videos.map((video, idx) => (
          <div key={idx} className="video-item">
            <h3>{video.title}</h3>

            <video
              controls
              src={video.link}
              style={{
                width: "100%",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            />

            {/* ✅ Custom Upload Button */}
            <label className="upload-btn">
              Replace Video
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleVideoUpload(e.target.files[0], idx)}
              />
            </label>

            <button
              className="delete-btn"
              onClick={() => handleDelete(idx)}
            >
              🗑 Delete Video
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewSection;

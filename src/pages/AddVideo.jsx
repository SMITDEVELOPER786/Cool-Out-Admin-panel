

import React, { useState, useEffect } from "react";
import "./AddVideo.css";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { CLOUDINARYAzeesha } from "../CloudinaryConfig";

const AddVideo = () => {
  const navigate = useNavigate();

  const [numYogaSections, setNumYogaSections] = useState(0);
  const [numRelaxSections, setNumRelaxSections] = useState(0);
  const [yogaSections, setYogaSections] = useState([]);
  const [relaxSections, setRelaxSections] = useState([]);
  const [savedSections, setSavedSections] = useState([]);
  const [modalData, setModalData] = useState({
    visible: false,
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "videoLink"));
        const sectionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSavedSections(sectionsData);
      } catch (error) {
        console.error("Error fetching videoLink sections:", error);
      }
    };
    fetchSections();
  }, []);

 const createSections = (count, type) => {
  if (count < 1) return;
  const newSections = Array.from({ length: count }, (_, i) => ({
    id: Date.now() + i,
    title: "",
    // Start with just 1 empty video instead of 4
    videos: [{ title: "", link: "" }],
  }));
  type === "yoga" ? setYogaSections(newSections) : setRelaxSections(newSections);
};
  const handleVideoChange = (type, sectionIndex, videoIndex, field, value) => {
    const setFunction = type === "yoga" ? setYogaSections : setRelaxSections;
    setFunction((prev) => {
      const updated = [...prev];
      updated[sectionIndex].videos[videoIndex] = {
        ...updated[sectionIndex].videos[videoIndex],
        [field]: value,
      };
      return updated;
    });
  };

  // ✅ ALERTS REMOVED — NO POPUP
  const handleVideoUpload = async (type, sectionIndex, videoIndex, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARYAzeesha.UPLOAD_PRESET);

    handleVideoChange(type, sectionIndex, videoIndex, "link", "uploading...");

    try {
      const response = await fetch(CLOUDINARYAzeesha.UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        handleVideoChange(type, sectionIndex, videoIndex, "link", data.secure_url);
      } else {
        handleVideoChange(type, sectionIndex, videoIndex, "link", "");
      }
    } catch (error) {
      console.error("Upload error:", error);
      handleVideoChange(type, sectionIndex, videoIndex, "link", "");
    }
  };
const handleAddVideo = (type, sectionIndex) => {
  const setFunction = type === "yoga" ? setYogaSections : setRelaxSections;
  setFunction((prev) => {
    const updated = [...prev];
   
    updated[sectionIndex].videos.push({ title: "", link: "" });
    return updated;
  });
};
  const handleDeleteVideo = (type, sectionIndex, videoIndex) => {
    const setFunction = type === "yoga" ? setYogaSections : setRelaxSections;
    setFunction((prev) => {
      const updated = [...prev];
      updated[sectionIndex].videos.splice(videoIndex, 1);
      return updated;
    });
  };

  const handleDeleteAll = (type) => {
    setModalData({
      visible: true,
      message: `Delete all ${type === "yoga" ? "Yoga / Meditation" : "Relaxing Video"} sections?`,
      onConfirm: () => {
        if (type === "yoga") {
          setYogaSections([]);
          setNumYogaSections(0);
        } else {
          setRelaxSections([]);
          setNumRelaxSections(0);
        }
        closeModal();
      },
    });
  };

  const handleDeleteSavedSection = (id) => {
    setModalData({
      visible: true,
      message: `Are you sure you want to delete this saved section?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "videoLink", id));
          setSavedSections((prev) => prev.filter((section) => section.id !== id));
          closeModal();
        } catch (error) {
          console.error("Error deleting videoLink section:", error);
        }
      },
    });
  };

  const closeModal = () => {
    setModalData({ visible: false, message: "", onConfirm: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const combinedSections = [
      ...yogaSections.map((sec) => ({ ...sec, type: "Yoga / Meditation" })),
      ...relaxSections.map((sec) => ({ ...sec, type: "Relaxing Videos" })),
    ];
    if (combinedSections.length === 0) return;

    try {
      for (const section of combinedSections) {
        const docRef = await addDoc(collection(db, "videoLink"), {
          title: section.title,
          type: section.type,
          videos: section.videos,
          createdAt: new Date(),
        });
        section.id = docRef.id;
      }

      setSavedSections((prev) => [...prev, ...combinedSections]);
      setYogaSections([]);
      setRelaxSections([]);
      setNumYogaSections(0);
      setNumRelaxSections(0);
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleViewSection = (section) => {
    navigate(`/view-section/${section.id}`, { state: { section } });
  };

  const renderSectionGroup = (type, title, sections, num, setNum) => (
    <div className="add-video-card">
      <h1 className="add-video-title">{title}</h1>

      <div className="section-input">
        <input
          type="number"
          placeholder="Enter number of sections"
          value={num || ""}
          onChange={(e) => setNum(Number(e.target.value))}
          min="1"
        />
        <button onClick={() => createSections(num, type)}>Create Sections</button>
      </div>

      {sections.length > 0 && (
        <form onSubmit={handleSubmit}>
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="section-box">
              <input
                type="text"
                placeholder="Enter Section Name"
                value={section.title}
                onChange={(e) => {
                  const setFunction = type === "yoga" ? setYogaSections : setRelaxSections;
                  setFunction((prev) => {
                    const updated = [...prev];
                    updated[sectionIndex].title = e.target.value;
                    return updated;
                  });
                }}
                required
                className="rename-input"
              />

              {section.videos.map((video, videoIndex) => (
                <div key={videoIndex} className="video-row">
                  <input
                    type="text"
                    placeholder={`Video ${videoIndex + 1} Title`}
                    value={video.title}
                    onChange={(e) =>
                      handleVideoChange(type, sectionIndex, videoIndex, "title", e.target.value)
                    }
                    required
                  />

                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      handleVideoUpload(type, sectionIndex, videoIndex, e.target.files[0])
                    }
                  />

                  <button type="button" className="delete-btn1" onClick={() => handleDeleteVideo(type, sectionIndex, videoIndex)}>
                    Delete
                  </button>

                  {video.link === "uploading..." && (
                    <p style={{ color: "#9EC7C9" }}>Uploading...</p>
                  )}
                  {video.link && video.link !== "uploading..." && (
                    <p style={{ color: "#9EC7C9" }}> Uploaded</p>
                  )}
                </div>
              ))}

              <button type="button" className="add-btn" onClick={() => handleAddVideo(type, sectionIndex)}>
                + Add More Video
              </button>
            </div>
          ))}

          <div className="action-buttons">
            <button type="submit" className="submit-btn">Save All Sections</button>
            <button type="button" className="delete-all-btn" onClick={() => handleDeleteAll(type)}>
              Delete All Sections
            </button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <>
      <div className="add-video-container">
        {renderSectionGroup("yoga", "Yoga / Meditation Sections", yogaSections, numYogaSections, setNumYogaSections)}
        {renderSectionGroup("relax", "Relaxing Video Sections", relaxSections, numRelaxSections, setNumRelaxSections)}

        {savedSections.length > 0 && (
          <div className="saved-sections">
            <h2>Saved Sections</h2>

            <table className="saved-table1">
              <thead className="savedTB">
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Videos</th>
                  <th>View</th>
                  <th >Delete</th>
                </tr>
              </thead>

              <tbody>
                {savedSections.map((section) => (
                  <tr key={section.id}>
                    <td>{section.type}</td>
                    <td>{section.title}</td>
                    <td>{section.videos.length}</td>
                    <td><button className="view-btn" onClick={() => handleViewSection(section)}>View</button></td>
                    <td><button className="delete-btn1" onClick={() => handleDeleteSavedSection(section.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalData.visible && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>{modalData.message}</p>
            <div className="modal-actions">
              <button className="savebtn1" onClick={() => modalData.onConfirm && modalData.onConfirm()}>Yes, Delete</button>
              <button className="savebtn2" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddVideo;


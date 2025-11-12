// import React, { useState, useEffect } from "react";
// import "./AddVideo.css";
// import { useNavigate } from "react-router-dom";
// import { FaTrash } from "react-icons/fa";
// import { db } from "../firebase"; // Import Firestore
// import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

// const AddVideo = () => {
//   const navigate = useNavigate();

//   const [numYogaSections, setNumYogaSections] = useState(0);
//   const [numRelaxSections, setNumRelaxSections] = useState(0);
//   const [yogaSections, setYogaSections] = useState([]);
//   const [relaxSections, setRelaxSections] = useState([]);
//   const [savedSections, setSavedSections] = useState([]);
//   const [modalData, setModalData] = useState({
//     visible: false,
//     message: "",
//     onConfirm: null,
//   });

//   // Fetch saved sections from Firestore on component mount
//   useEffect(() => {
//     const fetchSections = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "videoLink"));
//         const sectionsData = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setSavedSections(sectionsData);
//       } catch (error) {
//         console.error("Error fetching videoLink sections:", error);
//       }
//     };
//     fetchSections();
//   }, []);

//   const getEmbedUrl = (url) => {
//     if (!url) return "";
//     const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
//     return match ? `https://www.youtube.com/embed/${match[1]}` : url;
//   };

//   const createSections = (count, type) => {
//     if (count < 1) return;

//     const newSections = Array.from({ length: count }, (_, i) => ({
//       id: Date.now() + i, // Temporary ID for local state
//       title: "",
//       videos: Array.from({ length: 4 }, () => ({ title: "", link: "" })),
//     }));

//     type === "yoga" ? setYogaSections(newSections) : setRelaxSections(newSections);
//   };

//   const handleVideoChange = (type, sectionIndex, videoIndex, field, value) => {
//     const setFunction = type === "yoga" ? setYogaSections : setRelaxSections;
//     setFunction((prev) => {
//       const updated = [...prev];
//       updated[sectionIndex].videos[videoIndex] = {
//         ...updated[sectionIndex].videos[videoIndex],
//         [field]: value,
//       };
//       return updated;
//     });
//   };

//   const handleAddVideo = (type, sectionIndex) => {
//     const setFunction = type === "yoga" ? setYogaSections : setRelaxSections;
//     setFunction((prev) => {
//       const updated = [...prev];
//       if (updated[sectionIndex].videos.length < 4) {
//         updated[sectionIndex].videos.push({ title: "", link: "" });
//       }
//       return updated;
//     });
//   };

//   const handleDeleteVideo = (type, sectionIndex, videoIndex) => {
//     const setFunction = type === "yoga" ? setYogaSections : setRelaxSections;
//     setFunction((prev) => {
//       const updated = [...prev];
//       updated[sectionIndex].videos.splice(videoIndex, 1);
//       return updated;
//     });
//   };

//   const handleDeleteAll = (type) => {
//     setModalData({
//       visible: true,
//       message: `Are you sure you want to delete all ${
//         type === "yoga" ? "Yoga / Meditation" : "Relaxing Video"
//       } sections?`,
//       onConfirm: () => {
//         if (type === "yoga") {
//           setYogaSections([]);
//           setNumYogaSections(0);
//         } else {
//           setRelaxSections([]);
//           setNumRelaxSections(0);
//         }
//         closeModal();
//       },
//     });
//   };

//   const handleDeleteSavedSection = (id) => {
//     setModalData({
//       visible: true,
//       message: `Are you sure you want to delete this saved section?`,
//       onConfirm: async () => {
//         try {
//           // Delete from Firestore
//           await deleteDoc(doc(db, "videoLink", id));
//           // Update local state
//           setSavedSections((prev) => prev.filter((section) => section.id !== id));
//           closeModal();
//         } catch (error) {
//           console.error("Error deleting videoLink section:", error);
//         }
//       },
//     });
//   };

//   const closeModal = () => {
//     setModalData({ visible: false, message: "", onConfirm: null });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const combinedSections = [
//       ...yogaSections.map((sec) => ({ ...sec, type: "Yoga / Meditation" })),
//       ...relaxSections.map((sec) => ({ ...sec, type: "Relaxing Videos" })),
//     ];

//     if (combinedSections.length === 0) return;

//     try {
//       // Save each section to Firestore
//       for (const section of combinedSections) {
//         const sectionData = {
//           title: section.title,
//           type: section.type,
//           videos: section.videos,
//           createdAt: new Date(),
//         };
//         const docRef = await addDoc(collection(db, "videoLink"), sectionData);
//         section.id = docRef.id; // Update with Firestore-generated ID
//       }

//       // Update local state
//       setSavedSections((prev) => [...prev, ...combinedSections]);
//       setYogaSections([]);
//       setRelaxSections([]);
//       setNumYogaSections(0);
//       setNumRelaxSections(0);
//     } catch (error) {
//       console.error("Error saving videoLink sections:", error);
//     }
//   };

//  const handleViewSection = (section) => {
//   navigate(`/view-section/${section.id}`, { state: { section } });
// };

//   const renderSectionGroup = (type, title, sections, num, setNum) => (
//     <div className="add-video-card">
//       <h1 className="add-video-title">{title}</h1>
//       <div className="section-input">
//         <input
//           type="number"
//           placeholder="Enter number of sections"
//           value={num || ""}
//           onChange={(e) => setNum(Number(e.target.value))}
//           min="1"
//         />
//         <button onClick={() => createSections(num, type)}>Create Sections</button>
//       </div>

//       {sections.length > 0 && (
//         <form onSubmit={handleSubmit}>
//           {sections.map((section, sectionIndex) => (
//             <div key={section.id} className="section-box">
//               <div className="section-header">
//                 <input
//                   type="text"
//                   placeholder="Enter Section Name"
//                   value={section.title}
//                   onChange={(e) => {
//                     const setFunction = type === "yoga" ? setYogaSections : setRelaxSections;
//                     setFunction((prev) => {
//                       const updated = [...prev];
//                       updated[sectionIndex].title = e.target.value;
//                       return updated;
//                     });
//                   }}
//                   className="rename-input"
//                   required
//                 />
//               </div>

//               {section.videos.map((video, videoIndex) => (
//                 <div key={videoIndex} className="video-row">
//                   <input
//                     type="text"
//                     placeholder={`Video ${videoIndex + 1} Title`}
//                     value={video.title}
//                     onChange={(e) =>
//                       handleVideoChange(type, sectionIndex, videoIndex, "title", e.target.value)
//                     }
//                     required
//                   />
//                   <input
//                     type="url"
//                     placeholder="Video Link (YouTube, Vimeo, etc.)"
//                     value={video.link}
//                     onChange={(e) =>
//                       handleVideoChange(type, sectionIndex, videoIndex, "link", e.target.value)
//                     }
//                     required
//                   />
//                   <button
//                     type="button"
//                     className="delete-btn1"
//                     onClick={() => handleDeleteVideo(type, sectionIndex, videoIndex)}
//                   >
//                     Delete
//                   </button>
//                   {video.link && (
//                     <div className="video-preview">
//                       <iframe
//                         src={getEmbedUrl(video.link)}
//                         title={video.title || `Video ${videoIndex + 1}`}
//                         frameBorder="0"
//                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                         allowFullScreen
//                       ></iframe>
//                     </div>
//                   )}
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 className="add-btn"
//                 onClick={() => handleAddVideo(type, sectionIndex)}
//               >
//                 + Add More Video
//               </button>
//             </div>
//           ))}

//           <div className="action-buttons">
//             <button type="submit" className="submit-btn">
//               Save All Sections
//             </button>
//             <button
//               type="button"
//               className="delete-all-btn"
//               onClick={() => handleDeleteAll(type)}
//             >
//               Delete All Sections
//             </button>
//           </div>
//         </form>
//       )}
//     </div>
//   );

//   return (
//     <>
//       <div className="add-video-container">
//         {renderSectionGroup(
//           "yoga",
//           "Yoga / Meditation Sections",
//           yogaSections,
//           numYogaSections,
//           setNumYogaSections
//         )}
//         {renderSectionGroup(
//           "relax",
//           "Relaxing Video Sections",
//           relaxSections,
//           numRelaxSections,
//           setNumRelaxSections
//         )}

//         {savedSections.length > 0 && (
//           <div className="saved-sections">
//             <h2>Saved Sections</h2>
//             <table className="saved-table1">
//               <thead className="savedTB">
//                 <tr>
//                   <th>Section Type</th>
//                   <th>Section Title</th>
//                   <th>Videos</th>
//                   <th>Action</th>
//                   <th>Delete</th>
//                 </tr>
//               </thead>
//               <tbody className="savedTBBODY">
//                 {savedSections.map((section, index) => (
//                   <tr key={section.id || index}>
//                     <td data-label="Section Type">{section.type}</td>
//                     <td data-label="Section Title">{section.title}</td>
//                     <td data-label="Videos">{section.videos.length}</td>
//                     <td data-label="Action">
//                       <button
//                         className="view-btn"
//                         onClick={() => handleViewSection(section)}
//                       >
//                         View
//                       </button>
//                     </td>
//                     <td data-label="Delete">
//                       <button
//                         className="delete-btn1"
//                         onClick={() => handleDeleteSavedSection(section.id)}
//                         title="Delete Section"
//                       >
//                         Delete
//                         {/* <FaTrash size={18} /> */}
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {modalData.visible && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             height: "100vh",
//             width: "100vw",
//             backgroundColor: "rgba(0,0,0,0.5)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             zIndex: 9999,
//           }}
//         >
//           <div
//             style={{
//               background: "#fff",
//               borderRadius: "8px",
//               padding: "20px 30px",
//               maxWidth: "400px",
//               width: "90%",
//               boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
//               textAlign: "center",
//             }}
//           >
//             <p style={{ fontSize: "1.1rem", marginBottom: "20px", color: "black" }}>
//               {modalData.message}
//             </p>
//             <div style={{ display: "flex", justifyContent: "center", gap: "0px" }}>
//               <button
//                 className="savebtn1"
//                 onClick={() => modalData.onConfirm && modalData.onConfirm()}
//               >
//                 Yes, Delete
//               </button>
//               <button className="savebtn2" onClick={closeModal}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AddVideo;

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
      videos: Array.from({ length: 4 }, () => ({ title: "", link: "" })),
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
      if (updated[sectionIndex].videos.length < 4) {
        updated[sectionIndex].videos.push({ title: "", link: "" });
      }
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


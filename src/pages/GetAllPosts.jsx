import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaHeart, FaComment, FaTrash, FaEye, FaRegHeart, FaRegComment, FaTimes } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../pages/GetAllPost.css";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { CLOUDINARY } from "../CloudinaryConfig";

const GetAllPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({});
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newContent, setNewContent] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [message, setMessage] = useState(null);
  const [formError, setFormError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const itemsPerPage = 9;

  // ✅ Fetch posts from BOTH collections
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch regular posts
        const postsSnapshot = await getDocs(collection(db, "posts"));
        const postsData = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch admin posts
        const adminPostsSnapshot = await getDocs(collection(db, "AdminPost"));
        const adminPostsData = adminPostsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isAdminPost: true, // Mark as admin post
        }));

        // Combine both collections
        const allPosts = [...postsData, ...adminPostsData];

        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = {};
        usersSnapshot.docs.forEach((doc) => {
          usersData[doc.id] = doc.data();
        });

        setUsers(usersData);
        setPosts(allPosts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // ✅ Generate avatar with first letter and random color
  const generateAvatarFromLetter = (letter) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    const colorIndex = letter.charCodeAt(0) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    const svg = `
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" fill="${backgroundColor}" rx="8"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${letter}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // ✅ Get username from userId
  const getUsername = (userId) => {
    if (!userId) return "Admin";
    
    const user = users[userId];
    if (user && user.username) {
      return user.username;
    }
    
    return `User ${userId.substring(0, 8)}...`;
  };

  // ✅ Get user avatar with first letter as fallback
  const getUserAvatar = (userId) => {
    if (!userId) return generateAvatarFromLetter("A");
    
    const user = users[userId];
    if (!user) return generateAvatarFromLetter("U");

    if (user.avatarUrl && 
        user.avatarUrl.trim() !== "" && 
        user.avatarUrl !== "null" &&
        user.avatarUrl !== "undefined") {
      return user.avatarUrl;
    }

    const username = user.username || "U";
    const firstLetter = username.charAt(0).toUpperCase();
    
    return generateAvatarFromLetter(firstLetter);
  };

  // ✅ Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY.UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY.UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!data.secure_url) throw new Error("Cloudinary upload failed");
    return data.secure_url;
  };

  // ✅ Add Post to AdminPost collection
  const handleAddPost = async () => {
    if (!newContent.trim()) {
      setFormError("Please enter post content");
      setTimeout(() => setFormError(""), 2000);
      return;
    }

    try {
      let imageUrl = null;
      
      if (newImage) {
        imageUrl = await uploadToCloudinary(newImage);
      }

      // ✅ CHANGED: Save to "AdminPost" collection instead of "posts"
      const postDoc = await addDoc(collection(db, "AdminPost"), {
        content: newContent,
        imageUrl: imageUrl,
        createdAt: Date.now(),
        isPublic: true,
        isAdminPost: true, // Optional flag to identify admin posts
      });

      const newPost = {
        id: postDoc.id,
        content: newContent,
        imageUrl: imageUrl,
        createdAt: Date.now(),
        isPublic: true,
        isAdminPost: true, // Optional flag to identify admin posts
      };

      setPosts((prev) => [newPost, ...prev]);
      setShowForm(false);
      setNewContent("");
      setNewImage(null);
      setMessage("✅ Admin post added successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error adding admin post:", error);
      setFormError("Error uploading admin post");
    }
  };

  // ✅ Delete Post - handle both collections
  const confirmDeletePost = async () => {
    try {
      const postToDelete = posts.find(p => p.id === confirmDelete);
      
      // ✅ CHANGED: Delete from correct collection based on post type
      if (postToDelete?.isAdminPost) {
        await deleteDoc(doc(db, "AdminPost", confirmDelete));
      } else {
        await deleteDoc(doc(db, "posts", confirmDelete));
      }
      
      setPosts((prev) => prev.filter((p) => p.id !== confirmDelete));
      setConfirmDelete(null);
      setMessage("🗑️ Post deleted successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ✅ Open image in modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // ✅ Close image modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // ✅ Safe filtering
  const filteredPosts = posts.filter((p) => {
    const content = p.content || "";
    const username = getUsername(p.userId) || "";
    
    return (
      content.toLowerCase().includes(search.toLowerCase()) ||
      username.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="posts-container">
      <h2 className="posts-heading">All Posts</h2>

      <div className="top-bar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search posts or users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="add-post-btn" onClick={() => setShowForm(true)}>
          <FaPlus className="plus-icon" />
          <span className="add-text">Add Admin Post</span>
        </button>
      </div>

      {message && <div className="alert-message below-bar">{message}</div>}

      {/* Add Post Modal */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Add New Admin Post</h3>
            <textarea
              placeholder="What's on your mind?"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files[0])}
            />

            {formError && <p className="form-error">{formError}</p>}

            <div className="modal-actions">
              <button onClick={handleAddPost} className="savebtn1">
                Post as Admin
              </button>
              <button onClick={() => setShowForm(false)} className="savebtn2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {confirmDelete && (
        <div className="modal-backdrop">
          <div className="modal-box small">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this post?</p>
            <div className="modal-actions">
              <button onClick={confirmDeletePost} className="savebtn1">
                Yes, Delete
              </button>
              <button onClick={() => setConfirmDelete(null)} className="savebtn2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="image-modal-backdrop" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeImageModal}>
              <FaTimes size={24} />
            </button>
            <img src={selectedImage} alt="Full size post" className="image-modal-img" />
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div className="posts-grid">
        {currentPosts.map((post) => (
          <div key={post.id} className="post-card">
            {post.imageUrl && (
              <div 
                className="image-container clickable-image"
                onClick={() => openImageModal(post.imageUrl)}
              >
                <img src={post.imageUrl} alt="Post" />
                <div className="image-overlay">
                  <span>Click to view full image</span>
                </div>
              </div>
            )}

            <button className="delete-icon-btn" onClick={() => setConfirmDelete(post.id)}>
              <FaTrash size={18} />
            </button>

            <div className="post-info">
              <div className="post-user">
                <img 
                  src={getUserAvatar(post.userId)} 
                  alt="User" 
                  className="user-avatar"
                />
                <span className="username">
                  {getUsername(post.userId)}
                </span>
              </div>
              <p>{post.content || "No content"}</p>
            </div>

            <div className="post-actions">
              <div className="action">
                <FaRegHeart className="icon heart" />
                <span>Like</span>
              </div>
              
              <div
                className="action"
                onClick={() =>
                  navigate(`/posts/${post.id}`, {
                    state: { post },
                  })
                }
              >
                <FaEye className="icon view-icon" title="View Post" />
                <span>View</span>
              </div>
              
              <div className="action">
                <FaRegComment className="icon" />
                <span>Comment</span>
              </div>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="no-results">
            <p>No posts found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-footer">
          <button
            className="pagination-btn prev-next"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={20} /> Previous
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-number ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn prev-next"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default GetAllPosts;
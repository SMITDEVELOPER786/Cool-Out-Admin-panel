import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaHeart, FaComment, FaTrash, FaEye } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../pages/GetAllPost.css";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { CLOUDINARY } from "../CloudinaryConfig";

const GetAllPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newUser, setNewUser] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [message, setMessage] = useState(null);
  const [formError, setFormError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // ✅ Fetch posts from Firestore on load
  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData.sort((a, b) => b.createdAt - a.createdAt));
    };
    fetchPosts();
  }, []);

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

  // ✅ Add Post
  const handleAddPost = async () => {
    if (!newUser.trim() || !newContent.trim()) {
      setFormError("Please fill all fields");
      setTimeout(() => setFormError(""), 2000);
      return;
    }

    try {
      let imageUrl = null;
      if (newImage) {
        imageUrl = await uploadToCloudinary(newImage);
      }

      const postDoc = await addDoc(collection(db, "posts"), {
        user: newUser,
        content: newContent,
        image: imageUrl,
        createdAt: Date.now(),
      });

      const newPost = {
        id: postDoc.id,
        user: newUser,
        content: newContent,
        image: imageUrl,
        createdAt: Date.now(),
      };

      setPosts((prev) => [newPost, ...prev]);
      setShowForm(false);
      setNewUser("");
      setNewContent("");
      setNewImage(null);
      setMessage("✅ Post added successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error adding post:", error);
      setFormError("Error uploading post");
    }
  };

  // ✅ Delete Post
  const confirmDeletePost = async () => {
    try {
      await deleteDoc(doc(db, "posts", confirmDelete));
      setPosts((prev) => prev.filter((p) => p.id !== confirmDelete));
      setConfirmDelete(null);
      setMessage("🗑️ Post deleted successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.user.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase())
  );

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
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="add-post-btn" onClick={() => setShowForm(true)}>
          <FaPlus className="plus-icon" />
          <span className="add-text">Add Post</span>
        </button>
      </div>

      {message && <div className="alert-message below-bar">{message}</div>}

      {/* Add Post Modal */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Add New Post</h3>
            <input
              type="text"
              placeholder="Username"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
            />
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
                Post
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

      {/* Posts Grid */}
      <div className="posts-grid">
        {currentPosts.map((post) => (
          <div key={post.id} className="post-card">
            {post.image && (
              <div className="image-container">
                <img src={post.image} alt="Post" />
              </div>
            )}

            <button className="delete-icon-btn" onClick={() => setConfirmDelete(post.id)}>
              <FaTrash size={18} />
            </button>

            <div className="post-info">
              <h3>{post.user}</h3>
              <p>{post.content}</p>
            </div>

            <div className="post-actions">
              <div className="action">
                <FaHeart className="icon heart" />
                <span>likes</span>
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
              </div>
              <div className="action">
                <FaComment className="icon" />
                <span>comments</span>
              </div>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="no-results">
            <p>No posts or users found</p>
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

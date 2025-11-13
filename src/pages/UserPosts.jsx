import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHeart, FaComment } from "react-icons/fa";
import "./PostDetails.css";

const UserPosts = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const user = state?.user; // user object from Team.jsx

  const [activePost, setActivePost] = useState(null);
  const [viewMode, setViewMode] = useState(null); // "likes" or "comments"

  // 🧩 Mock posts
  const allPosts = [
    ...Array(5).fill(0).map((_, i) => ({
      id: i + 1,
      userId: 1,
      user: "Fatima",
      image: `https://picsum.photos/seed/fatima${i}/600/400`,
      content: `Fatima's post ${i + 1} — having a great day! 🌸`,
      likes: [{ id: 1, user: "Ali" }, { id: 2, user: "Sara" }],
      comments: [{ id: 1, user: "Ali", comment: "Beautiful!" }, { id: 2, user: "Sara", comment: "So nice!" }],
    })),
    ...Array(5).fill(0).map((_, i) => ({
      id: i + 6,
      userId: 2,
      user: "Ali",
      image: `https://picsum.photos/seed/ali${i}/600/400`,
      content: `Ali's adventure ${i + 1} 🏞️`,
      likes: [{ id: 1, user: "Fatima" }],
      comments: [{ id: 1, user: "Fatima", comment: "Cool pic!" }],
    })),
    ...Array(5).fill(0).map((_, i) => ({
      id: i + 11,
      userId: 3,
      user: "Sara",
      image: `https://picsum.photos/seed/sara${i}/600/400`,
      content: `Sara's lifestyle update ${i + 1} ☕`,
      likes: [],
      comments: [],
    })),
  ];

  // Filter posts by userId
  const userPosts = allPosts.filter((p) => p.userId === Number(userId));

  const toggleSection = (postId, section) => {
    if (activePost === postId && viewMode === section) {
      setActivePost(null);
      setViewMode(null);
    } else {
      setActivePost(postId);
      setViewMode(section);
    }
  };

  // Close likes/comments popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".likes-popup") &&
        !event.target.closest(".comments-list") &&
        !event.target.closest(".stat-item")
      ) {
        setActivePost(null);
        setViewMode(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="post-details-container">
      <button className="backbtn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      {/* Correct username mapping */}
      <h2>{user ? `${user.username}'s Posts` : `User ${userId}'s Posts`}</h2>

      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.username}
              style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }}
            />
          )}
          <div>
            <p><b>Email:</b> {user.email || "Not provided"}</p>
            <p><b>Location:</b> {user.location || "Unknown"}</p>
          </div>
        </div>
      )}

      {userPosts.length === 0 ? (
        <div className="no-posts">
          <p style={{ fontSize: "18px", color: "#777", marginTop: "30px" }}>
            {user ? `${user.username} hasn’t made any posts yet.` : "No posts found for this user."}
          </p>
        </div>
      ) : (
        <div className="posts-grid">
          {userPosts.map((post) => (
            <div key={post.id} className="full-post-card">
              <img src={post.image} alt="Post" className="full-post-image small" />

              <div className="full-post-content">
                <p>{post.content}</p>
                <div className="full-post-stats">
                  <div className="stat-item clickable" onClick={() => toggleSection(post.id, "likes")}>
                    <FaHeart className="stat-icon heart" /> {post.likes.length} Likes
                  </div>
                  <div className="stat-item clickable" onClick={() => toggleSection(post.id, "comments")}>
                    <FaComment className="stat-icon" /> {post.comments.length} Comments
                  </div>
                </div>
              </div>

              {activePost === post.id && viewMode === "likes" && (
                <div className="likes-popup">
                  <h3>Liked by</h3>
                  {post.likes.length > 0 ? post.likes.map((l) => (
                    <div key={l.id} className="like-item">{l.user}</div>
                  )) : <p>No likes yet.</p>}
                </div>
              )}

              {activePost === post.id && viewMode === "comments" && (
                <div className="comments-list">
                  <h3>Comments</h3>
                  {post.comments.length > 0 ? post.comments.map((c) => (
                    <div key={c.id} className="comment-item">
                      <strong>{c.user}</strong>
                      <p>{c.comment}</p>
                    </div>
                  )) : <p className="no-comments">No comments yet.</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPosts;

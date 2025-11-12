import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaHeart, FaComment, FaArrowLeft } from "react-icons/fa";
import "./PostDetails.css";

const PostDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { post, likes = [], comments = [] } = state || {};

  const [showLikes, setShowLikes] = useState(false);
  const [showComments, setShowComments] = useState(false);

  if (!post) {
    return <div className="not-found">Post not found.</div>;
  }

  // ✅ Function to toggle likes (and auto close comments)
  const toggleLikes = () => {
    setShowLikes(!showLikes);
    setShowComments(false);
  };

  // ✅ Function to toggle comments (and auto close likes)
  const toggleComments = () => {
    setShowComments(!showComments);
    setShowLikes(false);
  };

  return (
    <div className="post-details-container">
      <button className="backbtn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      {/* Full Post Card */}
      <div className={`full-post-card ${!post.image ? "no-image" : ""}`}>
        {post.image && (
          <img src={post.image} alt="Post" className="full-post-image small" />
        )}

        <div className="full-post-content">
          <h2>{post.user}</h2>
          <p>{post.content}</p>

          <div className="full-post-stats">
            <div className="stat-item clickable" onClick={toggleLikes}>
              <FaHeart className="stat-icon heart" /> {likes.length} Likes
            </div>

            <div className="stat-item clickable" onClick={toggleComments}>
              <FaComment className="stat-icon" /> {comments.length} Comments
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Likes Section (only visible when showLikes = true) */}
      {showLikes && (
        <div className="likes-popup">
          <h3>Liked by</h3>
          {likes.length > 0 ? (
            likes.map((l) => (
              <div key={l.id} className="like-item">
                <span>{l.user}</span>
              </div>
            ))
          ) : (
            <p>No likes yet.</p>
          )}
        </div>
      )}

      {/* ✅ Comments Section (only visible when showComments = true) */}
      {showComments && (
        <div className="comments-list">
          <h3>Comments</h3>
          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} className="comment-item">
                <strong>{c.user}</strong>
                <p>{c.comment}</p>
              </div>
            ))
          ) : (
            <p className="no-comments">No comments yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostDetails;

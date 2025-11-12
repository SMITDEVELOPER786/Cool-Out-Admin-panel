// reports.jsx
import React from 'react';
import './reports.css';

const Reports = () => {
  const reportedUsers = [
    { id: 1, username: 'user123', reason: 'Spam', reportedBy: 'admin01', date: '2025-10-30' },
    { id: 2, username: 'trollking', reason: 'Harassment', reportedBy: 'user456', date: '2025-10-29' },
    { id: 3, username: 'bot_account', reason: 'Suspicious Activity', reportedBy: 'moderator2', date: '2025-10-28' },
  ];

  const reportedPosts = [
    { id: 101, postId: 'P-8841', contentPreview: 'Click this link to win $1000!', reason: 'Scam Link', reportedBy: 'user789', date: '2025-10-31' },
    { id: 102, postId: 'P-7723', contentPreview: 'You are ugly and stupid.', reason: 'Hate Speech', reportedBy: 'user222', date: '2025-10-30' },
    { id: 103, postId: 'P-6690', contentPreview: '[Image of violence]', reason: 'Graphic Content', reportedBy: 'moderator1', date: '2025-10-29' },
  ];

  return (
    <div className="reports-page">
      <header className="reports-header">
        <h1>Review Reported Content</h1>
        <p>Review and manage reported users and posts</p>
      </header>

      {/* Reported Users */}
      <section className="report-card">
        <div className="card-header">
          <h2>Reported Users</h2>
          <span className="count-badge">{reportedUsers.length}</span>
        </div>
        <div className="card-body">
          {reportedUsers.map((user) => (
            <div key={user.id} className="report-item">
              <div className="item-main">
                <div className="user-info">
                  <strong>#{user.id} • {user.username}</strong>
                  <span className="reported-by">by {user.reportedBy}</span>
                </div>
                <span className={`tag ${user.reason.toLowerCase().replace(' ', '-')}`}>
                  {user.reason}
                </span>
              </div>
              <div className="item-meta">
                <span className="date">{user.date}</span>
                <div className="actions">
                  <button className="btn-outline">Review</button>
                  <button className="btn-ghost">Dismiss</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reported Posts */}
      <section className="report-card">
        <div className="card-header">
          <h2>Reported Posts</h2>
          <span className="count-badge">{reportedPosts.length}</span>
        </div>
        <div className="card-body">
          {reportedPosts.map((post) => (
            <div key={post.id} className="report-item">
              <div className="item-main">
                <div className="post-info">
                  <strong>{post.postId}</strong>
                  <p className="preview">{post.contentPreview}</p>
                  <span className="reported-by">by {post.reportedBy}</span>
                </div>
                <span className={`tag ${post.reason.toLowerCase().replace(' ', '-')}`}>
                  {post.reason}
                </span>
              </div>
              <div className="item-meta">
                <span className="date">{post.date}</span>
                <div className="actions">
                  <button className="btn-primary">View</button>
                  <button className="btn-danger">Delete</button>
                  <button className="btn-ghost">Dismiss</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="reports-footer">
        Last updated: {new Date().toLocaleString()}
      </footer>
    </div>
  );
};

export default Reports;
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import './reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'users', 'posts'

  // Fetch reports from Firebase
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'reports'));
        const reportsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReports(reportsData);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Handle dismiss report
  const handleDismiss = async (reportId) => {
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      setReports(prev => prev.filter(report => report.id !== reportId));
    } catch (error) {
      console.error('Error dismissing report:', error);
    }
  };

  // Handle resolve report (mark as resolved)
  const handleResolve = async (reportId) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });
      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, status: 'resolved' } : report
      ));
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  // Filter reports based on active tab
  const filteredReports = reports.filter(report => {
    if (activeTab === 'all') return true;
    if (activeTab === 'users') return report.type === 'user';
    if (activeTab === 'posts') return report.type === 'post';
    return true;
  });

  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <header className="reports-header">
        <h1>Review Reported Content</h1>
        <p>Review and manage reported users and posts</p>
      </header>

      {/* Tabs */}
      <div className="reports-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Reports ({reports.length})
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Reports ({reports.filter(r => r.type === 'user').length})
        </button>
        <button 
          className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Post Reports ({reports.filter(r => r.type === 'post').length})
        </button>
      </div>

      {/* Reports List */}
      <section className="report-card">
        <div className="card-header">
          <h2>
            {activeTab === 'all' && 'All Reports'}
            {activeTab === 'users' && 'Reported Users'}
            {activeTab === 'posts' && 'Reported Posts'}
          </h2>
          <span className="count-badge">{filteredReports.length}</span>
        </div>

        <div className="card-body">
          {filteredReports.length === 0 ? (
            <div className="no-reports">
              <p>No reports found</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="report-item">
                <div className="item-main">
                  <div className="report-info">
                    <div className="report-header">
                      <strong>
                        {report.type === 'user' ? '👤 User Report' : '📝 Post Report'}
                      </strong>
                      <span className={`status ${report.status || 'pending'}`}>
                        {report.status || 'Pending'}
                      </span>
                    </div>
                    
                    <div className="report-details">
                      {report.type === 'user' && (
                        <>
                          <p><strong>Username:</strong> {report.reportedUsername || 'Unknown'}</p>
                          <p><strong>User ID:</strong> {report.reportedUserId}</p>
                        </>
                      )}
                      {report.type === 'post' && (
                        <>
                          <p><strong>Post ID:</strong> {report.postId}</p>
                          <p><strong>Content:</strong> {report.postContent || 'No content preview'}</p>
                        </>
                      )}
                      <p><strong>Reason:</strong> {report.reason}</p>
                      <p><strong>Description:</strong> {report.description || 'No additional details'}</p>
                    </div>

                    <div className="reporter-info">
                      <span className="reported-by">
                        Reported by: {report.reporterUsername || report.reporterId} • {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown date'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="item-meta">
                  <div className="actions">
                    {report.type === 'post' && (
                      <button 
                        className="btn-primary"
                        onClick={() => window.open(`/posts/${report.postId}`, '_blank')}
                      >
                        View Post
                      </button>
                    )}
                    {report.type === 'user' && (
                      <button 
                        className="btn-primary"
                        onClick={() => window.open(`/users/${report.reportedUserId}`, '_blank')}
                      >
                        View User
                      </button>
                    )}
                    
                    <button 
                      className="btn-success"
                      onClick={() => handleResolve(report.id)}
                      disabled={report.status === 'resolved'}
                    >
                      {report.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                    </button>
                    
                    <button 
                      className="btn-danger"
                      onClick={() => handleDismiss(report.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="reports-footer">
        Last updated: {new Date().toLocaleString()}
      </footer>
    </div>
  );
};

export default Reports;
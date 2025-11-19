import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import "../pages/GetAllusers.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

function Team() {
  const [teamData, setTeamData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [viewMember, setViewMember] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const itemsPerPage = 10;

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .reverse();
        
        console.log("Fetched users:", usersList);
        setTeamData(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ✅ Get user avatar with default fallback
  
  // ✅ Get user avatar with first letter as fallback
const getUserAvatar = (member) => {
  // If user has custom avatar, use it
  if (member.avatarUrl && 
      member.avatarUrl.trim() !== "" && 
      member.avatarUrl !== "null" &&
      member.avatarUrl !== "undefined") {
    return member.avatarUrl;
  }

  // Generate avatar with first letter of username
  const username = member.username || "U";
  const firstLetter = username.charAt(0).toUpperCase();
  
  // Create a colorful avatar with the first letter
  return generateAvatarFromLetter(firstLetter);
};

// ✅ Generate avatar with first letter and random color
const generateAvatarFromLetter = (letter) => {
  // Array of nice colors for avatars
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  
  // Get consistent color based on letter
  const colorIndex = letter.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  // Create SVG avatar with the letter
  const svg = `
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="${backgroundColor}" rx="8"/>
      <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${letter}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
  // Highlight search text
  const highlightText = (text, search) => {
    if (!search || !text) return text;
    const regex = new RegExp(`(${search})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Filter users
  const filteredTeam = teamData.filter((member) => {
    const searchMatch =
      (member.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (member.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (member.location?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const userStatus = (member.status || "Active").toString().trim().toLowerCase();
    const filterStatus = selectedStatus.trim().toLowerCase();
    
    const statusMatch = selectedStatus === "" || userStatus === filterStatus;

    const dateMatch =
      !selectedDate ||
      (member.dateJoined &&
        member.dateJoined === selectedDate.toISOString().split('T')[0]);

    return searchMatch && statusMatch && dateMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTeam.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTeam = filteredTeam.slice(startIndex, startIndex + itemsPerPage);

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "status-active";
      case "Deactive":
        return "status-pending";
      case "Delete":
        return "status-withdraw";
      default:
        return "";
    }
  };

  // Delete user
  const handleRemove = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setTeamData((prev) => prev.filter((m) => m.id !== id));
      setMenuOpen(null);
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Edit user
  const handleEditSave = async () => {
    try {
      if (!editMember?.id) return;
      const userRef = doc(db, "users", editMember.id);

      await updateDoc(userRef, {
        username: editMember.username,
        role: editMember.role,
        status: editMember.status,
      });

      setTeamData((prev) =>
        prev.map((m) => (m.id === editMember.id ? { ...m, ...editMember } : m))
      );

      setEditMember(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="main-content">
          <div className="team-page">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px',
              fontSize: '18px',
              color: '#666'
            }}>
              Loading users...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="team-page">
          <div className="page-header">
            <h2 className="page-titlees">Users</h2>
          </div>

          {/* Filters */}
          <div className="filters-container">
            <div className="reports-search-container">
              <div className="reports-search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search by name, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="reports-search-input"
                />
              </div>
            </div>

            <div className="filter-controls">
              <div className="reports-date-filter">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  placeholderText="Join date"
                  className="date-input"
                  wrapperClassName="date-picker-wrapper"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  yearDropdownItemNumber={50}
                />
              </div>

              <div className="kyc-status-filter">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="kyc-status-select"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Deactive">Deactive</option>
                  <option value="Delete">Delete</option>
                </select>
                <ChevronDown className="kyc-select-icon" size={16} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            {filteredTeam.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "40px", padding: "20px" }}>
                <p style={{ fontSize: "16px", color: "#666" }}>
                  {searchTerm || selectedStatus || selectedDate 
                    ? "No users match your search criteria." 
                    : "No users found."}
                </p>
              </div>
            ) : (
              <table className="team-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Date Joined</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTeam.map((member) => {
                    const avatar = getUserAvatar(member);

                    return (
                      <tr key={member.id}>
                        <td data-label="Member">
                          <div className="user-cell">
                            <img 
                              src={avatar} 
                              alt={member.username || "User"} 
                              className="user-avatar"
                              onError={(e) => {
                                // Fallback to default if image fails to load
                                e.target.src = "assets/profileicon.png";
                              }}
                            />
                            <span className="user-name">
                              {highlightText(member.username || "Unnamed", searchTerm)}
                            </span>
                          </div>
                        </td>
                        <td data-label="Email">
                          {highlightText(member.email || "-", searchTerm)}
                        </td>
                        <td data-label="Role">
                          {highlightText(member.role || "User", searchTerm)}
                        </td>
                        <td data-label="Date Joined">
                          {highlightText(member.dateJoined || "-", searchTerm)}
                        </td>
                        <td data-label="Status">
                          <span className={`status-badge ${getStatusClass(member.status)}`}>
                            {member.status || "Active"}
                          </span>
                        </td>
                        <td data-label="Location">
                          {highlightText(member.location || "-", searchTerm)}
                        </td>
                        <td className="team-actions" data-label="Actions">
                          <div className="team-action-menu">
                            <button
                              className="team-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(menuOpen === member.id ? null : member.id);
                              }}
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {menuOpen === member.id && (
                              <div className="team-dropdown-menu">
                                <button onClick={() => { setViewMember(member); setMenuOpen(null); }}>
                                  <Eye size={14} /> View Profile
                                </button>
                                <button
                                  onClick={() =>
                                    navigate(`/users/ViewMore/${member.id}`, { state: { user: member } })
                                  }
                                >
                                  <Eye size={14} /> View More
                                </button>
                                <button onClick={() => { setEditMember(member); setMenuOpen(null); }}>
                                  <Edit size={14} /> Edit
                                </button>
                                <button onClick={() => setConfirmDelete(member)}>
                                  <Trash2 size={14} /> Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredTeam.length > 0 && (
            <div className="table-footer">
              <div className="showing-info">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTeam.length)} of {filteredTeam.length} entries
              </div>
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`pagination-number ${i + 1 === currentPage ? "active" : ""}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-button"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editMember && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Edit User</h3>
                <input
                  className="edit-input"
                  value={editMember.username || ""}
                  onChange={(e) => setEditMember({ ...editMember, username: e.target.value })}
                  placeholder="Username"
                />
                <input
                  className="edit-input"
                  value={editMember.role || ""}
                  onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
                  placeholder="Role"
                />
                <select
                  className="edit-input"
                  value={editMember.status || "Active"}
                  onChange={(e) => setEditMember({ ...editMember, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Deactive">Deactive</option>
                  <option value="Delete">Delete</option>
                </select>
                <div className="modal-actions">
                  <button type="button" className="savebtn1" onClick={handleEditSave}>
                    Save Changes
                  </button>
                  <button className="savebtn2" onClick={() => setEditMember(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Profile Modal */}
          {viewMember && (
            <div className="modal-overlay" onClick={() => setViewMember(null)}>
              <div className="modal-box left-aligned-modal" onClick={(e) => e.stopPropagation()}>
                <div className="profile-header">
                  <img
                    src={getUserAvatar(viewMember)}
                    alt={viewMember.username || "User"}
                    className="profile-avatar"
                    onError={(e) => {
                      e.target.src = "assets/profileicon.png";
                    }}
                  />
                  <div>
                    <h3>{viewMember.username || "Unnamed"}</h3>
                    <p>{viewMember.gender || "Gender not specified"}</p>
                  </div>
                </div>
                <div className="profile-details">
                  <p><b>Email:</b> {viewMember.email || "-"}</p>
                  <p><b>Role:</b> {viewMember.role || "User"}</p>
                  <p><b>Status:</b> {viewMember.status || "Active"}</p>
                  <p><b>Date Joined:</b> {viewMember.dateJoined || "-"}</p>
                  <p><b>Location:</b> {viewMember.location || "-"}</p>
                </div>
                <button className="team-close-btn" onClick={() => setViewMember(null)}>
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {confirmDelete && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to remove <b>{confirmDelete.username}</b>? This action cannot be undone.</p>
                <div className="modal-actions">
                  <button className="savebtn1" onClick={() => handleRemove(confirmDelete.id)}>
                    Yes, Remove User
                  </button>
                  <button className="savebtn2" onClick={() => setConfirmDelete(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Team;
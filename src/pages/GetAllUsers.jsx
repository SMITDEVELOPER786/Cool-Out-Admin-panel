import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import "../pages/GetAllusers.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MyDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      placeholderText="Select Date"
      className="date-input"
      wrapperClassName="date-picker-wrapper"
      dateFormat="yyyy-MM-dd"
    />
  );
};


// Highlight matching text
const highlightText = (text, search) => {
  if (!search) return text;
  const regex = new RegExp(`(${search})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} style={{ backgroundColor: "#ffeaa7" }}>{part}</span>
    ) : (
      part
    )
  );
};

export const defaultTeamData = [
  {
    id: 1,
    name: "Aliya",
    email: "aliya.khan@example.com",
  
    role: "User",
     gender: "Female",
    dateJoined: "2023-06-29",
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    location: "Karachi",
     emojis: { happy: 12, sad: 4, angry: 2, relaxed: 8 },
    moods: { week1: { happy: 10, calm: 6, stressed: 3, tired: 2 } },
    activity: { meditation: 120, reading: 90, journaling: 45, exercise: 60 },
    actionPlan: { meditate: true, exercise: true, journal: false, read: true },
    journals: [
      { date: "2025-10-01", emoji: "😊", content: "Had a productive day at university." },
      { date: "2025-10-02", emoji: "😢", content: "Felt tired and stressed during work." },
      { date: "2025-10-03", emoji: "😎", content: "Went for a walk and felt relaxed." },
    ],
  },
  {
    id: 2,
    name: "Ali",
    email: "ali.raza@example.com",
   
    role: "User",
     gender: "male",
    dateJoined: "2023-07-02",
    status: "Deactive",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    location: "Lahore",
     emojis: { happy: 5, sad: 12, angry: 2, relaxed: 8 },
    moods: { week1: { happy: 10, calm: 6, stressed: 3, tired: 2 } },
    activity: { meditation: 120, reading: 90, journaling: 45, exercise: 60 },
    actionPlan: { meditate: true, exercise: true, journal: false, read: true },
    journals: [
      { date: "2025-10-01", emoji: "😊", content: "Had a productive day at university." },
      { date: "2025-10-02", emoji: "😢", content: "Felt tired and stressed during work." },
      { date: "2025-10-03", emoji: "😎", content: "Went for a walk and felt relaxed." },
    ],
  },
  {
    id: 3,
    name: "Ahmar",
    email: "Ahmar.smith@example.com",
  
    role: "User",
     gender: "male",
    dateJoined: "2023-07-10",
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    location: "Islamabad",
     emojis: { happy: 12, sad: 4, angry: 2, relaxed: 8 },
    moods: { week1: { happy: 10, calm: 6, stressed: 3, tired: 2 } },
    activity: { meditation: 120, reading: 90, journaling: 45, exercise: 60 },
    actionPlan: { meditate: true, exercise: true, journal: false, read: true },
    journals: [
      { date: "2025-10-01", emoji: "😊", content: "Had a productive day at university." },
      { date: "2025-10-02", emoji: "😢", content: "Felt tired and stressed during work." },
      { date: "2025-10-03", emoji: "😎", content: "Went for a walk and felt relaxed." },
    ],
  },
  {
    id: 4,
    name: "Hareema",
    email: "Hareema.brown@example.com",
   
    role: "User",
     gender: "Female",
    dateJoined: "2023-07-15",
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    location: "Karachi",
     emojis: { happy: 12, sad: 4, angry: 2, relaxed: 8 },
    moods: { week1: { happy: 10, calm: 6, stressed: 3, tired: 2 } },
    activity: { meditation: 120, reading: 90, journaling: 45, exercise: 60 },
    actionPlan: { meditate: true, exercise: true, journal: false, read: true },
    journals: [
      { date: "2025-10-01", emoji: "😊", content: "Had a productive day at university." },
      { date: "2025-10-02", emoji: "😢", content: "Felt tired and stressed during work." },
      { date: "2025-10-03", emoji: "😎", content: "Went for a walk and felt relaxed." },
    ],
  },
  {
    id: 5,
    name: "Muhammad",
    email: "Muhaamad.j@example.com",
   
    role: "User",
     gender: "male",
    dateJoined: "2023-07-20",
    status: "Deactive",
    avatar: "https://randomuser.me/api/portraits/men/28.jpg",
    location: "Lahore",
     emojis: { happy: 12, sad: 4, angry: 2, relaxed: 8 },
    moods: { week1: { happy: 10, calm: 6, stressed: 3, tired: 2 } },
    activity: { meditation: 120, reading: 90, journaling: 45, exercise: 60 },
    actionPlan: { meditate: true, exercise: true, journal: false, read: true },
    journals: [
      { date: "2025-10-01", emoji: "😊", content: "Had a productive day at university." },
      { date: "2025-10-02", emoji: "😢", content: "Felt tired and stressed during work." },
      { date: "2025-10-03", emoji: "😎", content: "Went for a walk and felt relaxed." },
    ],
  },
];


function Team() {
  const [teamData, setTeamData] = useState(defaultTeamData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(null); // Date object
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [viewMember, setViewMember] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const navigate = useNavigate();
  const itemsPerPage = 10;

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".team-dropdown-menu") &&
        !event.target.closest(".team-action-btn")
      ) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Filtered team data - FIXED DATE FILTERING
  const filteredTeam = teamData.filter((member) => {
    const searchMatch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.location.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch =
      selectedStatus === "" || member.status === selectedStatus;

    // Fixed date matching logic
    const dateMatch =
      !selectedDate ||
      member.dateJoined === selectedDate.toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format

    return searchMatch && statusMatch && dateMatch;
  });

  // Redirect to first page if current page has no results
  useEffect(() => {
    const totalPages = Math.ceil(filteredTeam.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredTeam, currentPage]);

  const totalPages = Math.ceil(filteredTeam.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTeam = filteredTeam.slice(startIndex, endIndex);

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

  const toggleMenu = (id) => {
    setMenuOpen(menuOpen === id ? null : id);
    document.body.classList.toggle("modal-open", menuOpen !== id);
  };

  const handleRemove = (id) => {
    setTeamData(teamData.filter((m) => m.id !== id));
    setMenuOpen(null);
  };

  const handleEditSave = () => {
    setTeamData(
      teamData.map((m) => (m.id === editMember.id ? editMember : m))
    );
    setEditMember(null);
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="team-page">
          <div className="page-header">
            <h2 className="page-titlees" style={{ color: "#9EC7C9", fontSize: "30px" }}>
              Users
            </h2>
          </div>

          {/* Filters */}
          <div className="filters-container">
            <div className="reports-search-container">
              <div className="reports-search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search by Name, Email or Location"
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
    placeholderText="Select Date"
    className="date-input"
    wrapperClassName="date-picker-wrapper"
    dateFormat="yyyy-MM-dd"
    isClearable
    showMonthDropdown           // ✅ Month dropdown enable
    showYearDropdown            // ✅ Year dropdown enable
    dropdownMode="select"       // ✅ Dropdown style (not scroll)
    yearDropdownItemNumber={50} // ✅ Show 50 years range
  />
</div>


              {/* Status Filter */}
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
              <p style={{ textAlign: "center", marginTop: "20px" }}>No results found.</p>
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {currentTeam.map((member, index) => (
                    <tr key={member.id}>
                      <td data-label="Member">
                        <div className="user-cell">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="user-avatar"
                          />
                          <span className="user-name">
                            {highlightText(member.name, searchTerm)}
                          </span>
                        </div>
                      </td>
                      <td>{highlightText(member.email, searchTerm)}</td>
                    
                      <td>{highlightText(member.role, searchTerm)}</td>
                      <td>{highlightText(member.dateJoined, searchTerm)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td>{highlightText(member.location, searchTerm)}</td>
                      <td className="team-actions">
                        <div className="team-action-menu">
                          <button
                            className="team-action-btn"
                            onClick={(e) => { e.stopPropagation(); toggleMenu(member.id); }}
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {menuOpen === member.id && (
                            <div
                              className={`team-dropdown-menu ${
                                index >= currentTeam.length - 2 ? "drop-up" : ""
                              }`}
                            >
                              <button onClick={() => { setViewMember(member); setMenuOpen(null); }}>
                                <Eye size={14} /> View Profile
                              </button>
                              <button onClick={() => { navigate(`/users/${member.id}`); setMenuOpen(null); }}>
                                <Eye size={14} /> View Activity
                              </button>
                                <button
      onClick={() => {
        navigate(`/users/ViewMore/${member.id}`, { state: { user: member } });
        setMenuOpen(null);
      }}
    >
      <Eye size={14} /> View More
    </button>
                              <button
                                onClick={() => {
                                  navigate(`/users/postUser/${member.id}`, { state: { user: member } });
                                  setMenuOpen(null);
                                }}
                              >
                                <Eye size={14} /> View Posts
                              </button>
                              <button onClick={() => { setEditMember(member); setMenuOpen(null); }}>
                                <Edit size={14} /> Edit
                              </button>
                              <button onClick={() => { setConfirmDelete(member); setMenuOpen(null); }}>
                                <Trash2 size={14} /> Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredTeam.length > 0 && (
            <div className="table-footer">
              <div className="showing-info">
                Showing {Math.min(filteredTeam.length, itemsPerPage)} Entries
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
        </div>
      </div>

      {/* Edit Modal */}
      {editMember && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit Member</h3>
            <input
              className="edit-input"
              value={editMember.name}
              onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
            />
           
            <input
              className="edit-input"
              value={editMember.role}
              onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
            />
            <select
              className="edit-input"
              value={editMember.status}
              onChange={(e) => setEditMember({ ...editMember, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Deactive">Deactivate</option>
              <option value="Delete">Delete</option>
            </select>
            <button className="savebtn1" onClick={handleEditSave}>Save</button>
            <button className="savebtn2" style={{ background: "##6db2b5 ", marginLeft: "8px" }} onClick={() => setEditMember(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {viewMember && (
        <div className="modal-overlay">
          <div className="modal-box left-aligned-modal">
            <div className="profile-header">
              <img src={viewMember.avatar} alt={viewMember.name} className="profile-avatar" />
              <div>
                <h3>{viewMember.name}</h3>
                <p className="gender">{viewMember.gender}</p>
              </div>
            </div>
            <div className="profile-details">
              <p><b>Email:</b> {viewMember.email}</p>
            
              <p><b>Role:</b> {viewMember.role}</p>
              <p><b>Status:</b> {viewMember.status}</p>
              <p><b>Date Joined:</b> {viewMember.dateJoined}</p>
            </div>
            <button className="team-close-btn" style={{ marginTop: "12px" }} onClick={() => setViewMember(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>
              Are you sure you want to remove{" "}
              <span style={{ fontWeight: "bold"}}>{confirmDelete.name}</span>?
            </h3>
            <div style={{ marginTop: "12px" }}>
              <button className="savebtn1" style={{ fontWeight: "bold"}} onClick={() => { handleRemove(confirmDelete.id); setConfirmDelete(null); }}>
                Yes, Remove
              </button>
              <button className="savebtn2" style={{ marginLeft: "8px",fontWeight: "bold" }} onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;
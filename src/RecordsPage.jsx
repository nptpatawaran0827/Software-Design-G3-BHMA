import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Activity,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HealthForm from "./HealthForm";
import HeaderBanner from "./HeaderBanner";
import "./style/RecordsPage.css";

const RecordsPage = ({
  autoOpenForm = false,
  preFillData = null,
  onSubmitSuccess,
  onLogout,
}) => {
  /* ==================== STATE MANAGEMENT ==================== */
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Calendar Modal States
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); // Default to empty for "All Records"

  // Unified Notification States
  const [showStatus, setShowStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    title: "",
    desc: "",
    type: "success",
  });
  const [submissionStatus, setSubmissionStatus] = useState("");

  /* ==================== HOME INTEGRATION ==================== */
  useEffect(() => {
    if (autoOpenForm) {
      if (preFillData) {
        setEditingRecord(preFillData);
      } else {
        setEditingRecord(null);
      }
      setShowForm(true);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    }
  }, [autoOpenForm, preFillData, onSubmitSuccess]);

  /* ==================== AUTO-CLOSE TIMER ==================== */
  useEffect(() => {
    if (showStatus) {
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showStatus]);

  /* ==================== SOUND LOGIC ==================== */
  const playSuccessSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3");
    audio.volume = 0.4;
    audio.play().catch((e) => console.log("Audio interaction required", e));
  };

  const playDeleteSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1470/1470-preview.mp3");
    audio.volume = 0.3;
    audio.play().catch((e) => console.log("Audio interaction required", e));
  };

  /* ==================== HELPER: CALCULATE AGE ==================== */
  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  /* ==================== DATA FETCHING ==================== */
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://https://software-design-g3-bhma-2026.onrender.com/api/health-records");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await fetch("http://https://software-design-g3-bhma-2026.onrender.com/api/pending-residents");
      if (!res.ok) throw new Error("Failed to fetch pending residents");
      const data = await res.json();
      setPendingCount(data.length);
    } catch (err) {
      console.error("Failed to fetch pending count:", err);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchPendingCount();
    const interval = setInterval(() => fetchPendingCount(), 5000);
    return () => clearInterval(interval);
  }, []);

  /* CALENDAR MODAL HANDLERS */
  const handleOpenCalendar = () => setShowCalendar(true);
  const handleCloseCalendar = () => setShowCalendar(false);
  const handleDateChange = (dateString) => setSelectedDate(dateString);

  /* ACCEPT RESIDENT HANDLER */
  const handleAcceptResident = (residentData) => {
    setEditingRecord(residentData);
    setShowForm(true);
    fetchRecords();
    fetchPendingCount();
  };

  /* CRUD OPERATIONS */
  const handleAddNewRecord = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleSubmitForm = async (formData, editMode, isDuplicate = false) => {
    if (isDuplicate) {
      setSubmissionStatus(formData.Resident_ID || "EXISTING");
      setStatusMessage({
        title: "RECORD ALREADY EXISTS",
        desc: `"${formData.First_Name} ${formData.Last_Name}" is already in the system.`,
        type: "delete",
      });
      setShowStatus(true);
      playDeleteSound();
      return;
    }
    setSubmissionStatus(formData.Resident_ID);
    setStatusMessage({
      title: editMode ? "Record Updated!" : "Record Created!",
      desc: editMode ? "Changes have been synchronized." : "The new health record has been saved.",
      type: "success",
    });
    setShowStatus(true);
    playSuccessSound();
    fetchRecords();
    fetchPendingCount();
  };

  const handleDeleteRecord = async (record) => {
    const recordId = record.Health_Record_ID;
    const residentId = record.Resident_ID;
    if (!window.confirm(`Are you sure you want to delete record for ID: ${residentId}?`)) return;
    const adminUsername = localStorage.getItem("username") || "Admin";
    try {
      const res = await fetch(`http://https://software-design-g3-bhma-2026.onrender.com/api/health-records/${recordId}?admin_username=${adminUsername}`, { method: "DELETE" });
      if (res.ok) {
        setSubmissionStatus(residentId);
        setStatusMessage({ title: "Record Deleted", desc: "The health record was removed from the system.", type: "delete" });
        setShowStatus(true);
        playDeleteSound();
        fetchRecords();
        fetchPendingCount();
      }
    } catch (err) {
      setError("Failed to delete record.");
    }
  };

  /* ==================== SEARCH & DATE FILTER (TIMEZONE FIXED) ==================== */
  const filteredRecords = records.filter((record) => {
    // 1. Search Logic
    const matchesSearch = (record.Resident_Name || `${record.First_Name} ${record.Last_Name}`)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // 2. Date Filter Logic (Corrected for Local Time)
    let recordDateLocal = null;
    if (record.Date_Visited) {
      // en-CA is a trick to get YYYY-MM-DD in local time
      recordDateLocal = new Date(record.Date_Visited).toLocaleDateString('en-CA');
    }
    const matchesDate = !selectedDate || recordDateLocal === selectedDate;

    return matchesSearch && matchesDate;
  });

  if (showForm) {
    return (
      <div className="dashboard-container d-flex">
        <div className="main-wrapper flex-grow-1 bg-light d-flex flex-column">
          <main className="flex-grow-1 main-content">
            <HeaderBanner onAcceptResident={handleAcceptResident} onLogout={onLogout} />
            <HealthForm onCancel={handleCancelForm} onSubmit={handleSubmitForm} editMode={!!editingRecord?.Health_Record_ID} initialData={editingRecord} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container d-flex">
      <div className="main-wrapper flex-grow-1 bg-light d-flex flex-column">
        <main className="flex-grow-1 main-content">
          <HeaderBanner onAcceptResident={handleAcceptResident} onLogout={onLogout} />

          <div className="records-page-wrapper">
            <AnimatePresence>
              {showStatus && (
                <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="records-alert-overlay">
                  <div className={`records-alert-content ${statusMessage.type === "delete" ? "alert-delete" : "alert-success"}`}>
                    <div className="alert-icon-circle">{statusMessage.title.includes("EXISTS") ? "⚠️" : statusMessage.type === "delete" ? "🗑️" : "✓"}</div>
                    <div className="alert-text-content">
                      <strong className="alert-title">{statusMessage.title}</strong>
                      <p className="alert-id">Resident ID: <span className="id-badge">{submissionStatus}</span></p>
                      <small className="alert-description">{statusMessage.desc}</small>
                    </div>
                    <button className="alert-close-btn" onClick={() => setShowStatus(false)}>×</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showCalendar && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="calendar-modal-overlay" onClick={handleCloseCalendar}>
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="calendar-header">
                      <h3 className="calendar-title">📅 Search by Date</h3>
                      <button className="calendar-close-btn" onClick={handleCloseCalendar}><X size={20} /></button>
                    </div>
                    <div className="calendar-input-wrapper">
                      <label className="calendar-input-label">Select Date</label>
                      <input type="date" className="calendar-date-input" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} />
                      {selectedDate && (
                        <button className="btn btn-sm btn-link text-danger mt-2" onClick={() => setSelectedDate("")} style={{ textDecoration: 'none', fontSize: '0.8rem' }}>
                          Clear Date Filter
                        </button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="records-header">
              <div className="header-content">
                <div className="header-text">
                  <h2 className="records-title">PATIENT RECORDS</h2>
                  <p className="records-subtitle"><Activity size={16} className="me-1" />Comprehensive Health Records Management</p>
                </div>
                <button onClick={handleAddNewRecord} className="btn-add-record"><Plus size={20} /> Add New Record</button>
              </div>
            </div>

            <div className="records-stats">
              <div className="stat-box">
                <div className="stat-icon stat-icon-warning"><User size={24} /></div>
                <div className="stat-info">
                  <h3 className="stat-value">{pendingCount}</h3>
                  <p className="stat-label">Pending Approvals</p>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon stat-icon-success"><Activity size={24} /></div>
                <div className="stat-info">
                  <h3 className="stat-value">{records.length}</h3>
                  <p className="stat-label">Total Records</p>
                </div>
              </div>
              <div className="stat-box" style={{ cursor: 'pointer' }} onClick={handleOpenCalendar}>
                <div className="stat-icon stat-icon-info"><Calendar size={24} /></div>
                <div className="stat-info">
                  <h3 className="stat-value">
                    {selectedDate ? new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "All Dates"}
                  </h3>
                  <p className="stat-label">{selectedDate ? "Filtered View" : "Filter by Date"}</p>
                </div>
              </div>
            </div>

            <div className="search-section">
              <div className="search-container">
                <Search className="search-icon-input" size={20} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="search-clear"
                    onClick={() => setSearchTerm("")}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="records-table-container">
              <div className="table-card">
                {loading ? (
                  <div className="loading-state">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3 text-muted">Loading records...</p>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h4 className="empty-title">No Records Found</h4>
                    <p className="empty-description">{(searchTerm || selectedDate) ? "Try adjusting your filters" : "Start by adding a record"}</p>
                    {selectedDate && <button onClick={() => setSelectedDate("")} className="btn-empty-action mt-2">Clear Date Filter</button>}
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="records-table">
                      <thead>
                        <tr>
                          <th className="th-name">Patient Name</th>
                          <th className="th-center">Age</th>
                          <th className="th-center">Gender</th>
                          <th className="th-center">Last Visit</th>
                          <th className="th-center">Recorded By</th>
                          <th className="th-center">Status</th>
                          <th className="th-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((record) => (
                          <tr key={record.Health_Record_ID} className="table-row">
                            <td className="td-name">
                              <div className="patient-info">
                                <div className="patient-avatar">{(record.Resident_Name || `${record.First_Name} ${record.Last_Name}`).charAt(0).toUpperCase()}</div>
                                <div className="patient-details">
                                  <span className="patient-name">{record.Resident_Name || `${record.First_Name} ${record.Last_Name}`}</span>
                                  <span className="patient-id">ID: {record.Resident_ID}</span>
                                </div>
                              </div>
                            </td>
                            <td className="td-center"><span className="age-badge">{record.Age || calculateAge(record.Birthdate)} yrs</span></td>
                            <td className="td-center"><span className={`gender-badge ${record.Sex === "Male" ? "gender-male" : "gender-female"}`}>{record.Sex}</span></td>
                            <td className="td-center">
                              <span className="visit-date">
                                {record.Date_Visited ? new Date(record.Date_Visited).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not recorded"}
                              </span>
                            </td>
                            <td className="td-center"><span className="recorder-badge">{record.Recorded_By_Name || "Admin"}</span></td>
                            <td className="td-center">
                              <span className={`status-badge ${!record.status || record.status === "Active" ? "status-active" : "status-inactive"}`}>
                                {record.status || "Active"}
                              </span>
                            </td>
                            <td className="td-center">
                              <div className="action-buttons">
                                <button className="btn-action btn-action-edit" onClick={() => handleEditRecord(record)} title="Edit"><Edit size={16} /></button>
                                <button className="btn-action btn-action-delete" onClick={() => handleDeleteRecord(record)} title="Delete"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecordsPage;
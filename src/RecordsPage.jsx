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
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HealthForm from "./HealthForm";
import HeaderBanner from "./HeaderBanner";
import jsPDF from "jspdf"; // Corrected lowercase import
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

  // Helper to get local YYYY-MM-DD
  const getTodayString = () => new Date().toLocaleDateString("en-CA");

  // Calendar Modal States
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showCalendar, setShowCalendar] = useState(false);

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
        setEditingRecord({ ...preFillData, Date_Visited: getTodayString() });
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

  /* ==================== DATA FETCHING ==================== */
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/health-records");
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
      const res = await fetch("http://localhost:5000/api/pending-residents");
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

  /* SOUND LOGIC */
  const playSuccessSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3");
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const playDeleteSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1470/1470-preview.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  /* AGE CALCULATION */
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

  /* HANDLERS */
  const handleOpenCalendar = () => setShowCalendar(true);
  const handleCloseCalendar = () => setShowCalendar(false);
  const handleDateChange = (dateString) => {
    setSelectedDate(dateString);
    setShowCalendar(false);
  };
  const resetToToday = () => setSelectedDate(getTodayString());

  const handleAcceptResident = (residentData) => {
    setEditingRecord({ ...residentData, Date_Visited: getTodayString() });
    setShowForm(true);
  };

  const handleAddNewRecord = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEditRecord = (record) => {
    // Override old date with today's date for current session
    setEditingRecord({ ...record, Date_Visited: getTodayString() });
    setShowForm(true);
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

    setStatusMessage({
      title: editMode ? "Record Updated!" : "Record Created!",
      desc: editMode ? "Entry synchronized for today." : "Saved to the health system.",
      type: "success",
    });

    setSubmissionStatus(formData.Resident_ID);
    setShowStatus(true);
    playSuccessSound();
    fetchRecords();
    fetchPendingCount();
    setShowForm(false);
  };

  const handleDeleteRecord = async (record) => {
    if (!window.confirm(`Delete record for ID: ${record.Resident_ID}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/health-records/${record.Health_Record_ID}?admin_username=${localStorage.getItem("username") || "Admin"}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStatusMessage({ title: "Record Deleted", desc: "Removed from system.", type: "delete" });
        setShowStatus(true);
        playDeleteSound();
        fetchRecords();
      }
    } catch (err) { console.error(err); }
  };

  /* ==================== FILTER LOGIC ==================== */
  const filteredRecords = records.filter((record) => {
    const fullName = (record.Resident_Name || `${record.First_Name} ${record.Last_Name}`).toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());

    let matchesDate = false;
    if (record.Date_Visited) {
      const d = new Date(record.Date_Visited);
      const recordDateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      matchesDate = recordDateString === selectedDate;
    }
    return matchesSearch && matchesDate;
  });

  if (showForm) {
    return (
      <div className="dashboard-container d-flex">
        <div className="main-wrapper flex-grow-1 bg-light d-flex flex-column">
          <main className="flex-grow-1 main-content">
            <HeaderBanner onAcceptResident={handleAcceptResident} onLogout={onLogout} />
            <HealthForm
              onCancel={() => setShowForm(false)}
              onSubmit={handleSubmitForm}
              editMode={!!editingRecord?.Health_Record_ID}
              initialData={editingRecord}
            />
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
            {/* Status Alert */}
            <AnimatePresence>
              {showStatus && (
                <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="records-alert-overlay">
                  <div className={`records-alert-content ${statusMessage.type === "delete" ? "alert-delete" : "alert-success"}`}>
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

            {/* Calendar Modal */}
            <AnimatePresence>
              {showCalendar && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="calendar-modal-overlay" onClick={handleCloseCalendar}>
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="calendar-header">
                      <h3 className="calendar-title">📅 Select Visit Date</h3>
                      <button className="calendar-close-btn" onClick={handleCloseCalendar}><X size={20} /></button>
                    </div>
                    <div className="calendar-input-wrapper">
                      <input type="date" className="calendar-date-input" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} />
                    
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="records-header">
              <div className="header-content">
                <div className="header-text">
                  <h2 className="records-title">PATIENT RECORDS</h2>
                  <p className="records-subtitle">
                    <Activity size={16} className="me-1" />
                    Managing {records.length} Total Lifetime Records
                  </p>
                </div>
                <button onClick={handleAddNewRecord} className="btn-add-record"><Plus size={20} /> Add New Record</button>
              </div>
            </div>

            {/* STATS SECTION */}
            <div className="records-stats">
              <div className="stat-box">
                <div className="stat-icon stat-icon-warning"><User size={24} /></div>
                <div className="stat-info">
                  <h3 className="stat-value">{pendingCount}</h3>
                  <p className="stat-label">Pending Approvals</p>
                </div>
              </div>
              
              {/* FIXED: DYNAMIC TOTAL BASED ON DATE */}
              <div className="stat-box">
                <div className="stat-icon stat-icon-success"><Activity size={24} /></div>
                <div className="stat-info">
                  <h3 className="stat-value">{filteredRecords.length}</h3>
                  <p className="stat-label">Records for this Date</p>
                </div>
              </div>

              <div className="stat-box" onClick={handleOpenCalendar} style={{ cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                <div className="stat-icon stat-icon-info"><Calendar size={24} /></div>
                <div className="stat-info">
                  <h3 className="stat-value" style={{ fontSize: '1.1rem' }}>
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </h3>
                  <p className="stat-label">Change Filter Date</p>
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
                {searchTerm && <button className="search-clear" onClick={() => setSearchTerm("")}>×</button>}
              </div>
            </div>

            <div className="records-table-container">
              <div className="table-card">
                {loading ? (
                  <div className="loading-state text-center p-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3 text-muted">Loading records...</p>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="empty-state text-center p-5">
                    <div className="empty-icon" style={{fontSize: '3rem'}}>📋</div>
                    <h4 className="empty-title">No Records Found</h4>
                    <p className="empty-description">No entries for {new Date(selectedDate + "T00:00:00").toLocaleDateString()}.</p>
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
                                <div className="patient-avatar">{(record.Resident_Name || record.First_Name).charAt(0)}</div>
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
                                    {new Date(record.Date_Visited).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                            </td>
                            <td className="td-center"><span className="recorder-badge">{record.Recorded_By_Name || "Admin"}</span></td>
                            <td className="td-center"><span className="status-badge status-active">Active</span></td>
                            <td className="td-center">
                              <div className="action-buttons">
                                <button className="btn-action btn-action-edit" onClick={() => handleEditRecord(record)}><Edit size={16} /></button>
                                <button className="btn-action btn-action-delete" onClick={() => handleDeleteRecord(record)}><Trash2 size={16} /></button>
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
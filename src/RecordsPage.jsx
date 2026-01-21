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
import jsPDF from "jspdf";
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

  // NEW: State to track if the date filter is actually active
  const [selectedDate, setSelectedDate] = useState(""); // Empty means "Show All"
  const [showCalendar, setShowCalendar] = useState(false);

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
      if (onSubmitSuccess) onSubmitSuccess();
    }
  }, [autoOpenForm, preFillData, onSubmitSuccess]);

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

  /* SOUND LOGIC & UTILS */
  const playSuccessSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3");
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  /* HANDLERS */
  const handleOpenCalendar = () => setShowCalendar(true);
  const handleCloseCalendar = () => setShowCalendar(false);
  const handleDateChange = (dateString) => {
    setSelectedDate(dateString);
    setShowCalendar(false);
  };
  const clearDateFilter = () => setSelectedDate(""); // Reset to Show All

  const handleAddNewRecord = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord({ ...record, Date_Visited: getTodayString() });
    setShowForm(true);
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
        fetchRecords();
      }
    } catch (err) { console.error(err); }
  };

  const handleSubmitForm = async (formData, editMode) => {
    setStatusMessage({
      title: editMode ? "Record Updated!" : "Record Created!",
      desc: editMode ? "Entry synchronized for today." : "Saved to the health system.",
      type: "success",
    });
    setSubmissionStatus(formData.Resident_ID);
    setShowStatus(true);
    playSuccessSound();
    fetchRecords();
    setShowForm(false);
  };

  /* ==================== FILTER LOGIC ==================== */
  const filteredRecords = records.filter((record) => {
    const fullName = (record.Resident_Name || `${record.First_Name} ${record.Last_Name}`).toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());

    // If selectedDate is empty, allow all dates. Otherwise, check match.
    let matchesDate = true; 
    if (selectedDate !== "" && record.Date_Visited) {
      const d = new Date(record.Date_Visited);
      const recordDateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      matchesDate = recordDateString === selectedDate;
    } else if (selectedDate !== "" && !record.Date_Visited) {
        matchesDate = false;
    }

    return matchesSearch && matchesDate;
  });

  if (showForm) {
    return (
      <div className="dashboard-container d-flex">
        <div className="main-wrapper flex-grow-1 bg-light d-flex flex-column">
          <main className="flex-grow-1 main-content">
            <HeaderBanner onLogout={onLogout} />
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
          <HeaderBanner onLogout={onLogout} />

          <div className="records-page-wrapper">
            {/* Calendar Modal */}
            <AnimatePresence>
              {showCalendar && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="calendar-modal-overlay" onClick={handleCloseCalendar}>
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="calendar-header">
                      <h3 className="calendar-title">📅 Filter by Visit Date</h3>
                      <button className="calendar-close-btn" onClick={handleCloseCalendar}><X size={20} /></button>
                    </div>
                    <div className="calendar-input-wrapper p-3">
                      <input type="date" className="calendar-date-input" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} />
                      <button className="btn btn-outline-secondary w-100 mt-2" onClick={clearDateFilter}>Show All Records</button>
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
                    Displaying {selectedDate ? "Filtered" : "All"} Records
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
              
              <div className="stat-box">
                <div className="stat-icon stat-icon-success"><Activity size={24} /></div>
                <div className="stat-info">
                  <h3 className="stat-value">{filteredRecords.length}</h3>
                  <p className="stat-label">{selectedDate ? "Found for this Date" : "Total Lifetime Records"}</p>
                </div>
              </div>

              <div className="stat-box" onClick={handleOpenCalendar} style={{ cursor: 'pointer', border: selectedDate ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}>
                <div className="stat-icon stat-icon-info"><Calendar size={24} /></div>
                <div className="stat-info">
                  <h3 className="stat-value" style={{ fontSize: '1.1rem' }}>
                    {selectedDate 
                      ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "All Time"}
                  </h3>
                  <p className="stat-label">Filter: {selectedDate ? "Active" : "None"}</p>
                </div>
                {selectedDate && <X size={16} className="ms-2 text-danger" onClick={(e) => { e.stopPropagation(); clearDateFilter(); }} />}
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
              </div>
            </div>

            <div className="records-table-container">
              <div className="table-card">
                {loading ? (
                  <div className="loading-state text-center p-5">Loading...</div>
                ) : filteredRecords.length === 0 ? (
                  <div className="empty-state text-center p-5">
                    <h4>No Records Found</h4>
                    <button className="btn btn-link" onClick={clearDateFilter}>Clear all filters</button>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="records-table">
                      <thead>
                        <tr>
                          <th>Patient Name</th>
                          <th className="th-center">Age</th>
                          <th className="th-center">Gender</th>
                          <th className="th-center">Visit Date</th>
                          <th className="th-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((record) => (
                          <tr key={record.Health_Record_ID} className="table-row">
                            <td className="td-name">
                              <span className="patient-name">{record.Resident_Name || `${record.First_Name} ${record.Last_Name}`}</span>
                              <br /><small className="text-muted">ID: {record.Resident_ID}</small>
                            </td>
                            <td className="td-center">{calculateAge(record.Birthdate)} yrs</td>
                            <td className="td-center">{record.Sex}</td>
                            <td className="td-center">
                               {record.Date_Visited ? new Date(record.Date_Visited).toLocaleDateString() : "N/A"}
                            </td>
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
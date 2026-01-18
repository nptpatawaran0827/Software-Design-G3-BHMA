import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Calendar, User, Activity } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import HealthForm from './HealthForm'; 
import './style/RecordsPage.css';


const RecordsPage = ({ autoOpenForm = false, preFillData = null, onSubmitSuccess }) => {
 
  /* ==================== STATE MANAGEMENT ==================== */
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);


  // Unified Notification States
  const [showStatus, setShowStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ title: '', desc: '', type: 'success' });
  const [submissionStatus, setSubmissionStatus] = useState('');


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
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio interaction required", e));
  };


  const playDeleteSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1470/1470-preview.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log("Audio interaction required", e));
  };


  /* ==================== HELPER: CALCULATE AGE ==================== */
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
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
      const res = await fetch('http://localhost:5000/api/health-records');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/pending-residents');
      if (!res.ok) throw new Error('Failed to fetch pending residents');
      const data = await res.json();
      setPendingCount(data.length);
    } catch (err) {
      console.error('Failed to fetch pending count:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchPendingCount();
    
    const interval = setInterval(() => {
      fetchPendingCount();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);


  /* ==================== CRUD OPERATIONS ==================== */
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
        setSubmissionStatus(formData.Resident_ID || 'EXISTING');
        setStatusMessage({
          title: "RECORD ALREADY EXISTS",
          desc: `"${formData.First_Name} ${formData.Last_Name}" is already in the system.`,
          type: "delete" 
        });
        setShowStatus(true);
        playDeleteSound();
        return;
    }

    setSubmissionStatus(formData.Resident_ID);
    setStatusMessage({
      title: editMode ? 'Record Updated!' : 'Record Created!',
      desc: editMode ? 'Changes have been synchronized.' : 'The new health record has been saved.',
      type: 'success'
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
    const adminUsername = localStorage.getItem('username') || 'Admin';


    try {
      const res = await fetch(`http://localhost:5000/api/health-records/${recordId}?admin_username=${adminUsername}`, {
        method: 'DELETE'
      });
     
      if (res.ok) {
        setSubmissionStatus(residentId);
        setStatusMessage({
          title: 'Record Deleted',
          desc: 'The health record was removed from the system.',
          type: 'delete'
        });
       
        setShowStatus(true);
        playDeleteSound();
        fetchRecords();
        fetchPendingCount();
      }
    } catch (err) {
      setError('Failed to delete record.');
    }
  };


  /* ==================== SEARCH FILTER ==================== */
  const filteredRecords = records.filter(record =>
    (record.Resident_Name || `${record.First_Name} ${record.Last_Name}`)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );


  if (showForm) {
    return (
      <HealthForm
        onCancel={handleCancelForm}
        onSubmit={handleSubmitForm}
        editMode={!!editingRecord?.Health_Record_ID}
        initialData={editingRecord}
      />
    );
  }


  return (
    <div className="records-page-wrapper">
      {/* Status Notification */}
      <AnimatePresence>
        {showStatus && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="records-alert-overlay"
          >
            <div className={`records-alert-content ${statusMessage.type === 'delete' ? 'alert-delete' : 'alert-success'}`}>
              <div className="alert-icon-circle">
                {statusMessage.title.includes("EXISTS") ? '⚠️' : (statusMessage.type === 'delete' ? '🗑️' : '✓')}
              </div>
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

      {/* Header Section */}
      <div className="records-header">
        <div className="header-content">
          <div className="header-text">
            <h2 className="records-title">PATIENT RECORDS</h2>
            <p className="records-subtitle">
              <Activity size={16} className="me-1" />
              Comprehensive Health Records Management
            </p>
          </div>
          <button onClick={handleAddNewRecord} className="btn-add-record">
            <Plus size={20} /> Add New Record
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="records-stats">
        <div className="stat-box">
          <div className="stat-icon stat-icon-warning">
            <User size={24} />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{pendingCount}</h3>
            <p className="stat-label">Pending Approvals</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon stat-icon-success">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{records.length}</h3>
            <p className="stat-label">Total Records</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon stat-icon-info">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h3>
            <p className="stat-label">Today's Date</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <Search className="search-icon-input" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by name, ID, or condition..."
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>
      </div>

      {/* Records Table */}
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
              <p className="empty-description">
                {searchTerm ? 'Try adjusting your search terms' : 'Start by adding a new patient record'}
              </p>
              {!searchTerm && (
                <button onClick={handleAddNewRecord} className="btn-empty-action">
                  <Plus size={18} /> Add First Record
                </button>
              )}
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
                    <tr 
                      key={record.Health_Record_ID}
                      className="table-row"
                    >
                      <td className="td-name">
                        <div className="patient-info">
                          <div className="patient-avatar">
                            {(record.Resident_Name || `${record.First_Name} ${record.Last_Name}`).charAt(0).toUpperCase()}
                          </div>
                          <div className="patient-details">
                            <span className="patient-name">
                              {record.Resident_Name || `${record.First_Name} ${record.Last_Name}`}
                            </span>
                            <span className="patient-id">ID: {record.Resident_ID}</span>
                          </div>
                        </div>
                      </td>
                      <td className="td-center">
                        <span className="age-badge">
                          {record.Age || calculateAge(record.Birthdate)} yrs
                        </span>
                      </td>
                      <td className="td-center">
                        <span className={`gender-badge ${record.Sex === 'Male' ? 'gender-male' : 'gender-female'}`}>
                          {record.Sex}
                        </span>
                      </td>
                      <td className="td-center">
                        <span className="visit-date">
                          {record.Date_Visited ? new Date(record.Date_Visited).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          }) : 'Not recorded'}
                        </span>
                      </td>
                      <td className="td-center">
                        <span className="recorder-badge" data-admin={record.Recorded_By_Name || 'Admin'}>
                          {record.Recorded_By_Name || 'Admin'}
                        </span>
                      </td>
                      <td className="td-center">
                        <span className={`status-badge ${(!record.status || record.status === 'Active') ? 'status-active' : 'status-inactive'}`}>
                          {record.status || 'Active'}
                        </span>
                      </td>
                      <td className="td-center">
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-action-edit" 
                            onClick={() => handleEditRecord(record)}
                            title="Edit Record"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-action btn-action-delete" 
                            onClick={() => handleDeleteRecord(record)}
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
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
  );
};


export default RecordsPage;



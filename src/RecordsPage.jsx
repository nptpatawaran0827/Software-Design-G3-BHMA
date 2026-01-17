import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
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


  // Unified Notification States
  const [showStatus, setShowStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ title: '', desc: '', type: 'success' });
  const [submissionStatus, setSubmissionStatus] = useState('');


  /* ==================== HOME INTEGRATION ==================== */
  useEffect(() => {
    // Automatically trigger form if directed from Home.js
    if (autoOpenForm) {
      if (preFillData) {
        setEditingRecord(preFillData);
      } else {
        setEditingRecord(null);
      }
      setShowForm(true);
    }
  }, [autoOpenForm, preFillData]);


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


  useEffect(() => {
    fetchRecords();
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


  const handleSubmitForm = async (formData) => {
    try {
      const adminId = parseInt(localStorage.getItem('adminId'), 10);
      const adminUsername = localStorage.getItem('username') || 'Admin';
      const isNewRecord = !editingRecord || !editingRecord.Health_Record_ID;
     
      const healthUrl = isNewRecord
        ? 'http://localhost:5000/api/health-records'
        : `http://localhost:5000/api/health-records/${editingRecord.Health_Record_ID}`;
     
      const res = await fetch(healthUrl, {
        method: isNewRecord ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          Recorded_By: adminId,
          adminId: adminId,
          admin_username: adminUsername
        })
      });
     
      if (res.ok) {
        setSubmissionStatus(formData.Resident_ID);
        setStatusMessage({
          title: isNewRecord ? 'Record Created!' : 'Record Updated!',
          desc: isNewRecord ? 'The new health record has been saved.' : 'Changes have been synchronized.',
          type: 'success'
        });
       
        setShowForm(false);
        setEditingRecord(null);
        setShowStatus(true);
        playSuccessSound();


        if (onSubmitSuccess) onSubmitSuccess();
        fetchRecords();
      }
    } catch (err) {
      setError('Failed to save record.');
    }
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
    <div className="records-container p-4">
      {/* UNIFIED OVERLAY NOTIFICATION */}
      <AnimatePresence>
        {showStatus && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`submission-alert-overlay ${statusMessage.type === 'delete' ? 'delete-theme' : ''}`}
          >
            <div className="submission-alert-content shadow-lg">
              <div className={`alert-icon ${statusMessage.type === 'delete' ? 'icon-delete' : ''}`}>
                {statusMessage.type === 'delete' ? '🗑️' : '✓'}
              </div>
              <div className="alert-text">
                <strong>{statusMessage.title}</strong>
                <p>Resident ID: <span className="id-highlight">{submissionStatus}</span></p>
                <small>{statusMessage.desc}</small>
              </div>
              <button className="close-alert" onClick={() => setShowStatus(false)}>×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
     
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div>
          <h2 className="fw-bold mb-1">Patient Records</h2>
          <p className="text-muted small">Manage resident medical check-ups</p>
        </div>
        <button onClick={handleAddNewRecord} className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm">
          <Plus size={18} /> Add Record
        </button>
      </div>


      <div className="px-3 mb-4">
        <div className="search-wrapper shadow-sm">
          <Search className="search-icon" size={20} />
          <input
            type="text" className="form-control custom-search"
            placeholder="Search resident..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
     
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mx-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr className="text-uppercase small fw-bold">
                    <th className="ps-4">Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Last Visit</th>
                    <th>Recorded By</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode='popLayout'>
                    {filteredRecords.map((record) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        key={record.Health_Record_ID}
                        className="align-middle"
                      >
                        <td className="ps-4 fw-bold">{record.Resident_Name || `${record.First_Name} ${record.Last_Name}`}</td>
                        <td>{record.Age || calculateAge(record.Birthdate)} <small className="text-muted">yrs</small></td>
                        <td>{record.Sex}</td>
                        <td>{record.Date_Visited ? new Date(record.Date_Visited).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <span className="badge bg-light text-primary border">
                            {record.Recorded_By_Name || 'Admin'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${(!record.status || record.status === 'Active') ? 'bg-success' : 'bg-secondary'}`}>
                            {record.status || 'Active'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditRecord(record)}><Edit size={14} /></button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRecord(record)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
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



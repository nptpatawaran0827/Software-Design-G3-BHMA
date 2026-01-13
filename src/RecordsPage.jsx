import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Save, Edit, Trash2 } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import HealthForm from './HealthForm'; 
import './style/RecordsPage.css';

const RecordsPage = ({ autoOpenForm = false, preFillData = null }) => {
  
  /* ==================== STATE MANAGEMENT ==================== */
  // UPDATED: Initialize from localStorage to survive reloads
  const [showForm, setShowForm] = useState(() => {
    return localStorage.getItem('isHealthFormOpen') === 'true';
  });

  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UPDATED: Initialize editingRecord from localStorage if it exists
  const [editingRecord, setEditingRecord] = useState(() => {
    const saved = localStorage.getItem('currentlyEditingRecord');
    return saved ? JSON.parse(saved) : null;
  });

  /* ==================== MEMORY PERSISTENCE ==================== */
  // NEW: Save states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('isHealthFormOpen', showForm);
    if (editingRecord) {
      localStorage.setItem('currentlyEditingRecord', JSON.stringify(editingRecord));
    } else {
      localStorage.removeItem('currentlyEditingRecord');
    }
  }, [showForm, editingRecord]);

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
      setError('Could not connect to the server. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  /* ==================== AUTO-OPEN LOGIC ==================== */
  useEffect(() => {
    if (autoOpenForm) {
      if (preFillData) {
        setEditingRecord(preFillData);
        setShowForm(true);
      } else if (records.length > 0) {
        setEditingRecord(records[0]);
        setShowForm(true);
      }
    }
  }, [autoOpenForm, preFillData, records.length]);

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
    // NEW: Explicitly clear memory on cancel
    localStorage.removeItem('isHealthFormOpen');
    localStorage.removeItem('currentlyEditingRecord');
  };

  const handleSubmitForm = async (formData) => {
    try {
      const adminId = parseInt(localStorage.getItem('adminId'), 10);
      if (!adminId) {
        setError('Admin ID not found. Please log in again.');
        return;
      }
      
      const isNewRecord = !editingRecord || !editingRecord.Health_Record_ID;
      
      const residentUrl = isNewRecord 
        ? `http://localhost:5000/api/residents`
        : `http://localhost:5000/api/residents/${formData.Resident_ID}`;

      const resUpdate = await fetch(residentUrl, {
        method: isNewRecord ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!resUpdate.ok) throw new Error('Failed to save resident info');

      const healthUrl = isNewRecord
        ? 'http://localhost:5000/api/health-records'
        : `http://localhost:5000/api/health-records/${editingRecord.Health_Record_ID}`;
      
      const res = await fetch(healthUrl, {
        method: isNewRecord ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, Recorded_By: adminId })
      });
      
      if (res.ok) {
        setShowForm(false);
        setEditingRecord(null);
        // NEW: Clear memory on success
        localStorage.removeItem('isHealthFormOpen');
        localStorage.removeItem('currentlyEditingRecord');
        fetchRecords(); 
      }
    } catch (err) {
      setError('Failed to save record.');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/health-records/${recordId}`, { method: 'DELETE' });
      if (res.ok) fetchRecords();
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

  /* ==================== RENDER FORM VIEW ==================== */
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

  /* ==================== RENDER TABLE VIEW ==================== */
  return (
    <div className="records-container p-4">
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
      
      {error && (
        <div className="alert alert-danger mx-3" role="alert">{error}</div>
      )}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mx-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
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
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-5 text-muted">No records found.</td></tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={record.Health_Record_ID} 
                        className="align-middle"
                      >
                        <td className="ps-4 fw-bold">
                          {record.Resident_Name || `${record.First_Name} ${record.Last_Name}`}
                        </td>
                        <td>{record.Age || calculateAge(record.Birthdate)} <small className="text-muted">yrs</small></td>
                        <td>{record.Sex}</td>
                        <td>{record.Date_Visited ? new Date(record.Date_Visited).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <span className="badge bg-light text-primary border">
                            {record.Recorded_By_Name || 'Unknown Admin'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${(!record.status || record.status === 'Active') ? 'bg-success' : 'bg-secondary'}`}>
                            {record.status || 'Active'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditRecord(record)}>
                              <Edit size={14} className="me-1" /> Edit
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRecord(record.Health_Record_ID)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
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
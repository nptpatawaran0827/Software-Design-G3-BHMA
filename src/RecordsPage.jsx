import React, { useState, useEffect } from 'react';
import HealthForm from './HealthForm';

const RecordsPage = ({ autoOpenForm = false, preFillData = null }) => {
  
  /* ==================== STATE MANAGEMENT ==================== */
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

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
      setLoading(false);
    } catch (err) {
      setError('Could not connect to the server. Please check if the backend is running.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  /* ==================== AUTO-OPEN FORM LOGIC ==================== */
  useEffect(() => {
    if (autoOpenForm) {
      if (preFillData) {
        setEditingRecord(preFillData);
        setShowForm(true);
      } else {
        fetch('http://localhost:5000/api/health-records')
          .then(res => res.json())
          .then(data => {
            if (data.length > 0) {
              setEditingRecord(data[0]);
              setShowForm(true);
            }
          });
      }
    }
  }, [autoOpenForm, preFillData]);

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
      
      if (!adminId) {
        setError('Admin ID not found. Please log in again.');
        return;
      }
      
      const isNewRecord = !editingRecord || !editingRecord.Health_Record_ID;
      
      // 1. Update Resident Info
      const residentUrl = isNewRecord 
        ? `http://localhost:5000/api/residents`
        : `http://localhost:5000/api/residents/${formData.Resident_ID}`;

      const residentUpdateRes = await fetch(residentUrl, {
        method: isNewRecord ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!residentUpdateRes.ok) throw new Error('Failed to save resident info');

      // 2. Update/Create Health Record
      const healthUrl = isNewRecord
        ? 'http://localhost:5000/api/health-records'
        : `http://localhost:5000/api/health-records/${editingRecord.Health_Record_ID}`;
      
      const res = await fetch(healthUrl, {
        method: isNewRecord ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          Recorded_By: adminId // This sends the ID to the database
        })
      });
      
      if (res.ok) {
        setShowForm(false);
        setEditingRecord(null);
        fetchRecords(); 
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save record to database.');
    }
  };

  const handleToggleStatus = async (recordId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Not Active' : 'Active';
    try {
      const res = await fetch(`http://localhost:5000/api/health-records/${recordId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchRecords();
    } catch (err) {
      setError('Failed to update status in database.');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/health-records/${recordId}`, { 
        method: 'DELETE' 
      });
      if (res.ok) fetchRecords();
    } catch (err) {
      setError('Failed to delete record from database.');
    }
  };

  if (showForm) {
    return (
      <HealthForm 
        onCancel={handleCancelForm} 
        onSubmit={handleSubmitForm}
        editMode={!!editingRecord?.Health_Record_ID}
        initialData={editingRecord}
        onToggleStatus={(id) => handleToggleStatus(id, editingRecord?.status)}
      />
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Patient Records</h3>
        <button 
          className="btn btn-success fw-bold px-4 rounded-3" 
          onClick={handleAddNewRecord}
          disabled={loading}
        >
          <i className="bi bi-plus-lg me-2"></i>Add New Record
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} />
        </div>
      )}
      
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
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
                  {records.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-5 text-muted">No health records found.</td></tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.Health_Record_ID} className="align-middle">
                        <td className="ps-4 fw-bold text-dark">
                          {record.Resident_Name || `${record.First_Name} ${record.Last_Name}`}
                        </td>
                        <td>
                          <span className="fw-semibold">
                            {record.Age || calculateAge(record.Birthdate)}
                          </span>
                          <small className="text-muted ms-1">yrs</small>
                        </td>
                        <td>{record.Sex}</td>
                        <td>{record.Date_Visited ? new Date(record.Date_Visited).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          {/* UPDATED: Displays the Admin Username from the JOIN */}
                          <span className="badge bg-light text-primary border">
                            <i className="bi bi-person-badge me-1"></i>
                            {record.Recorded_By_Name || 'Unknown Admin'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${record.status === 'Active' ? 'bg-success-subtle text-success border border-success' : 'bg-secondary-subtle text-secondary border border-secondary'}`}>
                            {record.status || 'Active'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditRecord(record)}>
                              <i className="bi bi-pencil"></i> Edit
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRecord(record.Health_Record_ID)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
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
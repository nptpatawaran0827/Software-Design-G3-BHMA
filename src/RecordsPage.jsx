import React, { useState, useEffect } from 'react';
import HealthForm from './HealthForm';

const RecordsPage = ({ autoOpenForm = false, preFillData = null }) => {
  
  /* ==================== STATE MANAGEMENT ==================== */
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

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

 /* ==================== AUTO-OPEN FORM LOGIC WITH PREFILL ==================== */
useEffect(() => {
  if (autoOpenForm) {
    if (preFillData) {
      // Check if this is a newly accepted record (has Health_Record_ID)
      setEditingRecord(preFillData);
      setShowForm(true);
    } else {
      // Otherwise fetch the last record
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
    // Get admin_id from localStorage (set during login) and convert to number
    const adminId = parseInt(localStorage.getItem('adminId'), 10);
    
    if (!adminId) {
      setError('Admin ID not found. Please log in again.');
      return;
    }
    
    // First, update the resident table with contact info AND birthdate
    const residentUpdateRes = await fetch(`http://localhost:5000/api/residents/${formData.Resident_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        First_Name: formData.First_Name,
        Middle_Name: formData.Middle_Name,
        Last_Name: formData.Last_Name,
        Sex: formData.Sex,
        Civil_Status: formData.Civil_Status,
        Birthdate: formData.Birthdate,
        Contact_Number: formData.Contact_Number,
        Street: formData.Street,
        Barangay: formData.Barangay
      })
    });

    if (!residentUpdateRes.ok) {
      throw new Error('Failed to update resident info');
    }

    // Then, save/update health record with admin_id
    const url = editingRecord 
      ? `http://localhost:5000/api/health-records/${editingRecord.Health_Record_ID}`
      : 'http://localhost:5000/api/health-records';
    
    const res = await fetch(url, {
      method: editingRecord ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        Recorded_By: adminId  // ← SEND ADMIN ID AS NUMBER
      })
    });
    
    if (res.ok) {
      setShowForm(false);
      setEditingRecord(null);
      fetchRecords(); // Refresh table from DB
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

  /* ==================== CONDITIONAL RENDERING ==================== */
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


  /* ==================== TABLE VIEW (CSS RESTORED) ==================== */
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
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          />
        </div>
      )}
      
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading records...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Last Visit</th>
                    <th>Recorded By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <div>
                          <svg className="mb-3" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z"/>
                          </svg>
                          <p className="mb-0">No health records found.</p>
                          <p className="small">Click "Add New Record" to create your first record.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.Health_Record_ID}>
                        <td className="fw-medium">{record.Resident_Name}</td>
                        <td>{record.Age}</td>
                        <td>{record.Sex}</td>
                        <td>
                          {record.Date_Visited ? 
                            new Date(record.Date_Visited).toLocaleDateString() : 
                            'N/A'
                          }
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {record.Recorded_By_Name}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            record.status === 'Active' ? 'bg-success' : 'bg-secondary'
                          }`}>
                            {record.status || 'Active'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => handleEditRecord(record)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteRecord(record.Health_Record_ID)}
                          >
                            Delete
                          </button>
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
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
      
      // We update the resident entry if editingRecord has a Health_Record_ID; otherwise, we create a new resident entry, including pending conversions.
      const isNewResident = !editingRecord || (!editingRecord.Health_Record_ID && !editingRecord.Resident_ID);
      
      const residentMethod = (editingRecord && editingRecord.Health_Record_ID) ? 'PUT' : 'POST';
      const residentUrl = (editingRecord && editingRecord.Health_Record_ID)
        ? `http://localhost:5000/api/residents/${formData.Resident_ID}`
        : `http://localhost:5000/api/residents`;

      const residentUpdateRes = await fetch(residentUrl, {
        method: residentMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!residentUpdateRes.ok) {
        throw new Error('Failed to save resident info');
      }

      const url = (editingRecord && editingRecord.Health_Record_ID)
        ? `http://localhost:5000/api/health-records/${editingRecord.Health_Record_ID}`
        : 'http://localhost:5000/api/health-records';
      
      const res = await fetch(url, {
        method: (editingRecord && editingRecord.Health_Record_ID) ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          Recorded_By: adminId
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
      
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Name</th><th>Age</th><th>Gender</th><th>Last Visit</th><th>Recorded By</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-5 text-muted">No health records found.</td></tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.Health_Record_ID}>
                        <td className="fw-medium">{record.Resident_Name}</td>
                        <td>{record.Age}</td>
                        <td>{record.Sex}</td>
                        <td>{record.Date_Visited ? new Date(record.Date_Visited).toLocaleDateString() : 'N/A'}</td>
                        <td><span className="badge bg-info">{record.Recorded_By_Name}</span></td>
                        <td>
                          <span className={`badge ${record.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                            {record.status || 'Active'}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEditRecord(record)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRecord(record.Health_Record_ID)}>Delete</button>
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
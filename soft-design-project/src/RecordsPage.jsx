import React, { useState, useEffect } from 'react';
import HealthForm from './HealthForm';


const RecordsPage = ({ autoOpenForm = false }) => {
  
  /* ==================== STATE MANAGEMENT ==================== */
  
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  /* ==================== AUTO-OPEN FORM LOGIC ==================== */
  
  useEffect(() => {
    if (autoOpenForm) {
      handleAddNewRecord();
    }
  }, [autoOpenForm]);

  /* ==================== DATA FETCHING ==================== */
  
  useEffect(() => {
    // TODO: Replace with actual API call to fetch records
    const simulateLoading = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(simulateLoading);
  }, []);

  /* ==================== CRUD OPERATIONS ==================== */
  
  /**
   * Handle Add New Record Button
   * Opens form in "create" mode
   */
  const handleAddNewRecord = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  /**
   * Handle Edit Record Button
   * Opens form in "edit" mode with pre-filled data
   */
  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  /**
   * Handle Cancel Form
   * Returns to table view and clears editing state
   */
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  /**
   * Handle Form Submission
   * Handles both creating and updating records
   */
  const handleSubmitForm = async (formData) => {
    try {
      if (editingRecord) {
        // UPDATE MODE
        setRecords(prevRecords =>
          prevRecords.map(record =>
            record.id === formData.id ? formData : record
          )
        );
        console.log('Record updated:', formData);
      } else {
        // CREATE MODE
        const newRecord = {
          ...formData,
          id: Date.now(),
          status: 'Active'
        };
        setRecords(prevRecords => [...prevRecords, newRecord]);
        console.log('Record created:', newRecord);
      }
      
      setShowForm(false);
      setEditingRecord(null);
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save record. Please try again.');
    }
  };

  /**
   * Handle Toggle Status
   */
  const handleToggleStatus = async (recordId, newStatus) => {
    try {
      setRecords(prevRecords =>
        prevRecords.map(record =>
          record.id === recordId ? { ...record, status: newStatus } : record
        )
      );
      
      if (editingRecord && editingRecord.id === recordId) {
        setEditingRecord(prev => ({ ...prev, status: newStatus }));
      }
      
      console.log(`Record ${recordId} status changed to: ${newStatus}`);
      
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  /**
   * Handle Delete Record
   */
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }
    
    try {
      setRecords(prevRecords =>
        prevRecords.filter(record => record.id !== recordId)
      );
      console.log(`Record ${recordId} deleted`);
      
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record. Please try again.');
    }
  };

  /* ==================== CONDITIONAL RENDERING ==================== */
  
  if (showForm) {
    return (
      <HealthForm 
        onCancel={handleCancelForm} 
        onSubmit={handleSubmitForm}
        editMode={!!editingRecord}
        initialData={editingRecord}
        onToggleStatus={handleToggleStatus}
      />
    );
  }

  /* ==================== TABLE VIEW ==================== */
  
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
            aria-label="Close"
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
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <div>
                          <svg 
                            className="mb-3" 
                            width="48" 
                            height="48" 
                            fill="currentColor" 
                            viewBox="0 0 16 16"
                          >
                            <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z"/>
                          </svg>
                          <p className="mb-0">No health records found.</p>
                          <p className="small">Click "Add New Record" to create your first record.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id}>
                        <td className="fw-medium">{record.residentName}</td>
                        <td>{record.age}</td>
                        <td>{record.sex}</td>
                        <td>
                          {record.dateVisited ? 
                            new Date(record.dateVisited).toLocaleDateString() : 
                            'N/A'
                          }
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
                            title="Edit record"
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteRecord(record.id)}
                            title="Delete record"
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
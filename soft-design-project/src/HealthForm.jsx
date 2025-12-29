import React, { useState, useEffect } from 'react';

/**
 * PROPS:
 * @param {Function} onCancel - Callback to return to records table view
 * @param {Function} onSubmit - Callback that receives form data for database submission
 * @param {Boolean} editMode - true if editing existing record, false if creating new
 * @param {Object} initialData - Existing record data (only used in edit mode)
 * @param {Function} onToggleStatus - Callback to toggle Active/Not Active status (edit mode only)
 */
const HealthForm = ({ 
  onCancel, 
  onSubmit, 
  editMode = false, 
  initialData = null,
  onToggleStatus = null 
}) => {
  
  
  const [formData, setFormData] = useState({
    Resident_Name: '',
    Resident_ID: '',
    Age: '',
    Sex: '',
    Civil_Status: '',
    Blood_Pressure: '',
    Weight: '',
    Height: '',
    BMI: '',
    Health_Condition: '',
    Diagnosis: '',
    Allergies: '',
    Contact_Number: '',
    Address: '',
    Date_Visited: '',
    Remarks: ''
  });

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        Resident_Name: initialData.Resident_Name || '',
        Resident_ID: initialData.Resident_ID || '',
        Age: initialData.Age || '',
        Sex: initialData.Sex || '',
        Civil_Status: initialData.Civil_Status || '',
        Blood_Pressure: initialData.Blood_Pressure || '',
        Weight: initialData.Weight || '',
        Height: initialData.Height || '',
        BMI: initialData.BMI || '',
        Health_Condition: initialData.Health_Condition || '',
        Diagnosis: initialData.Diagnosis || '',
        Allergies: initialData.Allergies || '',
        Contact_Number: initialData.Contact_Number || '',
        Address: initialData.Address || '',
        Date_Visited: initialData.Date_Visited || '',
        Remarks: initialData.Remarks || ''
      });
    }
  }, [editMode, initialData]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For fields that should only contain numbers
    if (name === 'Resident_ID' || name === 'Contact_Number') {
      // Remove any non-numeric characters (letters, symbols, spaces, etc.)
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      // For all other fields, accept value as-is
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * Form Submission Handler
   * Handles both creating and updating records
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editMode) {
      // EDIT MODE: Update existing record
      const dataToSubmit = {
        ...formData,
        Health_Record_ID: initialData.Health_Record_ID,
        status: initialData.status,
        Date_Registered: initialData.Date_Registered,
        updatedAt: new Date().toISOString()
      };
      
      onSubmit(dataToSubmit);
    } else {
      // ADD MODE: Create new record
      const dataToSubmit = {
        ...formData,
        Date_Registered: new Date().toISOString(),
        status: 'Active'
      };
      
      onSubmit(dataToSubmit);
    }
  };

  /**
   * Handle Status Toggle
   * Only available in edit mode
   * 
   * CHANGES:
   * - Fixed: Now uses Health_Record_ID (database field name) instead of id
   * - Added: Console logging for debugging
   * - Added: Validation check to ensure onToggleStatus exists before calling
   */
  const handleStatusToggle = () => {
    if (onToggleStatus && initialData) {
      const newStatus = initialData.status === 'Active' ? 'Not Active' : 'Active';
      // FIXED: Use initialData.Health_Record_ID (database field)
      onToggleStatus(initialData.Health_Record_ID, newStatus);
      console.log(`Toggling status for record ${initialData.Health_Record_ID} to: ${newStatus}`); // ADDED: Debug logging
    } else {
      console.error('Cannot toggle status: missing onToggleStatus function or initialData'); // ADDED: Error handling
    }
  };

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">
          {editMode ? 'Edit Health Record' : 'Add New Health Record'}
        </h3>
        <button className="btn btn-secondary" onClick={onCancel}>
          ← Back to Records
        </button>
      </div>

      {/* Status Information Banner (Edit Mode Only) */}
      {editMode && initialData && (
        <div className={`alert ${
          initialData.status === 'Active' ? 'alert-success' : 'alert-secondary'
        } d-flex justify-content-between align-items-center mb-4`}>
          <div>
            <strong>Current Status:</strong> 
            <span className={`badge ms-2 ${
              initialData.status === 'Active' ? 'bg-success' : 'bg-secondary'
            }`}>
              {initialData.status}
            </span>
          </div>
          <button 
            type="button"
            className={`btn btn-sm ${
              initialData.status === 'Active' ? 'btn-outline-danger' : 'btn-outline-success'
            }`}
            onClick={handleStatusToggle}
          >
            {initialData.status === 'Active' ? '✕ Mark as Inactive' : '✓ Mark as Active'}
          </button>
        </div>
      )}

      <div className="card border-0 shadow-sm" style={{ backgroundColor: 'rgba(112, 185, 221, 0.19)' }}>
        <div className="card-body p-4">
          <div className="row g-3">
            
            {/* SECTION 1: Basic Patient Information */}
            
            <div className="col-md-6">
              <label className="form-label">Resident Name</label>
              <input 
                type="text" 
                name="Resident_Name"
                className="form-control"
                value={formData.Resident_Name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Resident ID</label>
              <input 
                type="text" 
                name="Resident_ID"
                className="form-control"
                value={formData.Resident_ID}
                onChange={handleChange}
                required
                placeholder="Enter numeric ID (numbers only)"
                disabled={editMode}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Age</label>
              <input 
                type="number" 
                name="Age"
                className="form-control"
                value={formData.Age}
                onChange={handleChange}
                required
                min="0"
                max="150"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Sex</label>
              <select 
                name="Sex" 
                className="form-select"
                value={formData.Sex}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Civil Status</label>
              <select 
                name="Civil_Status" 
                className="form-select"
                value={formData.Civil_Status}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </select>
            </div>

            {/* SECTION 2: Health Metrics */}

            <div className="col-md-3">
              <label className="form-label">Blood Pressure</label>
              <input 
                type="text" 
                name="Blood_Pressure"
                className="form-control"
                value={formData.Blood_Pressure}
                onChange={handleChange}
                placeholder="e.g., 120/80"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Weight (kg)</label>
              <input 
                type="number" 
                step="0.1"
                name="Weight"
                className="form-control"
                value={formData.Weight}
                onChange={handleChange}
                min="0"
                max="500"
                placeholder="e.g., 65.5"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Height (cm)</label>
              <input 
                type="number" 
                step="0.1"
                name="Height"
                className="form-control"
                value={formData.Height}
                onChange={handleChange}
                min="0"
                max="300"
                placeholder="e.g., 170.5"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">BMI</label>
              <input 
                type="number" 
                step="0.1"
                name="BMI"
                className="form-control"
                value={formData.BMI}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="e.g., 23.5"
              />
            </div>

            <div className="col-md-12">
              <label className="form-label">Health Condition</label>
              <select 
                name="Health_Condition" 
                className="form-select"
                value={formData.Health_Condition}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="With Disability">With Disability</option>
              </select>
            </div>

            {/* SECTION 3: Medical Information */}

            <div className="col-md-6">
              <label className="form-label">Diagnosis</label>
              <input 
                type="text" 
                name="Diagnosis"
                className="form-control"
                value={formData.Diagnosis}
                onChange={handleChange}
                placeholder="Enter diagnosis"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Allergies</label>
              <input 
                type="text" 
                name="Allergies"
                className="form-control"
                value={formData.Allergies}
                onChange={handleChange}
                placeholder="List any allergies (comma-separated)"
              />
            </div>

            {/* SECTION 4: Contact Information */}

            <div className="col-md-6">
              <label className="form-label">Contact Number</label>
              <input 
                type="text" 
                name="Contact_Number"
                className="form-control"
                value={formData.Contact_Number}
                onChange={handleChange}
                placeholder="e.g., 09123456789"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="11"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Address</label>
              <input 
                type="text" 
                name="Address"
                className="form-control"
                value={formData.Address}
                onChange={handleChange}
                placeholder="Enter complete address"
              />
            </div>

            {/* SECTION 5: Date Information */}

            <div className="col-md-6">
              <label className="form-label">Date Visited</label>
              <input 
                type="date" 
                name="Date_Visited"
                className="form-control"
                value={formData.Date_Visited}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label text-muted">Date Registered</label>
              <input 
                type="text" 
                className="form-control bg-light" 
                value={
                  editMode && initialData?.Date_Registered 
                    ? new Date(initialData.Date_Registered).toLocaleDateString()
                    : "Auto-generated on submission"
                }
                disabled
                readOnly
              />
            </div>

            {/* SECTION 6: Additional Notes */}

            <div className="col-12">
              <label className="form-label">Remarks / Notes</label>
              <textarea 
                name="Remarks"
                className="form-control"
                value={formData.Remarks}
                onChange={handleChange}
                rows="4"
                placeholder="Health worker notes, observations, recommendations..."
              />
            </div>

            {/* Action Buttons */}
            <div className="col-12 d-flex gap-2 justify-content-end mt-3">
              <button 
                type="button" 
                className="btn btn-secondary px-4"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary px-4"
                onClick={handleSubmit}
              >
                {editMode ? 'Update Record' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default HealthForm;
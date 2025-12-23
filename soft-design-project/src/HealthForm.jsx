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
  
  /**
   * Form State Management
   * Initializes with either empty values (add mode) or existing data (edit mode)
   */
  const [formData, setFormData] = useState({
    residentName: '',
    residentId: '',
    age: '',
    sex: '',
    civilStatus: '',
    bloodPressure: '',
    bmi: '',
    healthCondition: '',
    diagnostic: '',
    allergies: '',
    contactNumber: '',
    address: '',
    dateVisited: '',
    remarks: ''
  });

  /**
   * Pre-fill form when in edit mode
   * This effect runs when initialData changes
   */
  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        residentName: initialData.residentName || '',
        residentId: initialData.residentId || '',
        age: initialData.age || '',
        sex: initialData.sex || '',
        civilStatus: initialData.civilStatus || '',
        bloodPressure: initialData.bloodPressure || '',
        bmi: initialData.bmi || '',
        healthCondition: initialData.healthCondition || '',
        diagnostic: initialData.diagnostic || '',
        allergies: initialData.allergies || '',
        contactNumber: initialData.contactNumber || '',
        address: initialData.address || '',
        dateVisited: initialData.dateVisited || '',
        remarks: initialData.remarks || ''
      });
    }
  }, [editMode, initialData]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For fields that should only contain numbers
    if (name === 'residentId' || name === 'contactNumber') {
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
   * Handles both creating new records and updating existing ones
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editMode) {
      // EDIT MODE: Update existing record
      const dataToSubmit = {
        ...formData,
        id: initialData.id,
        status: initialData.status,
        dateRegistered: initialData.dateRegistered,
        updatedAt: new Date().toISOString()
      };
      
      onSubmit(dataToSubmit);
    } else {
      // ADD MODE: Create new record
      const dataToSubmit = {
        ...formData,
        dateRegistered: new Date().toISOString(),
        status: 'Active'
      };
      
      onSubmit(dataToSubmit);
    }
  };

  /**
   * Handle Status Toggle
   * Only available in edit mode
   */
  const handleStatusToggle = () => {
    if (onToggleStatus && initialData) {
      const newStatus = initialData.status === 'Active' ? 'Not Active' : 'Active';
      onToggleStatus(initialData.id, newStatus);
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
                name="residentName"
                className="form-control"
                value={formData.residentName}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Resident ID</label>
              <input 
                type="text" 
                name="residentId"
                className="form-control"
                value={formData.residentId}
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
                name="age"
                className="form-control"
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
                max="150"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Sex</label>
              <select 
                name="sex" 
                className="form-select"
                value={formData.sex}
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
                name="civilStatus" 
                className="form-select"
                value={formData.civilStatus}
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

            <div className="col-md-4">
              <label className="form-label">Blood Pressure</label>
              <input 
                type="text" 
                name="bloodPressure"
                className="form-control"
                value={formData.bloodPressure}
                onChange={handleChange}
                placeholder="e.g., 120/80"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">BMI</label>
              <input 
                type="number" 
                step="0.1"
                name="bmi"
                className="form-control"
                value={formData.bmi}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="e.g., 23.5"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Health Condition</label>
              <select 
                name="healthCondition" 
                className="form-select"
                value={formData.healthCondition}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* SECTION 3: Medical Information */}

            <div className="col-md-6">
              <label className="form-label">Diagnostic</label>
              <input 
                type="text" 
                name="diagnostic"
                className="form-control"
                value={formData.diagnostic}
                onChange={handleChange}
                placeholder="Enter diagnosis"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Allergies</label>
              <input 
                type="text" 
                name="allergies"
                className="form-control"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="List any allergies (comma-separated)"
              />
            </div>

            {/* SECTION 4: Contact Information */}

            <div className="col-md-6">
              <label className="form-label">Contact Number</label>
              <input 
                type="text" 
                name="contactNumber"
                className="form-control"
                value={formData.contactNumber}
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
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
              />
            </div>

            {/* SECTION 5: Date Information */}

            <div className="col-md-6">
              <label className="form-label">Date Visited</label>
              <input 
                type="date" 
                name="dateVisited"
                className="form-control"
                value={formData.dateVisited}
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
                  editMode && initialData?.dateRegistered 
                    ? new Date(initialData.dateRegistered).toLocaleDateString()
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
                name="remarks"
                className="form-control"
                value={formData.remarks}
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
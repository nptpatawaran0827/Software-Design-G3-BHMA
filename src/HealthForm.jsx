import React, { useState, useEffect } from 'react';

const HealthForm = ({ onCancel, onSubmit, editMode, initialData, onToggleStatus }) => {
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
      // Format SQL date (YYYY-MM-DD...) to HTML date input format (YYYY-MM-DD)
      const formattedDate = initialData.Date_Visited ? initialData.Date_Visited.split('T')[0] : '';
      setFormData({ 
        ...initialData, 
        Date_Visited: formattedDate 
      });
    }
  }, [editMode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">{editMode ? 'Edit Health Record' : 'Add New Health Record'}</h3>
        <button className="btn btn-secondary shadow-sm" onClick={onCancel}>← Back</button>
      </div>

      <div className="card border-0 shadow-sm" style={{ backgroundColor: 'rgba(112, 185, 221, 0.19)' }}>
        <div className="card-body p-4">
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
            
            {/* SECTION 1: Personal Info */}
            <h5 className="text-primary mb-3 border-bottom pb-2">Basic Information</h5>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Resident Name</label>
                <input className="form-control" name="Resident_Name" value={formData.Resident_Name} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Resident ID</label>
                <input className="form-control" name="Resident_ID" value={formData.Resident_ID} onChange={handleChange} disabled={editMode} required />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Age</label>
                <input type="number" className="form-control" name="Age" value={formData.Age} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Sex</label>
                <select className="form-select" name="Sex" value={formData.Sex} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Civil Status</label>
                <input className="form-control" name="Civil_Status" value={formData.Civil_Status} onChange={handleChange} />
              </div>
            </div>

            {/* SECTION 2: Health Metrics */}
            <h5 className="text-primary mb-3 border-bottom pb-2">Health Metrics & Condition</h5>
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Blood Pressure</label>
                <input className="form-control" name="Blood_Pressure" value={formData.Blood_Pressure} onChange={handleChange} placeholder="e.g. 120/80" />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Weight (kg)</label>
                <input type="number" step="0.01" className="form-control" name="Weight" value={formData.Weight} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Height (cm)</label>
                <input type="number" step="0.01" className="form-control" name="Height" value={formData.Height} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">BMI</label>
                <input type="number" step="0.01" className="form-control" name="BMI" value={formData.BMI} onChange={handleChange} />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-semibold">Health Condition</label>
                <input className="form-control" name="Health_Condition" value={formData.Health_Condition} onChange={handleChange} placeholder="Current condition status" />
              </div>
            </div>

            {/* SECTION 3: Medical Info */}
            <h5 className="text-primary mb-3 border-bottom pb-2">Medical Details</h5>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Diagnosis</label>
                <textarea className="form-control" name="Diagnosis" rows="2" value={formData.Diagnosis} onChange={handleChange}></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Allergies</label>
                <textarea className="form-control" name="Allergies" rows="2" value={formData.Allergies} onChange={handleChange}></textarea>
              </div>
            </div>

            {/* SECTION 4: Contact & Dates */}
            <h5 className="text-primary mb-3 border-bottom pb-2">Contact & Visit Info</h5>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Contact Number</label>
                <input className="form-control" name="Contact_Number" value={formData.Contact_Number} onChange={handleChange} />
              </div>
              <div className="col-md-8">
                <label className="form-label fw-semibold">Address</label>
                <input className="form-control" name="Address" value={formData.Address} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-danger">Date Visited</label>
                <input type="date" className="form-control border-danger" name="Date_Visited" value={formData.Date_Visited} onChange={handleChange} required />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-semibold">Remarks</label>
                <textarea className="form-control" name="Remarks" rows="3" value={formData.Remarks} onChange={handleChange}></textarea>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary px-4" onClick={onCancel}>Cancel</button>
              {editMode && (
                <button 
                  type="button" 
                  className={`btn ${formData.status === 'Active' ? 'btn-warning' : 'btn-success'} px-4`}
                  onClick={() => onToggleStatus(initialData.Health_Record_ID, formData.status === 'Active' ? 'Not Active' : 'Active')}
                >
                  {formData.status === 'Active' ? 'Set Inactive' : 'Set Active'}
                </button>
              )}
              <button type="submit" className="btn btn-primary px-5 shadow-sm">
                {editMode ? 'Update Record' : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HealthForm;
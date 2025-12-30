import React, { useState, useEffect } from 'react';
import './style/ResidentPage.css';

const initialState = {
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
};

export default function ResidentPage({ onCancel }) {
  const [formData, setFormData] = useState(initialState);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: string }

  useEffect(() => {
    // for debug / lifecycle hook (kept minimal)
    console.log('ResidentPage mounted');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Keep numeric-only for ID and contact
    if (name === 'Resident_ID' || name === 'Contact_Number') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    // required fields to match HealthForm
    const required = ['Resident_Name', 'Resident_ID', 'Age', 'Sex', 'Civil_Status', 'Date_Visited'];
    for (const key of required) {
      if (!formData[key] || String(formData[key]).trim() === '') {
        return `Please complete the required field: ${key}`;
      }
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    const err = validate();
    if (err) {
      setMessage({ type: 'error', text: err });
      return;
    }

    // Simulate submit: in real app send to backend or call a prop callback
    const payload = {
      ...formData,
      Date_Registered: new Date().toISOString(),
      status: 'Active'
    };

    console.log('Resident form submitted:', payload);
    setMessage({ type: 'success', text: 'Form submitted successfully.' });
    setFormData(initialState);
  };

  const handleReset = () => {
    setFormData(initialState);
    setMessage(null);
  };

  return (
    <div className="resident-page-root">
      <div className="resident-form-wrapper">
        <div className="resident-card card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold">Resident Health Form</h3>
              <small className="text-muted">Fill in your details and press Submit</small>
            </div>

            {message && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                {message.text}
              </div>
            )}

            <div className="row g-3">
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

              <div className="col-md-4">
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

              <div className="col-md-4">
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
                </select>
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

              <div className="col-12 d-flex gap-2 justify-content-end mt-3">
                <button type="button" className="btn btn-secondary px-4" onClick={() => (onCancel ? onCancel() : handleReset())}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary px-4" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
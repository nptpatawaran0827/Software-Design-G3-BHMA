import React, { useState, useEffect } from 'react';
import './style/ResidentPage.css';

const initialState = {
  Resident_Name: '',
  Resident_ID: '',
  Height: '',
  Weight: '',
  BMI: '',
  Health_Condition: '',
  Allergies: '',
  Submitted_At: '',
  Status: 'Pending'
};

export default function ResidentPage({ onCancel, onSubmitSuccess }) { // ✅ Added onSubmitSuccess
  const [formData, setFormData] = useState(initialState);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    console.log('ResidentPage mounted');
  }, []);


  

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'Resident_ID') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => {
        const updated = { ...prev, [name]: value };

        // Auto-calculate BMI
        if (name === 'Height' || name === 'Weight') {
          const heightM = parseFloat(updated.Height) / 100;
          const weightKg = parseFloat(updated.Weight);

          if (heightM > 0 && weightKg > 0) {
            updated.BMI = (weightKg / (heightM * heightM)).toFixed(2);
          } else {
            updated.BMI = '';
          }
        }

        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent default form submission
    setMessage(null);

    const payload = {
      ...formData,
      Submitted_At: new Date().toISOString().slice(0, 19).replace('T', ' '), // MySQL DATETIME format
      Status: 'Pending'
    };

    console.log('Submitting:', payload); // debug log

    try {
      const response = await fetch('http://localhost:5000/api/pending-residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Form submitted and awaiting approval.' });
        setFormData({ ...initialState }); // Reset form

        // ✅ Trigger Home to refresh pending residents
        if (onSubmitSuccess) onSubmitSuccess();

        setTimeout(() => setMessage(null), 3000);
      } else {
        const text = await response.text();
        console.error('Submission failed:', text);
        setMessage({ type: 'error', text: 'Failed to submit form. Please try again.' });
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setMessage({ type: 'error', text: 'Failed to submit form. Please try again.' });
    }
  };

  return (
    <div className="resident-page-root">
      <div className="resident-form-wrapper">
        <div className="resident-card card border-0 shadow-sm">
          <div className="card-body p-4">
            <h3 className="fw-bold mb-4">Resident Health Submission</h3>

            {message && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    name="Height"
                    className="form-control"
                    value={formData.Height}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    name="Weight"
                    className="form-control"
                    value={formData.Weight}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">BMI</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.BMI}
                    readOnly
                  />
                </div>

                <div className="col-md-6">
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
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Submitted At</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.Submitted_At}
                    readOnly
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.Status} disabled>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Reject">Reject</option>
                  </select>
                </div>

                <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onCancel && onCancel()}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

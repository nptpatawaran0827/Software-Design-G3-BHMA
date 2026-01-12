import React, { useState } from 'react';
import './style/ResidentPage.css';

const initialState = {
  First_Name: '',
  Middle_Name: '',
  Last_Name: '',
  Sex: '',
  Height: '',
  Weight: '',
  BMI: '',
  Health_Condition: '',
  Allergies: ''
};

// Helper function to generate ID: RES-*******-****
const generateResidentId = () => {
  const part1 = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
  const part2 = Math.floor(1000 + Math.random() * 9000);       // 4 digits
  return `RES-${part1}-${part2}`;
};

export default function ResidentPage({ onCancel, onSubmitSuccess }) {
  const [formData, setFormData] = useState(initialState);
  const [message, setMessage] = useState(null);
  const [residentId, setResidentId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      if (name === 'Height' || name === 'Weight') {
        const h = parseFloat(updated.Height) / 100;
        const w = parseFloat(updated.Weight);
        updated.BMI = h > 0 && w > 0 ? (w / (h * h)).toFixed(2) : '';
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Generate the custom ID first
    const newCustomId = generateResidentId();

    try {
      // Create Resident (Sending the Custom ID)
      const residentRes = await fetch('http://localhost:5000/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Resident_ID: newCustomId, 
          First_Name: formData.First_Name,
          Middle_Name: formData.Middle_Name,
          Last_Name: formData.Last_Name,
          Sex: formData.Sex,
          Civil_Status: '' 
        })
      });

      if (!residentRes.ok) throw new Error('Resident creation failed');
      
      // Create Pending Health (Using the SAME Custom ID)
      const pendingRes = await fetch('http://localhost:5000/api/pending-resident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Resident_ID: newCustomId, 
          Height: formData.Height || null,
          Weight: formData.Weight || null,
          BMI: formData.BMI || null,
          Health_Condition: formData.Health_Condition || null,
          Allergies: formData.Allergies || null,
          Submitted_At: new Date().toISOString().slice(0, 19).replace('T', ' ')
        })
      });

      if (!pendingRes.ok) throw new Error('Health submission failed');

      // Update UI
      setResidentId(newCustomId);
      setMessage({ type: 'success', text: `Submitted successfully. Resident ID: ${newCustomId}` });
      setFormData(initialState);
      
      if (onSubmitSuccess) onSubmitSuccess();

    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Submission failed. Please try again.' });
    }
  };

  return (
    <div className="resident-page-root">
      <div className="resident-form-wrapper">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h3 className="fw-bold mb-4">Resident Registration & Health Submission</h3>

            {message && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                {message.text}
              </div>
            )}

            {residentId && (
              <div className="alert alert-info">
                <strong>Current Resident ID:</strong> {residentId}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">First Name</label>
                  <input className="form-control" name="First_Name" value={formData.First_Name} onChange={handleChange} required />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Middle Name</label>
                  <input className="form-control" name="Middle_Name" value={formData.Middle_Name} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Last Name</label>
                  <input className="form-control" name="Last_Name" value={formData.Last_Name} onChange={handleChange} required />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Sex</label>
                  <select className="form-select" name="Sex" value={formData.Sex} onChange={handleChange} required>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Height (cm)</label>
                  <input type="number" className="form-control" name="Height" value={formData.Height} onChange={handleChange} />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Weight (kg)</label>
                  <input type="number" className="form-control" name="Weight" value={formData.Weight} onChange={handleChange} />
                </div>

                <div className="col-md-3">
                  <label className="form-label">BMI</label>
                  <input className="form-control" value={formData.BMI} readOnly />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Health Condition</label>
                  <select className="form-select" name="Health_Condition" value={formData.Health_Condition} onChange={handleChange}>
                    <option value="">Select...</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Allergies</label>
                  <input className="form-control" name="Allergies" value={formData.Allergies} onChange={handleChange} />
                </div>

                <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                  <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
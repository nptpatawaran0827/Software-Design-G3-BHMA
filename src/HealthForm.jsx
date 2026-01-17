import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';


const STREETS = [
  "Apitong Street", "Champagnat Street", "Champaca Street", 
  "Dao Street", "Ipil Street", "East Drive Street", 
  "General Ordonez Street", "Liwasang Kalayaan Street", 
  "Narra Street", "P. Valenzuela Street"
];

const HealthForm = ({ onCancel, onSubmit, editMode, initialData }) => {
  const [formData, setFormData] = useState({
    First_Name: '',
    Middle_Name: '',
    Last_Name: '',
    Resident_ID: '',
    Birthdate: '',
    Age: '',
    Sex: '',
    Civil_Status: '',
    Blood_Pressure: '',
    Weight: '',
    Height: '',
    BMI: '',
    Nutrition_Status: '',
    Health_Condition: '',
    Is_PWD: false,
    Diagnosis: '',
    Allergies: '',
    Contact_Number: '',
    Street: '',
    Barangay: 'Marikina Heights',
    Date_Visited: '',
    Remarks: '',
    status: 'Active',
    Recorded_By_Name: '' // Added for admin tracking
  });

  const calculateAge = (birthdate) => {
    if (!birthdate) return '';
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : '';
  };

  const calculateNutritionStatus = (bmi) => {
    if (!bmi || bmi === '') return '';
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue >= 18.5 && bmiValue < 25) return 'Normal';
    if (bmiValue >= 25 && bmiValue < 30) return 'Overweight';
    if (bmiValue >= 30) return 'Obese';
    return '';
  };

  const generateResidentID = () => {
    const part1 = Math.floor(1000000 + Math.random() * 9000000); 
    const part2 = Math.floor(1000 + Math.random() * 9000);       
    return `RES-${part1}-${part2}`;
  };

  useEffect(() => {
    // Capture the logged-in admin name
    const currentAdmin = localStorage.getItem('username') || 'System';

    if (initialData) {
      const rawBirthDate = initialData.Birthdate || '';
      const formattedBirthdate = rawBirthDate ? rawBirthDate.split('T')[0] : '';
      const formattedVisitDate = initialData.Date_Visited ? initialData.Date_Visited.split('T')[0] : '';
      
      setFormData({
        ...initialData,
        Birthdate: formattedBirthdate,
        Date_Visited: formattedVisitDate,
        Age: initialData.Age || calculateAge(formattedBirthdate),
        Is_PWD: initialData.Is_PWD === 1 || initialData.Is_PWD === true,
        Weight: initialData.Weight ? String(initialData.Weight) : '',
        Height: initialData.Height ? String(initialData.Height) : '',
        BMI: initialData.BMI ? String(initialData.BMI) : '',
        Nutrition_Status: initialData.Nutrition_Status || calculateNutritionStatus(initialData.BMI),
        Barangay: initialData.Barangay || 'Marikina Heights',
        Recorded_By_Name: initialData.Recorded_By_Name || currentAdmin
      });
    } else {
      setFormData(prev => ({ 
        ...prev, 
        Resident_ID: generateResidentID(),
        Barangay: 'Marikina Heights',
        Recorded_By_Name: currentAdmin 
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    let updatedData = { ...formData, [name]: finalValue };

    if (name === 'Birthdate') {
      updatedData.Age = calculateAge(value);
    }

    if ((name === 'Weight' || name === 'Height') && updatedData.Weight && updatedData.Height) {
      const heightInMeters = parseFloat(updatedData.Height) / 100;
      if (heightInMeters > 0) {
        const calculatedBMI = (parseFloat(updatedData.Weight) / (heightInMeters * heightInMeters)).toFixed(2);
        updatedData.BMI = calculatedBMI;
        updatedData.Nutrition_Status = calculateNutritionStatus(calculatedBMI);
      }
    }
    setFormData(updatedData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.First_Name.trim() || !formData.Last_Name.trim()) {
      setMessage({ 
        type: 'error', 
        text: '⚠️ ONE NAME POLICY: Both First Name and Last Name are required.' 
      });
      return;
    }

    try {
      const recordId = initialData?.Health_Record_ID;
      const adminId = localStorage.getItem('adminId');
      const adminUsername = localStorage.getItem('username') || 'System';
      
      let url = 'http://localhost:5000/api/health-records';
      const method = editMode ? 'PUT' : 'POST';

      if (editMode && recordId) {
        url = `${url}/${recordId}`;
      }

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          Recorded_By: adminId,
          Recorded_By_Name: adminUsername,
          adminId: adminId,
          admin_username: adminUsername
        })
      });

      const result = await response.json();

      if (result.isDuplicate) {
        setMessage({ 
          type: 'error', 
          text: `⚠️ RECORD ALREADY EXISTS: "${formData.First_Name} ${formData.Last_Name}" is already in the system.` 
        });
        return; 
      }

      if (!response.ok) throw new Error(result.details || 'Submission failed');

      const successText = editMode 
        ? `✅ Record for ${formData.First_Name} ${formData.Last_Name} has been modified successfully!` 
        : `✅ Registration Successful! Resident ID: ${formData.Resident_ID} has been added.`;

      setMessage({ type: 'success', text: successText });

      setTimeout(() => {
        // We pass 'editMode' as the second argument so RecordsPage knows what to display
        if (onSubmit) onSubmit(formData, editMode); 
        onCancel(); 
      }, 2500);

    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: `❌ ${error.message}` });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark">{editMode ? 'Edit Health Record' : 'Add New Health Record'}</h3>
        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={onCancel}>
          <i className="bi bi-arrow-left me-1"></i> Back
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4" style={{ backgroundColor: '#f8fbfe' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            
            {/* 1. BASIC INFO */}
            <h5 className="text-primary mb-3 fw-bold border-bottom pb-2">Personal Information</h5>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label small fw-bold">First Name</label>
                <input className="form-control rounded-3" name="First_Name" value={formData.First_Name} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Middle Name</label>
                <input className="form-control rounded-3" name="Middle_Name" value={formData.Middle_Name} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Last Name</label>
                <input className="form-control rounded-3" name="Last_Name" value={formData.Last_Name} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Resident ID</label>
                <input className="form-control bg-light fw-bold" name="Resident_ID" value={formData.Resident_ID} disabled />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold">Birthdate</label>
                <input type="date" className="form-control rounded-3" name="Birthdate" value={formData.Birthdate} onChange={handleChange} required />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-primary">Calculated Age</label>
                <div className="form-control bg-primary bg-opacity-10 fw-bold border-primary border-opacity-25">
                  {formData.Age || '---'} <span className="small fw-normal text-muted">years old</span>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Sex</label>
                <select className="form-select" name="Sex" value={formData.Sex} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Civil Status</label>
                <select className="form-select" name="Civil_Status" value={formData.Civil_Status} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Contact Number</label>
                <input className="form-control" name="Contact_Number" value={formData.Contact_Number} onChange={handleChange} />
              </div>
            </div>

            {/* 2. HEALTH METRICS */}
            <h5 className="text-primary mb-3 fw-bold border-bottom pb-2">Vitals & Measurements</h5>
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <label className="form-label small fw-bold">Blood Pressure</label>
                <input className="form-control" name="Blood_Pressure" value={formData.Blood_Pressure} onChange={handleChange} placeholder="e.g. 120/80" />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold">Weight (kg)</label>
                <input type="number" step="0.1" className="form-control" name="Weight" value={formData.Weight} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold">Height (cm)</label>
                <input type="number" step="0.1" className="form-control" name="Height" value={formData.Height} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold">BMI</label>
                <input className="form-control bg-light" name="BMI" value={formData.BMI} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Nutrition Status</label>
                <input className={`form-control fw-bold ${formData.Nutrition_Status === 'Normal' ? 'text-success' : 'text-danger'}`} value={formData.Nutrition_Status} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Health Condition</label>
                <select className="form-select" name="Health_Condition" value={formData.Health_Condition} onChange={handleChange}>
                  <option value="">Select Condition...</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            {/* 3. MEDICAL DETAILS */}
            <h5 className="text-primary mb-3 fw-bold border-bottom pb-2">Medical History</h5>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Diagnosis</label>
                <textarea className="form-control" name="Diagnosis" rows="2" value={formData.Diagnosis} onChange={handleChange} placeholder="Current medical diagnosis..."></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Allergies</label>
                <textarea className="form-control" name="Allergies" rows="2" value={formData.Allergies} onChange={handleChange} placeholder="List of allergies..."></textarea>
              </div>
              <div className="col-12">
                <div className="form-check form-switch p-3 bg-white rounded-3 border">
                  <input className="form-check-input ms-0 me-3" type="checkbox" id="Is_PWD" name="Is_PWD" checked={formData.Is_PWD} onChange={handleChange} />
                  <label className="form-check-label fw-bold" htmlFor="Is_PWD">Person with Disability (PWD)</label>
                </div>
              </div>
            </div>

            {/* 4. ADDRESS & VISIT INFO */}
            <h5 className="text-primary mb-3 fw-bold border-bottom pb-2">Address & Visit Details</h5>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Street</label>
                <select 
                  className="form-select rounded-3" 
                  name="Street" 
                  value={formData.Street} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Street...</option>
                  {STREETS.map((street) => (
                    <option key={street} value={street}>{street}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Barangay</label>
                <input className="form-control" name="Barangay" value={formData.Barangay} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-danger">Date of Visit</label>
                <input type="date" className="form-control border-danger border-opacity-50" name="Date_Visited" value={formData.Date_Visited} onChange={handleChange} required />
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <div className="p-2 bg-primary-subtle border border-primary-subtle rounded-3 w-100">
                  <small className="fw-bold text-primary">Recording as: {formData.Recorded_By_Name}</small>
                </div>
              </div>
              <div className="col-md-12">
                <label className="form-label small fw-bold">Medical Remarks</label>
                <textarea className="form-control" name="Remarks" rows="2" value={formData.Remarks} onChange={handleChange} placeholder="General health remarks..."></textarea>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 border-top pt-4">
              <button type="button" className="btn btn-light px-4 fw-bold" onClick={onCancel}>Cancel</button>
              <button type="submit" className="btn btn-success px-5 fw-bold shadow-sm">
                {editMode ? 'Update Health Record' : 'Save Health Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HealthForm;
import React, { useState, useEffect } from 'react';

const HealthForm = ({ onCancel, onSubmit, editMode, initialData, onToggleStatus }) => {
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
    Diagnosis: '',
    Allergies: '',
    Contact_Number: '',
    Street: '',
    Barangay: '',
    Date_Visited: '',
    Remarks: '',
    status: 'Active'
  });

  const generateResidentID = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 900 + 100);
    return `RES-${timestamp}-${randomNum}`;
  };

  // Calculate Nutrition Status based on BMI
  const calculateNutritionStatus = (bmi) => {
    if (!bmi || bmi === '') return '';
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue >= 18.5 && bmiValue < 25) return 'Normal';
    if (bmiValue >= 25 && bmiValue < 30) return 'Overweight';
    if (bmiValue >= 30) return 'Obese';
    return '';
  };

  // Calculate age from birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return '';
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : '';
  };

  // Initialize form for new records
  useEffect(() => {
    if (!editMode && !initialData) {
      setFormData(prev => ({ ...prev, Resident_ID: generateResidentID() }));
    }
  }, [editMode]);

  // Populate form with data - FIXED to preserve all fields
  useEffect(() => {
    if (editMode && initialData) {
      // Editing existing health record - preserve ALL data from database
      const formattedDate = initialData.Date_Visited
        ? initialData.Date_Visited.split('T')[0]
        : '';
      const formattedBirthdate = initialData.Birthdate
        ? initialData.Birthdate.split('T')[0]
        : '';
      
      // Create a new object starting with all current form data
      const updatedFormData = {
        First_Name: initialData.First_Name || '',
        Middle_Name: initialData.Middle_Name || '',
        Last_Name: initialData.Last_Name || '',
        Resident_ID: initialData.Resident_ID || '',
        Birthdate: formattedBirthdate,
        Age: initialData.Age || calculateAge(formattedBirthdate),
        Sex: initialData.Sex || '',
        Civil_Status: initialData.Civil_Status || '',
        Blood_Pressure: initialData.Blood_Pressure || '',
        Weight: initialData.Weight ? String(initialData.Weight) : '',
        Height: initialData.Height ? String(initialData.Height) : '',
        BMI: initialData.BMI ? String(initialData.BMI) : '',
        Nutrition_Status: initialData.Nutrition_Status || calculateNutritionStatus(initialData.BMI),
        Health_Condition: initialData.Health_Condition || '',
        Diagnosis: initialData.Diagnosis || '',
        Allergies: initialData.Allergies || '',
        Contact_Number: initialData.Contact_Number || '',
        Street: initialData.Street || '',
        Barangay: initialData.Barangay || '',
        Date_Visited: formattedDate,
        Remarks: initialData.Remarks_Notes || initialData.Remarks || '',
        status: initialData.status || 'Active',
        Health_Record_ID: initialData.Health_Record_ID || null
      };
      
      setFormData(updatedFormData);
    } else if (!editMode && initialData && initialData.Pending_HR_ID) {
      // Accepting pending resident - prefill with their data
      const formattedBirthdate = initialData.Birthdate
        ? initialData.Birthdate.split('T')[0]
        : '';
      setFormData({
        First_Name: initialData.First_Name || '',
        Middle_Name: initialData.Middle_Name || '',
        Last_Name: initialData.Last_Name || '',
        Resident_ID: initialData.Resident_ID || '',
        Birthdate: formattedBirthdate,
        Age: initialData.Age || calculateAge(formattedBirthdate),
        Sex: initialData.Sex || '',
        Civil_Status: initialData.Civil_Status || '',
        Blood_Pressure: '',
        Weight: initialData.Weight ? String(initialData.Weight) : '',
        Height: initialData.Height ? String(initialData.Height) : '',
        BMI: initialData.BMI ? String(initialData.BMI) : '',
        Health_Condition: initialData.Health_Condition || '',
        Nutrition_Status: calculateNutritionStatus(initialData.BMI),
        Diagnosis: '',
        Allergies: initialData.Allergies || '',
        Contact_Number: initialData.Contact_Number || '',
        Street: initialData.Street || '',
        Barangay: initialData.Barangay || '',
        Date_Visited: '',
        Remarks: '',
        status: 'Active',
        Health_Record_ID: initialData.Health_Record_ID || null
      });
    } else if (!editMode && !initialData) {
      // Creating new record from scratch
      setFormData(prev => ({ ...prev, Resident_ID: generateResidentID() }));
    }
  }, [editMode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    // Auto-calculate Age when Birthdate changes
    if (name === 'Birthdate') {
      updatedData.Age = calculateAge(value);
    }

    // Auto-calculate BMI when Height or Weight changes
    if ((name === 'Weight' || name === 'Height') && updatedData.Weight && updatedData.Height) {
      const heightInMeters = parseFloat(updatedData.Height) / 100;
      if (heightInMeters > 0) {
        const calculatedBMI = (parseFloat(updatedData.Weight) / (heightInMeters * heightInMeters)).toFixed(2);
        updatedData.BMI = calculatedBMI;
        // Auto-generate Nutrition Status based on BMI
        updatedData.Nutrition_Status = calculateNutritionStatus(calculatedBMI);
      }
    }

    setFormData(updatedData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">{editMode ? 'Edit Health Record' : 'Add New Health Record'}</h3>
        <button className="btn btn-secondary shadow-sm" onClick={onCancel}>← Back</button>
      </div>

      <div className="card border-0 shadow-sm" style={{ backgroundColor: 'rgba(112, 185, 221, 0.19)' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>

            {/* PERSONAL INFO */}
            <h5 className="text-primary mb-3 border-bottom pb-2">Basic Information</h5>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold">First Name</label>
                <input className="form-control" name="First_Name" value={formData.First_Name} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Middle Name</label>
                <input className="form-control" name="Middle_Name" value={formData.Middle_Name} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Last Name</label>
                <input className="form-control" name="Last_Name" value={formData.Last_Name} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Resident ID</label>
                <input className="form-control" name="Resident_ID" value={formData.Resident_ID} disabled />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Birthdate</label>
                <input type="date" className="form-control" name="Birthdate" value={formData.Birthdate} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Age</label>
                <input type="number" className="form-control" name="Age" value={formData.Age} disabled style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }} />
                <small className="text-muted">Auto-calculated</small>
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">Sex</label>
                <select className="form-select" name="Sex" value={formData.Sex} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Civil Status</label>
                <select className="form-select" name="Civil_Status" value={formData.Civil_Status} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
            </div>

            {/* HEALTH METRICS */}
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
                <input type="number" step="0.01" className="form-control" name="BMI" value={formData.BMI} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nutrition Status</label>
                <input type="text" className="form-control" name="Nutrition_Status" value={formData.Nutrition_Status} disabled style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }} />
                <small className="text-muted">Auto-calculated based on BMI</small>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Health Condition</label>
                <select className="form-select" name="Health_Condition" value={formData.Health_Condition} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            {/* MEDICAL INFO */}
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

            {/* CONTACT & VISIT */}
            <h5 className="text-primary mb-3 border-bottom pb-2">Contact & Visit Info</h5>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Contact Number</label>
                <input className="form-control" name="Contact_Number" value={formData.Contact_Number} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Street</label>
                <input className="form-control" name="Street" value={formData.Street} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Barangay</label>
                <input className="form-control" name="Barangay" value={formData.Barangay} onChange={handleChange} />
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

            {/* ACTION BUTTONS */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary px-4" onClick={onCancel}>Cancel</button>
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
import React, { useState, useEffect } from "react";
import { ArrowLeft, User } from "lucide-react";
import "./style/HealthForm.css";

const HealthForm = ({ onCancel, onSubmit, editMode, initialData }) => {
  const [streetList, setStreetList] = useState([]);
  const [message, setMessage] = useState(null);
  
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
    Street_ID: '',
    Barangay: 'Marikina Heights',
    Date_Visited: '',
    Remarks: '',
    status: 'Active',
    Recorded_By_Name: ''
  });

  // ===== FETCH STREETS FROM DATABASE =====
  useEffect(() => {
    const fetchStreets = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/streets');
        const data = await res.json();
        setStreetList(data);
      } catch (err) {
        console.error("Failed to fetch streets:", err);
      }
    };
    fetchStreets();
  }, []);

  // ===== CALCULATE AGE FROM BIRTHDATE =====
  const calculateAge = (birthdate) => {
    if (!birthdate) return "";
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age >= 0 ? age : "";
  };

  // ===== CALCULATE NUTRITION STATUS FROM BMI =====
  const calculateNutritionStatus = (bmi) => {
    if (!bmi || bmi === "") return "";
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue >= 18.5 && bmiValue < 25) return "Normal";
    if (bmiValue >= 25 && bmiValue < 30) return "Overweight";
    if (bmiValue >= 30) return "Obese";
    return "";
  };

  // ===== GENERATE RESIDENT ID =====
  const generateResidentID = () => {
    const part1 = Math.floor(1000000 + Math.random() * 9000000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    return `RES-${part1}-${part2}`;
  };

  // ===== INITIALIZE FORM DATA =====
  // ===== INITIALIZE FORM DATA =====
useEffect(() => {
  const currentAdmin = localStorage.getItem("username") || "System";
  
  // Get local date in YYYY-MM-DD format
  const today = new Date();
  const deviceToday = today.toLocaleDateString('en-CA'); // 'en-CA' outputs YYYY-MM-DD

  if (initialData) {
    // EDIT MODE
    const rawBirthDate = initialData.Birthdate || "";
    const formattedBirthdate = rawBirthDate ? rawBirthDate.split("T")[0] : "";

    setFormData({
      ...initialData,
      Birthdate: formattedBirthdate,
      // Fixed to today regardless of what was in the database
      Date_Visited: deviceToday, 
      Age: initialData.Age || calculateAge(formattedBirthdate),
      Is_PWD: initialData.Is_PWD === 1 || initialData.Is_PWD === true,
      Weight: initialData.Weight ? String(initialData.Weight) : "",
      Height: initialData.Height ? String(initialData.Height) : "",
      BMI: initialData.BMI ? String(initialData.BMI) : "",
      Nutrition_Status: initialData.Nutrition_Status || calculateNutritionStatus(initialData.BMI),
      Barangay: initialData.Barangay || "Marikina Heights",
      Recorded_By_Name: currentAdmin, // Updates to the person currently editing
    });
  } else {
    // ADD MODE
    setFormData((prev) => ({
      ...prev,
      Resident_ID: generateResidentID(),
      Barangay: "Marikina Heights",
      Recorded_By_Name: currentAdmin,
      Date_Visited: deviceToday,
    }));
  }
}, [initialData]);

  // ===== HANDLE FORM INPUT CHANGES =====
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    let updatedData = { ...formData, [name]: finalValue };

    // AUTO-CALCULATE AGE
    if (name === "Birthdate") {
      updatedData.Age = calculateAge(value);
    }

    // AUTO-CALCULATE BMI & NUTRITION STATUS
    if (
      (name === "Weight" || name === "Height") &&
      updatedData.Weight &&
      updatedData.Height
    ) {
      const heightInMeters = parseFloat(updatedData.Height) / 100;
      if (heightInMeters > 0) {
        const calculatedBMI = (
          parseFloat(updatedData.Weight) /
          (heightInMeters * heightInMeters)
        ).toFixed(2);
        updatedData.BMI = calculatedBMI;
        updatedData.Nutrition_Status = calculateNutritionStatus(calculatedBMI);
      }
    }

    setFormData(updatedData);
  };

  // ===== AUTO-SCROLL TO MESSAGE =====
  useEffect(() => {
    if (message) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [message]);

  // ===== HANDLE FORM SUBMISSION =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // VALIDATION: ONE NAME POLICY
    if (!formData.First_Name.trim() || !formData.Last_Name.trim()) {
      setMessage({
        type: "error",
        text: "⚠️ ONE NAME POLICY: Both First Name and Last Name are required.",
      });
      return;
    }

    try {
      const recordId = initialData?.Health_Record_ID;
      const adminId = localStorage.getItem("adminId");
      const adminUsername = localStorage.getItem("username") || "System";

      let url = "http://localhost:5000/api/health-records";
      const method = editMode ? "PUT" : "POST";
      if (editMode && recordId) {
        url = `${url}/${recordId}`;
      }

      const response = await fetch(url, {
  method: method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...formData, // This contains Resident_ID
    record_name: formData.Resident_ID, // Force it into the activity log's label
    adminId: adminId,
    admin_username: adminUsername,
  }),
});

      const result = await response.json();

      // DUPLICATE CHECK: Pass back to parent and exit form
      if (result.isDuplicate) {
        if (onSubmit) onSubmit(formData, editMode, true);
        onCancel();
        return;
      }

      if (!response.ok) throw new Error(result.details || "Submission failed");

      const successText = editMode
        ? `✅ Record for ${formData.First_Name} ${formData.Last_Name} has been modified successfully!`
        : `✅ Registration Successful! Resident ID: ${formData.Resident_ID} has been added.`;

      setMessage({ type: "success", text: successText });

      setTimeout(() => {
        if (onSubmit) onSubmit(formData, editMode);
        onCancel();
      }, 2500);
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: `❌ ${error.message}` });
    }
  };

  // ===== RENDER =====
  return (
    <div className="health-form-wrapper">
      {/* HEADER */}
      <div className="form-header">
        <h3 className="form-title">
          {editMode ? "Edit Health Record" : "Add New Health Record"}
        </h3>
        <button className="btn-back" onClick={onCancel}>
          <ArrowLeft size={18} /> Back to Records
        </button>
      </div>

      <div className="form-container">
        <div className="form-body">
          {/* LEGEND */}
          <div className="form-legend">
            <div className="legend-title">Field Guide:</div>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color legend-color-teal"></div>
                <span className="legend-text">Auto-Generated</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-color-blue"></div>
                <span className="legend-text">Auto-Calculated</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-color-red"></div>
                <span className="legend-text">Important Date</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-color-green"></div>
                <span className="legend-text">Normal Status</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-color-yellow"></div>
                <span className="legend-text">Under / Over Range</span>
              </div>
            </div>
          </div>

          {/* MESSAGE ALERT */}
          {message && (
            <div
              className={`form-alert ${message.type === "success" ? "form-alert-success" : "form-alert-error"}`}
            >
              <span className="alert-icon">
                {message.type === "success" ? "✓" : "⚠️"}
              </span>
              <span className="alert-text">{message.text}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            {/* ===== PERSONAL INFORMATION ===== */}
            <h5 className="section-header">👤 Personal Information</h5>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label form-label-required">
                  First Name
                </label>
                <input
                  className="form-input"
                  name="First_Name"
                  value={formData.First_Name}
                  onChange={handleChange}
                  required
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Middle Name</label>
                <input
                  className="form-input"
                  name="Middle_Name"
                  value={formData.Middle_Name}
                  onChange={handleChange}
                  placeholder="Enter middle name (optional)"
                />
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">
                  Last Name
                </label>
                <input
                  className="form-input"
                  name="Last_Name"
                  value={formData.Last_Name}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label form-label-generated">
                  Resident ID
                </label>
                <input
                  className="form-input input-resident-id"
                  name="Resident_ID"
                  value={formData.Resident_ID}
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">
                  Birthdate
                </label>
                <input
                  type="date"
                  className="form-input"
                  name="Birthdate"
                  value={formData.Birthdate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label form-label-calculated">
                  Calculated Age
                </label>
                <input
                  className="form-input input-calculated"
                  value={formData.Age ? `${formData.Age} years old` : "---"}
                  disabled
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Sex</label>
                <select
                  className="form-select"
                  name="Sex"
                  value={formData.Sex}
                  onChange={handleChange}
                >
                  <option value="">Select gender...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Civil Status</label>
                <select
                  className="form-select"
                  name="Civil_Status"
                  value={formData.Civil_Status}
                  onChange={handleChange}
                >
                  <option value="">Select civil status...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input
                  className="form-input"
                  name="Contact_Number"
                  value={formData.Contact_Number}
                  onChange={handleChange}
                  placeholder="e.g. 09123456789"
                />
              </div>
            </div>

            {/* ===== VITALS & MEASUREMENTS ===== */}
            <h5 className="section-header">Vitals & Measurements</h5>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Blood Pressure</label>
                <input
                  className="form-input"
                  name="Blood_Pressure"
                  value={formData.Blood_Pressure}
                  onChange={handleChange}
                  placeholder="e.g. 120/80"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  name="Weight"
                  value={formData.Weight}
                  onChange={handleChange}
                  placeholder="Enter weight"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  name="Height"
                  value={formData.Height}
                  onChange={handleChange}
                  placeholder="Enter height"
                />
              </div>
              <div className="form-group">
                <label className="form-label form-label-calculated">
                  BMI
                </label>
                <input
                  className="form-input input-calculated"
                  name="BMI"
                  value={formData.BMI || "---"}
                  disabled
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label form-label-calculated">
                  Nutrition Status
                </label>
                <input
                  className={`form-input input-calculated ${
                    formData.Nutrition_Status === "Normal"
                      ? "nutrition-status-normal"
                      : formData.Nutrition_Status
                        ? "nutrition-status-warning"
                        : ""
                  }`}
                  value={formData.Nutrition_Status || "---"}
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">Health Condition</label>
                <select
                  className="form-select"
                  name="Health_Condition"
                  value={formData.Health_Condition}
                  onChange={handleChange}
                >
                  <option value="">Select condition...</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            {/* ===== MEDICAL HISTORY ===== */}
            <h5 className="section-header">Medical History</h5>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <textarea
                  className="form-textarea"
                  name="Diagnosis"
                  value={formData.Diagnosis}
                  onChange={handleChange}
                  placeholder="Current medical diagnosis..."
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Allergies</label>
                <textarea
                  className="form-textarea"
                  name="Allergies"
                  value={formData.Allergies}
                  onChange={handleChange}
                  placeholder="List of allergies..."
                  rows="3"
                ></textarea>
              </div>
            </div>

            {/* ===== PWD CHECKBOX ===== */}
            <div className="checkbox-container">
              <div className="checkbox-switch">
                <input
                  className="checkbox-input"
                  type="checkbox"
                  id="Is_PWD"
                  name="Is_PWD"
                  checked={formData.Is_PWD}
                  onChange={handleChange}
                />
                <label className="checkbox-label" htmlFor="Is_PWD">
                  Person with Disability (PWD)
                </label>
              </div>
            </div>

            {/* ===== ADDRESS & VISIT DETAILS ===== */}
            <h5 className="section-header">Address & Visit Details</h5>
            
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label form-label-required">
                  Street
                </label>
                <select
                  className="form-select"
                  name="Street_ID"
                  value={formData.Street_ID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select street...</option>
                  {streetList.map((street) => (
                    <option key={street.Street_ID} value={street.Street_ID}>
                      {street.Street_Name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Barangay</label>
                <input
                  className="form-input"
                  name="Barangay"
                  value={formData.Barangay}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label form-label-required">
                  Date of Visit
                </label>
                <input
                  type="date"
                  className="form-input input-date-visited"
                  name="Date_Visited"
                  value={formData.Date_Visited}
                  onChange={handleChange}
                  required
                />
                <small className="form-helper-text">
                  Auto-filled based on system date
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">Recorded By</label>
                <div className="recorder-info">
                  <User className="recorder-icon" size={20} />
                  <p className="recorder-text">{formData.Recorded_By_Name}</p>
                </div>
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Medical Remarks</label>
                <textarea
                  className="form-textarea"
                  name="Remarks"
                  value={formData.Remarks}
                  onChange={handleChange}
                  placeholder="General health remarks..."
                  rows="3"
                ></textarea>
              </div>
            </div>

            {/* ===== FORM ACTIONS ===== */}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onCancel}>
                ❌ Cancel
              </button>
              <button type="submit" className="btn-submit">
                {editMode ? "Update Health Record" : "Save Health Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HealthForm;
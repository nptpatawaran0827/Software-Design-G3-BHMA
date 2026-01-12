import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, MapPin, Edit, X, Save, Activity, FileText, ClipboardList, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './style/RecordsPage.css';

const RecordsPage = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  
  const [formData, setFormData] = useState({
    Resident_ID: '',
    Full_Name: '',
    Sex: 'Male',
    Weight: '',
    Height: '',
    BMI: '',
    Diagnosis: '',
    Health_Condition: 'Good',
    Street: '',
    Contact_Number: '',
    Remarks_Notes: '',
    Date_Visited: '' // Added
  });

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health-records');
      const data = await response.json();
      setPatients(data);
    } catch (error) { 
      console.error("Fetch error:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const weight = parseFloat(formData.Weight);
    const height = parseFloat(formData.Height);
    if (weight > 0 && height > 0) {
      const hMeters = height / 100;
      const bmi = (weight / (hMeters * hMeters)).toFixed(2);
      if (formData.BMI !== bmi) setFormData(prev => ({ ...prev, BMI: bmi }));
    }
  }, [formData.Weight, formData.Height, formData.BMI]);

  const handleOpenModal = (patient = null) => {
    if (patient) {
      setEditingPatient(patient);
      // Format date for the <input type="date" /> (YYYY-MM-DD)
      const formattedDate = patient.Date_Visited ? new Date(patient.Date_Visited).toISOString().split('T')[0] : '';
      
      setFormData({
        Resident_ID: patient.Resident_ID || '',
        Full_Name: patient.Resident_Name || `${patient.First_Name} ${patient.Last_Name}`,
        Sex: patient.Sex || 'Male',
        Weight: patient.Weight || '',
        Height: patient.Height || '',
        BMI: patient.BMI || '',
        Diagnosis: patient.Diagnosis || '',
        Health_Condition: patient.Health_Condition || 'Good',
        Street: patient.Street || '',
        Contact_Number: patient.Contact_Number || '',
        Remarks_Notes: patient.Remarks_Notes || '',
        Date_Visited: formattedDate
      });
    } else {
      setEditingPatient(null);
      setFormData({
        Resident_ID: '', 
        Full_Name: '', 
        Sex: 'Male', 
        Weight: '', 
        Height: '', 
        BMI: '', 
        Diagnosis: '', 
        Health_Condition: 'Good', 
        Street: '', 
        Contact_Number: '', 
        Remarks_Notes: '',
        Date_Visited: new Date().toISOString().split('T')[0] // Default to today
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const nameParts = formData.Full_Name.trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Resident';

      const resPayload = {
        Resident_ID: formData.Resident_ID,
        First_Name: firstName,
        Last_Name: lastName,
        Sex: formData.Sex,
        Street: formData.Street,
        Contact_Number: formData.Contact_Number
      };

      await fetch(`http://localhost:5000/api/residents${editingPatient ? '/' + formData.Resident_ID : ''}`, {
        method: editingPatient ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resPayload),
      });

      const recordPayload = {
        Resident_ID: formData.Resident_ID,
        Weight: formData.Weight,
        Height: formData.Height,
        BMI: formData.BMI,
        Diagnosis: formData.Diagnosis,
        Health_Condition: formData.Health_Condition,
        Remarks_Notes: formData.Remarks_Notes,
        Date_Visited: formData.Date_Visited // Included in save
      };

      const recMethod = editingPatient ? 'PUT' : 'POST';
      const recUrl = editingPatient 
        ? `http://localhost:5000/api/health-records/${editingPatient.Health_Record_ID}`
        : 'http://localhost:5000/api/health-records';

      const response = await fetch(recUrl, {
        method: recMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordPayload),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchPatients();
        alert("Record updated successfully!");
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to connect to server.");
    }
  };

  const filteredPatients = patients.filter(p => 
    p.Resident_Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="records-container p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div>
          <h2 className="fw-bold mb-1">Patient Records</h2>
          <p className="text-muted small">Manage resident medical check-ups</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm">
          <Plus size={18} /> Add Patient
        </button>
      </div>

      <div className="px-3 mb-4">
        <div className="search-wrapper shadow-sm">
          <Search className="search-icon" size={20} />
          <input 
            type="text" className="form-control custom-search" 
            placeholder="Search resident..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="row g-4 px-3">
        {filteredPatients.map((patient, index) => (
          <div key={patient.Health_Record_ID || index} className="col-xl-4 col-md-6">
            <div className="patient-card shadow-sm border-0 p-4 position-relative">
              <button 
                onClick={() => handleOpenModal(patient)}
                className="btn btn-outline-primary btn-sm position-absolute" 
                style={{ top: '20px', right: '20px' }}
              >
                <Edit size={16} />
              </button>

              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="avatar-circle"><User size={24} className="text-primary" /></div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark">{patient.Resident_Name}</h5>
                  <small className="text-muted">ID: {patient.Resident_ID} • {patient.Sex}</small>
                </div>
              </div>
              
              <div className="patient-info-list mb-3">
                <div className="info-item"><MapPin size={16} /> <span>{patient.Street || "No Address"}</span></div>
                <div className="info-item text-primary fw-medium">
                   <ClipboardList size={16} /> <span>{patient.Diagnosis || "No diagnosis set"}</span>
                </div>
                {/* DISPLAY DATE VISITED */}
                <div className="info-item text-secondary small">
                  <Calendar size={14} /> <span>Visited: {patient.Date_Visited ? new Date(patient.Date_Visited).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="row pt-3 border-top g-0 text-center bg-light rounded-3 mt-3">
                <div className="col-4 border-end py-2">
                  <div className="stat-val text-primary">{patient.BMI || '--'}</div>
                  <div className="stat-label">BMI</div>
                </div>
                <div className="col-4 border-end py-2">
                  <div className="stat-val">{patient.Weight}kg</div>
                  <div className="stat-label">Weight</div>
                </div>
                <div className="col-4 py-2">
                  <div className="stat-val">{patient.Height}cm</div>
                  <div className="stat-label">Height</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-backdrop">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              className="modal-content-box" // Matches the fixed-width CSS class
            >
              <div className="modal-header">
                <h2>{editingPatient ? 'Update Patient' : 'Add New Patient'}</h2>
                <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-input-group">
                    <label>RESIDENT ID</label>
                    <input type="text" value={formData.Resident_ID} onChange={(e) => setFormData({...formData, Resident_ID: e.target.value})} required disabled={!!editingPatient} />
                  </div>
                  <div className="form-input-group">
                    <label>DATE VISITED</label>
                    <input type="date" value={formData.Date_Visited} onChange={(e) => setFormData({...formData, Date_Visited: e.target.value})} required />
                  </div>
                </div>

                <div className="form-input-group">
                  <label>FULL NAME</label>
                  <input type="text" value={formData.Full_Name} onChange={(e) => setFormData({...formData, Full_Name: e.target.value})} required />
                </div>

                <div className="form-input-group">
                  <label className="text-primary">DIAGNOSIS</label>
                  <input type="text" className="blue-border-input" value={formData.Diagnosis} onChange={(e) => setFormData({...formData, Diagnosis: e.target.value})} />
                </div>

                <div className="form-row">
                  <div className="form-input-group">
                    <label>SEX</label>
                    <select value={formData.Sex} onChange={(e) => setFormData({...formData, Sex: e.target.value})}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-input-group">
                    <label>CONDITION</label>
                    <select value={formData.Health_Condition} onChange={(e) => setFormData({...formData, Health_Condition: e.target.value})}>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-three">
                  <div className="form-input-group"><label>WT (kg)</label><input type="number" step="0.1" value={formData.Weight} onChange={(e) => setFormData({...formData, Weight: e.target.value})} /></div>
                  <div className="form-input-group"><label>HT (cm)</label><input type="number" step="0.1" value={formData.Height} onChange={(e) => setFormData({...formData, Height: e.target.value})} /></div>
                  <div className="form-input-group"><label>BMI</label><input type="text" className="bmi-readonly" value={formData.BMI} readOnly /></div>
                </div>
                
                <div className="form-input-group">
                  <label>REMARKS / ADDITIONAL NOTES</label>
                  <textarea rows="2" value={formData.Remarks_Notes} onChange={(e) => setFormData({...formData, Remarks_Notes: e.target.value})}></textarea>
                </div>

                <button type="submit" className="modal-submit-btn">
                  <Save size={18} /> {editingPatient ? 'Update Changes' : 'Save Record'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecordsPage;


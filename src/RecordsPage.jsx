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

  /* ==================== HELPER: CALCULATE AGE ==================== */
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  /* ==================== DATA FETCHING ==================== */
  const fetchRecords = async () => {
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
    fetchRecords();
  }, []);

  /* ==================== AUTO-OPEN FORM LOGIC ==================== */
  useEffect(() => {
    if (autoOpenForm) {
      if (preFillData) {
        setEditingRecord(preFillData);
        setShowForm(true);
      } else {
        fetch('http://localhost:5000/api/health-records')
          .then(res => res.json())
          .then(data => {
            if (data.length > 0) {
              setEditingRecord(data[0]);
              setShowForm(true);
            }
          });
      }
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
      const adminId = parseInt(localStorage.getItem('adminId'), 10);
      
      if (!adminId) {
        setError('Admin ID not found. Please log in again.');
        return;
      }
      
      const isNewRecord = !editingRecord || !editingRecord.Health_Record_ID;
      
      const residentUrl = isNewRecord 
        ? `http://localhost:5000/api/residents`
        : `http://localhost:5000/api/residents/${formData.Resident_ID}`;

      const residentUpdateRes = await fetch(residentUrl, {
        method: isNewRecord ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resPayload),
      });

      if (!residentUpdateRes.ok) throw new Error('Failed to save resident info');

      const healthUrl = isNewRecord
        ? 'http://localhost:5000/api/health-records'
        : `http://localhost:5000/api/health-records/${editingRecord.Health_Record_ID}`;
      
      const res = await fetch(healthUrl, {
        method: isNewRecord ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          Recorded_By: adminId 
        })
      });
      
      if (res.ok) {
        setShowForm(false);
        setEditingRecord(null);
        fetchRecords(); 
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save record to database.');
    }
  };

  const handleToggleStatus = async (recordId, currentStatus) => {
    const newStatus = (currentStatus === 'Active' || !currentStatus) ? 'Not Active' : 'Active';
    try {
      const res = await fetch(`http://localhost:5000/api/health-records/${recordId}/status`, {
        method: 'PUT',
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
      )}
      
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr className="text-uppercase small fw-bold">
                    <th className="ps-4">Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Last Visit</th>
                    <th>Recorded By</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-5 text-muted">No health records found.</td></tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.Health_Record_ID} className="align-middle">
                        <td className="ps-4 fw-bold text-dark">
                          {record.Resident_Name || `${record.First_Name} ${record.Last_Name}`}
                        </td>
                        <td>
                          <span className="fw-semibold">
                            {record.Age || calculateAge(record.Birthdate)}
                          </span>
                          <small className="text-muted ms-1">yrs</small>
                        </td>
                        <td>{record.Sex}</td>
                        <td>{record.Date_Visited ? new Date(record.Date_Visited).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <span className="badge bg-light text-primary border">
                            <i className="bi bi-person-badge me-1"></i>
                            {record.Recorded_By_Name || 'Unknown Admin'}
                          </span>
                        </td>
                        <td>
                          {/* REVISED STATUS COLORS */}
                          <span className={`badge rounded-pill ${(!record.status || record.status === 'Active') ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                            {record.status || 'Active'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditRecord(record)}>
                              <i className="bi bi-pencil"></i> Edit
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRecord(record.Health_Record_ID)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
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


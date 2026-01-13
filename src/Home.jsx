import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import Sidebar from './Sidebar';
import RecordsPage from './RecordsPage';
import AnalyticsPage from './AnalyticsPage';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Home({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Home');
  const [filter, setFilter] = useState('All Activities');
  const [activities, setActivities] = useState([]);
  const [shouldAutoOpenForm, setShouldAutoOpenForm] = useState(false);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pendingResidents, setPendingResidents] = useState([]); 
  const [showNotification, setShowNotification] = useState(false); 
  const [preFillData, setPreFillData] = useState(null); 
  const notificationRef = useRef(null);

  const [dbStats, setDbStats] = useState({
    totalPatients: 0,
    newPatients: 0,
    patientsWithDisability: 0,
    totalReports: 0,
    maleCount: 0,
    femaleCount: 0
  });

  const [diagnosisChartData, setDiagnosisChartData] = useState(null);
  const [genderChartData, setGenderChartData] = useState(null);

  // ==================== FETCH DATA (OPTIMIZED) ====================
  const fetchHealthRecords = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health-records');
      const data = await response.json();
      if (Array.isArray(data)) {
        setHealthRecords(data);
        calculateStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPending = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/pending-residents');
      const data = await res.json();
      setPendingResidents(data);
    } catch (err) {
      console.error('Error fetching pending residents:', err);
    }
  };

  useEffect(() => {
    fetchHealthRecords();
    fetchPending();
    
    // FAST UPDATE: Syncs PWD counts and Notifications every 5 seconds
    const interval = setInterval(() => {
      fetchPending();
      fetchHealthRecords(); 
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotification(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==================== STATISTICS LOGIC ====================
  const calculateStatistics = (records) => {
    if (!records || records.length === 0) return;

    const uniquePatients = new Set(records.map(r => r.Resident_ID)).size;
    const maleCount = records.filter(r => r.Sex?.toLowerCase() === 'male').length;
    const femaleCount = records.filter(r => r.Sex?.toLowerCase() === 'female').length;
    const pwdCount = records.filter(r => r.Is_PWD == 1 || r.Is_PWD === true).length;

    const diagCounts = {};
    records.forEach(r => {
      if (r.Diagnosis) {
        const d = r.Diagnosis.toLowerCase().trim();
        diagCounts[d] = (diagCounts[d] || 0) + 1;
      }
    });

    const sortedDiag = Object.entries(diagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    setDiagnosisChartData({
      labels: sortedDiag.map(([d]) => d.charAt(0).toUpperCase() + d.slice(1)),
      datasets: [{
        data: sortedDiag.map(([, c]) => c),
        backgroundColor: ['#FFB3A7', '#86EFAC', '#67E8F9', '#FFD700', '#DDA0DD'],
        borderWidth: 1
      }]
    });

    setGenderChartData({
      labels: ['Male', 'Female'],
      datasets: [{
        data: [maleCount, femaleCount],
        backgroundColor: ['#4A90E2', '#F5A623'],
        borderWidth: 1
      }]
    });

    setDbStats({
      totalPatients: uniquePatients,
      newPatients: records.length,
      patientsWithDisability: pwdCount,
      totalReports: records.length,
      maleCount,
      femaleCount
    });
  };

  const handleAccept = async (resident) => {
    try {
      const res = await fetch(`http://localhost:5000/api/pending-residents/accept/${resident.Pending_HR_ID}`, { method: 'POST' });
      const result = await res.json();
      setPreFillData({ ...resident, Is_PWD: resident.Is_PWD == 1, Health_Record_ID: result.Health_Record_ID });
      setActiveTab('Records');
      setShouldAutoOpenForm(true);
      setShowNotification(false);
      fetchHealthRecords(); // Immediate refresh after accept
    } catch (err) { console.error(err); }
  };

  const handleRemove = async (id) => {
    await fetch(`http://localhost:5000/api/pending-residents/remove/${id}`, { method: 'DELETE' });
    fetchPending();
  };

  const renderContent = () => {
    if (activeTab === 'Records') {
      return <RecordsPage autoOpenForm={shouldAutoOpenForm} preFillData={preFillData} onSubmitSuccess={() => { fetchPending(); fetchHealthRecords(); }} />;
    }
    if (activeTab === 'Analytics') return <AnalyticsPage />;

    return (
      <div className="p-4">
        {/* Top Navbar with Fixed Dropdown */}
        <div className="d-flex justify-content-end align-items-center mb-4 gap-2 position-relative">
          <div ref={notificationRef}>
            <button className="btn btn-outline-dark position-relative" onClick={() => setShowNotification(!showNotification)}>
              <i className="bi bi-bell"></i>
              {pendingResidents.length > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{pendingResidents.length}</span>}
            </button>
            
            {showNotification && (
              <div className="position-absolute end-0 mt-2 bg-white border rounded-4 shadow-lg p-0" style={{ zIndex: 1050, width: '320px', overflow: 'hidden' }}>
                <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                  <h6 className="m-0 fw-bold text-uppercase small">Pending Requests</h6>
                  <span className="badge bg-primary">{pendingResidents.length}</span>
                </div>
                <ul className="list-group list-group-flush" style={{maxHeight: '300px', overflowY: 'auto'}}>
                  {pendingResidents.length > 0 ? (
                    pendingResidents.map(res => (
                      <li key={res.Pending_HR_ID} className="list-group-item p-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="small">
                            <div className="fw-bold text-dark">{res.Resident_Name}</div>
                            <div className="text-muted" style={{fontSize: '0.75rem'}}>Resident ID: {res.Resident_ID}</div>
                          </div>
                          <div className="d-flex gap-1">
                            <button className="btn btn-success btn-sm p-1 px-2" title="Accept" onClick={() => handleAccept(res)}><i className="bi bi-check-lg"></i></button>
                            <button className="btn btn-outline-danger btn-sm p-1 px-2" title="Remove" onClick={() => handleRemove(res.Pending_HR_ID)}><i className="bi bi-x-lg"></i></button>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item py-4 text-center text-muted">No pending residents</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <button className="btn btn-outline-dark px-4" onClick={onLogout}>Logout</button>
        </div>

        <h2 className="fw-bold mb-4 text-uppercase">WELCOME BACK, ADMIN!</h2>

        {/* Recent Activity Section */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
            <h5 className="mb-0 fw-bold">Recent Activity</h5>
            <select className="form-select form-select-sm w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All Activities">All Activities</option>
              <option value="New Patients">New Patients</option>
              <option value="Updated Records">Updated Records</option>
              <option value="Deleted Records">Deleted Records</option>
              <option value="Report Generated">Report Generated</option>
            </select>
          </div>
          <div className="card-body p-0">
            <ul className="list-group list-group-flush">
              {activities.length > 0 ? (
                activities.map((item, index) => (
                  <li key={index} className="list-group-item d-flex align-items-center py-3 border-0 px-4">
                    <i className={`bi bi-circle-fill text-primary me-3`} style={{fontSize: '0.5rem'}}></i>
                    <div className="small">Activity log placeholder...</div>
                  </li>
                ))
              ) : (
                <li className="list-group-item py-4 text-center text-muted border-0">
                  No recent updates found for "{filter}".
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* DASHBOARD STATS */}
        <h2 className="text-success fw-bold mb-3">Dashboard</h2>
        <div className="bg-white p-4 rounded-4 shadow-sm border">
          {/* <button className="btn btn-success fw-bold px-4 mb-4 rounded-3 shadow-sm" onClick={() => { setActiveTab('Records'); setShouldAutoOpenForm(true); }}>
            <i className="bi bi-plus-lg me-2"></i>Add Patient Record
          </button> */}

          <div className="row g-3">
            <div className="col-lg-5">
              <div className="row g-3">
                <div className="col-6">
                  <div className="border rounded-4 p-3 text-center h-100 shadow-sm bg-white">
                    <i className="bi bi-people text-success fs-1"></i>
                    <h2 className="fw-bold mb-0">{dbStats.totalPatients}</h2>
                    <small className="text-muted fw-semibold">Total Residents</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded-4 p-3 text-center h-100 shadow-sm bg-white">
                    <i className="bi bi-journal-medical text-success fs-1"></i>
                    <h2 className="fw-bold mb-0">{dbStats.newPatients}</h2>
                    <small className="text-muted fw-semibold">Health Records</small>
                  </div>
                </div>
                {/* PWD CARD - HIGH PRIORITY */}
                <div className="col-6">
                  <div className="border rounded-4 p-3 text-center h-100 shadow-sm bg-light border-primary border-opacity-25">
                    <i className="bi bi-person-wheelchair text-primary fs-1"></i>
                    <h2 className="fw-bold mb-0 text-primary">{dbStats.patientsWithDisability}</h2>
                    <small className="text-muted d-block fw-bold" style={{fontSize: '0.7rem'}}>PWD PATIENTS</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded-4 p-3 text-center h-100 shadow-sm bg-white">
                    <i className="bi bi-file-earmark-bar-graph text-success fs-1"></i>
                    <h2 className="fw-bold mb-0">{dbStats.totalReports}</h2>
                    <small className="text-muted fw-semibold">Total Reports</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="border rounded-4 overflow-hidden h-100 shadow-sm bg-white">
                <div className="text-white text-center py-2 fw-bold small" style={{backgroundColor: '#6CB4EE'}}>GENDER DISTRIBUTION</div>
                <div className="p-4">
                  {genderChartData && <Doughnut data={genderChartData} options={{plugins: {legend: {position: 'bottom'}}}} />}
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="border rounded-4 p-3 h-100 shadow-sm bg-white text-center">
                <h6 className="fw-bold mb-3 small text-uppercase text-muted">Common Diagnosis</h6>
                {diagnosisChartData && <Pie data={diagnosisChartData} options={{plugins: {legend: {position: 'bottom'}}}} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-wrapper flex-grow-1 bg-light min-vh-100">
        <main>{renderContent()}</main>
      </div>
    </div>
  );
}

export default Home;
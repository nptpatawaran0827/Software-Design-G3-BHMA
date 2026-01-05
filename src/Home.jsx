import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import RecordsPage from './RecordsPage';
import AnalyticsPage from './AnalyticsPage';
import ResidentPage from './ResidentPage'; // ✅ import ResidentPage

const SimplePieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto' }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const startRad = (startAngle - 90) * (Math.PI / 180);
          const endRad = (endAngle - 90) * (Math.PI / 180);

          const radius = 80;
          const x1 = 90 + radius * Math.cos(startRad);
          const y1 = 90 + radius * Math.sin(startRad);
          const x2 = 90 + radius * Math.cos(endRad);
          const y2 = 90 + radius * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;
          const path = `M 90 90 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

          currentAngle = endAngle;

          return (
            <path
              key={index}
              d={path}
              fill={item.color}
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
};

function Home({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Home');
  const [filter, setFilter] = useState('All Activities');
  const [activities, setActivities] = useState([]);

  const [shouldAutoOpenForm, setShouldAutoOpenForm] = useState(false);
  const [pendingResidents, setPendingResidents] = useState([]); 
  const [showNotification, setShowNotification] = useState(false); 
  const [preFillData, setPreFillData] = useState(null); 
  const [showResidentForm, setShowResidentForm] = useState(false); // ✅ open ResidentPage modal

  const dbStats = {
    totalPatients: 0,
    newPatients: 0,
    patientsWithDisability: 0,
    totalReports: 0,
    maleCount: 0,
    femaleCount: 0
  };

  const chartData = [
    { label: 'Tonsilitis', value: 30, color: '#FFB3A7' },
    { label: 'UTI', value: 20, color: '#86EFAC' },
    { label: 'Ulcer', value: 50, color: '#67E8F9' }
  ];

  const handleAddPatient = () => {
    setShouldAutoOpenForm(true);
    setActiveTab('Records');
  };

  useEffect(() => {
    if (activeTab !== 'Records') {
      setShouldAutoOpenForm(false);
      setPreFillData(null); 
    }
  }, [activeTab]);

  // ==================== FETCH PENDING RESIDENTS ====================
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
    fetchPending(); // initial fetch
    const interval = setInterval(fetchPending, 5000); // refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  // ==================== ACCEPT / REMOVE ====================
      const handleAccept = async (res) => {
      try {
        // Move to health_records + delete from pending
        await fetch(`http://localhost:5000/api/pending-residents/accept/${res.id}`, {
          method: 'POST'
        });

        // Open Records page with pre-filled data
        setPreFillData(res);
        setActiveTab('Records');
        setShouldAutoOpenForm(true);

        setShowNotification(false);
        fetchPending(); // refresh bell count
      } catch (err) {
        console.error('Accept failed:', err);
      }
    };


  const handleRemove = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/pending-residents/${id}`, { method: 'DELETE' });
      fetchPending(); // refresh pending list
    } catch (err) {
      console.error('Error removing resident:', err);
    }
  };

  // ==================== RECENT ACTIVITY ICONS ====================
  const getActivityIcon = (type) => {
    switch(type) {
      case 'New Patient':
        return 'bi-person-plus-fill';
      case 'Updated Record':
        return 'bi-pencil-square';
      case 'Deleted Record':
        return 'bi-trash-fill';
      case 'Report Generated':
        return 'bi-file-earmark-text-fill';
      default:
        return 'bi-circle-fill';
    }
  };

  const getActivityIconColor = (type) => {
    switch(type) {
      case 'New Patient':
        return 'text-success';
      case 'Updated Record':
        return 'text-primary';
      case 'Deleted Record':
        return 'text-danger';
      case 'Report Generated':
        return 'text-info';
      default:
        return 'text-secondary';
    }
  };

  const formatActivityMessage = (activity) => {
    switch(activity.type) {
      case 'New Patient':
        return (
          <span>New Patient Added: <strong>{activity.patientName}</strong> (ID {activity.id}) at {activity.time}.</span>
        );
      case 'Updated Record':
        return (
          <span>Record Updated: <strong>{activity.patientName}</strong> (ID {activity.id}) at {activity.time}.</span>
        );
      case 'Deleted Record':
        return (
          <span>Record Deleted: <strong>{activity.patientName}</strong> (ID {activity.id}) at {activity.time}.</span>
        );
      case 'Report Generated':
        return (
          <span>Report Generated for: <strong>{activity.patientName}</strong> (ID {activity.id}) at {activity.time}.</span>
        );
      default:
        return <span>Activity recorded at {activity.time}.</span>;
    }
  };

  // ==================== RENDER CONTENT ====================
  const renderContent = () => {
    switch (activeTab) {
      case 'Records':
        return (
          <RecordsPage
            autoOpenForm={shouldAutoOpenForm}
            preFillData={preFillData}
            onSubmitSuccess={fetchPending} // refresh pending after submission
          />
        );
      case 'Analytics':
        return <AnalyticsPage />;
      case 'Scan & Upload':
        return <div className="p-4"><h3>Scan & Upload Page</h3></div>;
      default:
        return (
          <div className="p-4">
            <div className="position-relative d-flex justify-content-end align-items-center">
              {/* Notification Bell */}
              <button 
                className="btn btn-outline-dark me-2" 
                onClick={() => setShowNotification(!showNotification)}
              >
                <i className="bi bi-bell"></i>
                {pendingResidents.length > 0 && <span className="badge bg-danger ms-1">{pendingResidents.length}</span>}
              </button>

              {/* Dropdown */}
              {showNotification && (
                <div className="position-absolute top-100 end-0 mt-2 bg-white border rounded shadow p-2" style={{ zIndex: 1000, width: '300px' }}>
                  <h6 className="mb-2">Pending Residents</h6>
                  <ul className="list-group list-group-flush">
                    {pendingResidents.length > 0 ? (
                      pendingResidents.map(res => (
                      <li
                      key={res.id}
                      className="list-group-item"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '12px',
                        alignItems: 'center'
                      }}
                    >
                      {/* Name + ID */}
                      <div>
                        <div className="fw-semibold" style={{ lineHeight: '1.2' }}>
                          {res.Resident_Name}
                        </div>
                        <div className="text-muted small">
                          ID: {res.Resident_ID}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-success btn-sm px-3"
                          onClick={() => handleAccept(res)}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-danger btn-sm px-3"
                          onClick={() => handleRemove(res.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </li>

                      ))
                    ) : (
                      <li className="list-group-item py-2 text-center text-muted">No pending residents</li>
                    )}
                  </ul>
                </div>
              )}

              <button className="btn btn-outline-dark" onClick={onLogout}>Logout</button>
            </div>

            {/* Recent Activity */}
            <h2 className="fw-bold mb-4 text-uppercase">WELCOME BACK, ADMIN!</h2>
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                <h5 className="mb-0 fw-bold">Recent Activity</h5>
                <select 
                  className="form-select form-select-sm w-auto" 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                >
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
                      <li key={index} className="list-group-item d-flex align-items-center py-3 border-0">
                        <i className={`bi ${getActivityIcon(item.type)} ${getActivityIconColor(item.type)} me-3 fs-5`}></i>
                        <div>{formatActivityMessage(item)}</div>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item py-4 text-center text-muted border-0">
                      No recent updates or activities found for "{filter}".
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Dashboard */}
            <h2 className="text-success fw-bold mb-3">Dashboard</h2>
            <div className="bg-white p-4 rounded-4 shadow-sm border">
              <button 
                className="btn btn-success fw-bold px-4 mb-4 rounded-3"
                onClick={handleAddPatient}
              >
                <i className="bi bi-plus-lg me-2"></i>Add Patient
              </button>

              <div className="row g-3">
                <div className="col-lg-5">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="border rounded-4 p-3 text-center d-flex flex-column align-items-center">
                        <i className="bi bi-person text-success fs-1"></i>
                        <h2 className="fw-bold mb-0">{dbStats.totalPatients}</h2>
                        <small className="text-muted">Total Patients</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded-4 p-3 text-center d-flex flex-column align-items-center">
                        <i className="bi bi-person-plus text-success fs-1"></i>
                        <h2 className="fw-bold mb-0">{dbStats.newPatients}</h2>
                        <small className="text-muted">New Patients</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded-4 p-3 text-center d-flex flex-column align-items-center">
                        <i className="bi bi-person-wheelchair text-success fs-1"></i>
                        <h2 className="fw-bold mb-0">{dbStats.patientsWithDisability}</h2>
                        <small className="text-muted text-wrap" style={{fontSize: '0.75rem'}}>Patients With Disability</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded-4 p-3 text-center d-flex flex-column align-items-center">
                        <i className="bi bi-file-earmark-text text-success fs-1"></i>
                        <h2 className="fw-bold mb-0">{dbStats.totalReports}</h2>
                        <small className="text-muted">Total Reports Generated</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="border rounded-4 overflow-hidden h-100 d-flex flex-column">
                    <div className="text-white text-center py-2 fw-bold" style={{backgroundColor: '#6CB4EE'}}>
                      Patient Gender Distribution
                    </div>
                    <div className="d-flex flex-grow-1 align-items-center text-center">
                      <div className="flex-fill border-end py-4">
                        <small className="text-muted d-block mb-2">Male</small>
                        <h1 className="display-4 fw-bold">{dbStats.maleCount}</h1>
                      </div>
                      <div className="flex-fill py-4">
                        <small className="text-muted d-block mb-2">Female</small>
                        <h1 className="display-4 fw-bold">{dbStats.femaleCount}</h1>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3">
                  <div className="border rounded-4 p-3 h-100">
                    <h6 className="fw-bold text-center mb-3">Common Diagnosis</h6>
                    <SimplePieChart data={chartData} />
                    <div className="mt-3 small text-muted">
                      <div className="d-flex justify-content-between mb-1"><span className="fw-bold">Legend:</span></div>
                      {chartData.map((item, index) => (
                        <div key={index}>
                          <i className="bi bi-square-fill me-1" style={{color: item.color}}></i> {item.label} ({item.value}%)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-wrapper flex-grow-1 bg-light min-vh-100">
        <main>
          {renderContent()}

          {/* ResidentPage modal */}
          {showResidentForm && (
            <ResidentPage
              onCancel={() => setShowResidentForm(false)}
              preFillData={preFillData}
              onSubmitSuccess={() => {
                setShowResidentForm(false);
                fetchPending();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;

import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import Sidebar from './Sidebar';
import RecordsPage from './RecordsPage';
import AnalyticsPage from './AnalyticsPage';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Home({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Home');
  const [filter, setFilter] = useState('All Activities');
  const [activities, setActivities] = useState([]);
  const [shouldAutoOpenForm, setShouldAutoOpenForm] = useState(false);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize with default values
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

  // Fetch health records from database
  useEffect(() => {
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

    fetchHealthRecords();
  }, []);

  // Calculate all statistics from health records
  const calculateStatistics = (records) => {
    if (!records || records.length === 0) {
      setDbStats({
        totalPatients: 0,
        newPatients: 0,
        patientsWithDisability: 0,
        totalReports: 0,
        maleCount: 0,
        femaleCount: 0
      });
      return;
    }

    // Total patients (unique resident IDs)
    const uniquePatients = new Set(records.map(r => r.Resident_ID));
    const totalPatients = uniquePatients.size;

    // Count males and females
    const maleCount = records.filter(r => r.Sex && r.Sex.toLowerCase() === 'male').length;
    const femaleCount = records.filter(r => r.Sex && r.Sex.toLowerCase() === 'female').length;

    // Count diagnoses for pie chart
    const diagnosisCounts = {};
    records.forEach(record => {
      if (record.Diagnosis) {
        const diagnosis = record.Diagnosis.toLowerCase().trim();
        diagnosisCounts[diagnosis] = (diagnosisCounts[diagnosis] || 0) + 1;
      }
    });

    // Sort diagnoses by count and get top 5
    const sortedDiagnoses = Object.entries(diagnosisCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Create diagnosis chart data
    const diagnosisLabels = sortedDiagnoses.map(([diagnosis]) => 
      diagnosis.charAt(0).toUpperCase() + diagnosis.slice(1)
    );
    const diagnosisValues = sortedDiagnoses.map(([, count]) => count);

    const colors = ['#FFB3A7', '#86EFAC', '#67E8F9', '#FFD700', '#DDA0DD'];

    setDiagnosisChartData({
      labels: diagnosisLabels,
      datasets: [
        {
          data: diagnosisValues,
          backgroundColor: colors.slice(0, diagnosisLabels.length),
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    });

    // Create gender chart data
    setGenderChartData({
      labels: ['Male', 'Female'],
      datasets: [
        {
          label: 'Patient Count',
          data: [maleCount, femaleCount],
          backgroundColor: ['#4A90E2', '#F5A623'],
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    });

    setDbStats({
      totalPatients: totalPatients,
      newPatients: records.length,
      patientsWithDisability: 0,
      totalReports: records.length,
      maleCount: maleCount,
      femaleCount: femaleCount
    });
  };

  const handleAddPatient = () => {
    setShouldAutoOpenForm(true);
    setActiveTab('Records');
  };

  useEffect(() => {
    if (activeTab !== 'Records') {
      setShouldAutoOpenForm(false);
    }
  }, [activeTab]);

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Records':
        return <RecordsPage autoOpenForm={shouldAutoOpenForm} />;
        
      case 'Analytics':
        return <AnalyticsPage />;
        
      case 'Scan & Upload':
        return <div className="p-4"><h3>Scan & Upload Page</h3></div>;
        
      default:
        return (
          <div className="p-4">
            <div className="position-relative">
              <button 
                className="btn btn-outline-dark position-absolute top-0 end-0" 
                onClick={onLogout}
                style={{ zIndex: 10 }}
              >
                Logout
              </button>
            </div>

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
                        <div>
                          {formatActivityMessage(item)}
                        </div>
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

            <h2 className="text-success fw-bold mb-3">Dashboard</h2>
            <div className="bg-white p-4 rounded-4 shadow-sm border">
              
              <button 
                className="btn btn-success fw-bold px-4 mb-4 rounded-3"
                onClick={handleAddPatient}
              >
                <i className="bi bi-plus-lg me-2"></i>Add Patient
              </button>

              <div className="row g-3">
                {/* Statistics Cards */}
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

                {/* Gender Distribution Doughnut Chart */}
                <div className="col-lg-4">
                  <div className="border rounded-4 overflow-hidden h-100 d-flex flex-column">
                    <div className="text-white text-center py-2 fw-bold" style={{backgroundColor: '#6CB4EE'}}>
                      Patient Gender Distribution
                    </div>
                    <div className="d-flex flex-grow-1 align-items-center justify-content-center p-3">
                      {genderChartData ? (
                        <Doughnut data={genderChartData} options={chartOptions} />
                      ) : (
                        <p className="text-muted">Loading...</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Diagnosis Pie Chart */}
                <div className="col-lg-3">
                  <div className="border rounded-4 p-3 h-100 d-flex flex-column">
                    <h6 className="fw-bold text-center mb-3">Common Diagnosis</h6>
                    <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                      {diagnosisChartData ? (
                        <Pie data={diagnosisChartData} options={chartOptions} />
                      ) : (
                        <p className="text-muted">Loading...</p>
                      )}
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
        <main>{renderContent()}</main>
      </div>
    </div>
  );
}

export default Home;
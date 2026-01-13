import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import './style/AnalyticsPage.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AnalyticsPage = () => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalResidents: 0,
    maleCount: 0,
    femaleCount: 0,
    activeCases: 0,
    topCondition: 'N/A',
    pwdCount: 0
  });

  const [chartsData, setChartsData] = useState({
    residentsPerStreet: null,
    ageGroupDistribution: null,
    healthConditions: null,
    nutritionStatus: null,
    pwdDistribution: null
  });

  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health-records');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setHealthRecords(data);
          calculateAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching health records:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHealthRecords();
  }, []);

  const calculateAnalytics = (records) => {
    if (!records || records.length === 0) return;

    const uniqueResidents = new Set(records.map(r => r.Resident_ID));
    const totalResidents = uniqueResidents.size;
    const maleCount = records.filter(r => r.Sex === 'Male').length;
    const femaleCount = records.filter(r => r.Sex === 'Female').length;
    const pwdCount = records.filter(r => r.Is_PWD == 1 || r.Is_PWD === true).length;
    
    const conditionCounts = {};
    records.forEach(record => {
      if (record.Health_Condition) {
        conditionCounts[record.Health_Condition] = (conditionCounts[record.Health_Condition] || 0) + 1;
      }
    });
    const topCondition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    setStats({ totalResidents, maleCount, femaleCount, topCondition, pwdCount });
    buildChartsData(records, conditionCounts, pwdCount);
  };

  const buildChartsData = (records, conditionCounts, pwdCount) => {
    // 1. Residents per Street
    const streetCounts = {};
    records.forEach(r => {
      if (r.Street) {
        const street = r.Street.trim();
        streetCounts[street] = (streetCounts[street] || 0) + 1;
      }
    });
    const sortedStreets = Object.entries(streetCounts).sort((a, b) => b[1] - a[1]);

    // 2. Age Groups
    const ageGroupCounts = { 'Infants': 0, 'Children': 0, 'Teens': 0, 'Adults': 0, 'Seniors': 0 };
    records.forEach(r => {
      let age = r.Age;
      if (!age && r.Birthdate) {
        const birthDate = new Date(r.Birthdate);
        age = new Date().getFullYear() - birthDate.getFullYear();
      }
      if (age <= 1) ageGroupCounts['Infants']++;
      else if (age <= 12) ageGroupCounts['Children']++;
      else if (age <= 19) ageGroupCounts['Teens']++;
      else if (age <= 59) ageGroupCounts['Adults']++;
      else ageGroupCounts['Seniors']++;
    });

    // 3. Nutrition
    const nutritionCounts = {};
    records.forEach(r => { if (r.Nutrition_Status) nutritionCounts[r.Nutrition_Status] = (nutritionCounts[r.Nutrition_Status] || 0) + 1; });

    setChartsData({
      residentsPerStreet: {
        labels: sortedStreets.map(([s]) => s),
        datasets: [{ label: 'Residents', data: sortedStreets.map(([, c]) => c), backgroundColor: '#4A90E2', borderRadius: 4 }]
      },
      ageGroupDistribution: {
        labels: Object.keys(ageGroupCounts),
        datasets: [{ data: Object.values(ageGroupCounts), backgroundColor: ['#67E8F9', '#86EFAC', '#FFD93D', '#4A90E2', '#A78BFA'], borderRadius: 4 }]
      },
      healthConditions: {
        labels: Object.keys(conditionCounts),
        datasets: [{ data: Object.values(conditionCounts), backgroundColor: ['#43E9A6', '#FFD93D', '#FF6B6B'] }]
      },
      nutritionStatus: {
        labels: Object.keys(nutritionCounts),
        datasets: [{ data: Object.values(nutritionCounts), backgroundColor: ['#67E8F9', '#43E9A6', '#FFD93D', '#FF6B6B'] }]
      },
      pwdDistribution: {
        labels: ['PWD', 'Non-PWD'],
        datasets: [{ data: [pwdCount, records.length - pwdCount], backgroundColor: ['#A78BFA', '#E2E8F0'] }]
      }
    });
  };

  const barOptions = { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };
  const pieOptions = { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } };

  if (loading) return <div className="p-4 text-center">Loading analytics...</div>;

  const totalGender = stats.maleCount + stats.femaleCount;
  const mPct = totalGender > 0 ? Math.round((stats.maleCount / totalGender) * 100) : 0;
  const fPct = totalGender > 0 ? 100 - mPct : 0;

  return (
    <div className="analytics-page-root p-4">
      <h2 className="mb-4">Health Analytics Dashboard</h2>

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3"><div className="stat-card"><div>Total Residents</div><h3>{stats.totalResidents}</h3></div></div>
        <div className="col-lg-3">
            <div className="stat-card">
                <div>Gender</div>
                <span>M: {mPct}% | F: {fPct}%</span>
                <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', mt: '5px' }}>
                    <div style={{ width: `${mPct}%`, backgroundColor: '#4A90E2' }}></div>
                    <div style={{ width: `${fPct}%`, backgroundColor: '#F56969' }}></div>
                </div>
            </div>
        </div>
        <div className="col-lg-3"><div className="stat-card"><div>PWDs</div><h3>{stats.pwdCount}</h3></div></div>
        <div className="col-lg-3"><div className="stat-card"><div>Top Condition</div><h3 className="text-success">{stats.topCondition}</h3></div></div>
      </div>

      {/* Demographics Row */}
      <h5 className="fw-bold mb-3">Community Demographics</h5>
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="chart-card">
            <h6 className="fw-bold">Residents per Street</h6>
            {chartsData.residentsPerStreet && <Bar data={chartsData.residentsPerStreet} options={barOptions} />}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="chart-card">
            <h6 className="fw-bold">Age Group Distribution</h6>
            {chartsData.ageGroupDistribution && <Bar data={chartsData.ageGroupDistribution} options={barOptions} />}
          </div>
        </div>
      </div>

      {/* Health Row */}
      <h5 className="fw-bold mb-3">Health & Disability Status</h5>
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="chart-card">
            <h6 className="fw-bold">PWD Distribution</h6>
            {chartsData.pwdDistribution && <Doughnut data={chartsData.pwdDistribution} options={pieOptions} />}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="chart-card">
            <h6 className="fw-bold">Health Conditions</h6>
            {chartsData.healthConditions && <Pie data={chartsData.healthConditions} options={pieOptions} />}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="chart-card">
            <h6 className="fw-bold">Nutrition Status</h6>
            {chartsData.nutritionStatus && <Doughnut data={chartsData.nutritionStatus} options={pieOptions} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
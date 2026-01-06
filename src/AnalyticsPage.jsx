import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import './style/AnalyticsPage.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AnalyticsPage = () => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalResidents: 0,
    maleCount: 0,
    femaleCount: 0,
    activeCases: 0,
    topCondition: 'N/A'
  });

  const [chartsData, setChartsData] = useState({
    residentsPerStreet: null,
    ageGroupDistribution: null,
    healthConditions: null,
    nutritionStatus: null
  });

  // Fetch health records
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

  // Calculate all analytics
  const calculateAnalytics = (records) => {
    if (!records || records.length === 0) return;

    // Total residents (unique)
    const uniqueResidents = new Set(records.map(r => r.Resident_ID));
    const totalResidents = uniqueResidents.size;

    // Gender distribution
    const maleCount = records.filter(r => r.Sex && r.Sex.toLowerCase() === 'male').length;
    const femaleCount = records.filter(r => r.Sex && r.Sex.toLowerCase() === 'female').length;

    // Active cases (status = Active)
    const activeCases = records.filter(r => r.status && r.status.toLowerCase() === 'active').length;

    // Top condition
    const conditionCounts = {};
    records.forEach(record => {
      if (record.Health_Condition) {
        const condition = record.Health_Condition.toLowerCase().trim();
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
      }
    });
    const topCondition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    setStats({
      totalResidents,
      maleCount,
      femaleCount,
      activeCases,
      topCondition: topCondition.charAt(0).toUpperCase() + topCondition.slice(1)
    });

    // Build charts
    buildChartsData(records, conditionCounts);
  };

  const buildChartsData = (records, conditionCounts) => {
    // 1. Residents per Street (Address)
    const streetCounts = {};
    records.forEach(record => {
      if (record.Address) {
        const street = record.Address.split(',')[0].trim();
        streetCounts[street] = (streetCounts[street] || 0) + 1;
      }
    });
    const sortedStreets = Object.entries(streetCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    
    const residentsPerStreetData = {
      labels: sortedStreets.map(([street]) => street),
      datasets: [{
        label: 'Number of Residents',
        data: sortedStreets.map(([, count]) => count),
        backgroundColor: ['#4A90E2', '#43E9A6', '#86EFAC'],
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 4
      }]
    };

    // 2. Age Group Distribution - Vertical Bar Chart
    const ageGroups = {
      'Infants': [0, 1],
      'Children': [1, 12],
      'Teens': [12, 18],
      'Adults': [18, 60],
      'Seniors': [60, 150]
    };
    
    const ageGroupCounts = {};
    Object.keys(ageGroups).forEach(group => {
      ageGroupCounts[group] = records.filter(r => {
        const age = parseInt(r.Age);
        const [min, max] = ageGroups[group];
        return age >= min && age < max;
      }).length;
    });

    const ageGroupDistributionData = {
      labels: Object.keys(ageGroupCounts),
      datasets: [{
        label: 'Number of Residents',
        data: Object.values(ageGroupCounts),
        backgroundColor: ['#67E8F9', '#86EFAC', '#FFD93D', '#43E9A6', '#86EFAC'],
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 4
      }]
    };

    // 3. Health Conditions
    const sortedConditions = Object.entries(conditionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const healthConditionsData = {
      labels: sortedConditions.map(([condition]) => 
        condition.charAt(0).toUpperCase() + condition.slice(1)
      ),
      datasets: [{
        data: sortedConditions.map(([, count]) => count),
        backgroundColor: ['#4A90E2', '#43E9A6', '#FFD93D', '#FF6B6B', '#FF85A2', '#A7E7F3'],
        borderColor: '#fff',
        borderWidth: 2
      }]
    };

    // 4. Nutrition Status (based on BMI)
    const nutritionCounts = {
      'Underweight': 0,
      'Normal': 0,
      'Overweight': 0,
      'Obese': 0
    };

    records.forEach(record => {
      const bmi = parseFloat(record.BMI);
      if (!isNaN(bmi)) {
        if (bmi < 18.5) nutritionCounts['Underweight']++;
        else if (bmi < 25) nutritionCounts['Normal']++;
        else if (bmi < 30) nutritionCounts['Overweight']++;
        else nutritionCounts['Obese']++;
      }
    });

    const nutritionStatusData = {
      labels: Object.keys(nutritionCounts),
      datasets: [{
        data: Object.values(nutritionCounts),
        backgroundColor: ['#67E8F9', '#43E9A6', '#FFD93D', '#FF6B6B'],
        borderColor: '#fff',
        borderWidth: 2
      }]
    };

    setChartsData({
      residentsPerStreet: residentsPerStreetData,
      ageGroupDistribution: ageGroupDistributionData,
      healthConditions: healthConditionsData,
      nutritionStatus: nutritionStatusData
    });
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

  // Vertical bar chart options
  const verticalBarChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'x',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 11 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 2500,
        ticks: {
          stepSize: 500
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-muted">Loading analytics...</div>;
  }

  const malePercentage = stats.maleCount + stats.femaleCount > 0 
    ? Math.round((stats.maleCount / (stats.maleCount + stats.femaleCount)) * 100)
    : 0;

  const femalePercentage = 100 - malePercentage;

  return (
    <div className="analytics-page-root p-4">
      {/* Header Section */}
      <div className="analytics-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h2>Health Analytics</h2>
          <div className="d-flex align-items-center gap-2">
            <input 
              type="text" 
              className="form-control form-control-sm" 
              placeholder="Filter by Street"
              style={{ width: '150px' }}
            />
            <i className="bi bi-search"></i>
          </div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="row g-3 mb-4">
        {/* Total Residents */}
        <div className="col-lg-3 col-md-6">
          <div className="stat-card">
            <div className="stat-label">Total Residents</div>
            <div className="stat-value">{stats.totalResidents.toLocaleString()}</div>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="col-lg-3 col-md-6">
          <div className="stat-card">
            <div className="stat-label">Gender Distribution</div>
            <div className="stat-details">
              <span className="gender-badge male-badge">Male {malePercentage}%</span>
              <span className="gender-badge female-badge">Female {femalePercentage}%</span>
            </div>
            <div style={{ height: '20px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${malePercentage}%`, backgroundColor: '#4A90E2', transition: 'width 0.3s ease' }}></div>
              <div style={{ width: `${femalePercentage}%`, backgroundColor: '#F56969', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
        </div>

        {/* Active Cases */}
        <div className="col-lg-3 col-md-6">
          <div className="stat-card">
            <div className="stat-label">Active Cases This Month</div>
            <div className="stat-value alert-value">{stats.activeCases}</div>
          </div>
        </div>

        {/* Top Condition */}
        <div className="col-lg-3 col-md-6">
          <div className="stat-card">
            <div className="stat-label">Top Condition</div>
            <div className="stat-value condition-value">{stats.topCondition}</div>
          </div>
        </div>
      </div>

      {/* Demographics Section */}
      <h5 className="fw-bold mb-3">Demographics Overview</h5>
      <div className="row g-3 mb-4">
        {/* Residents per Street */}
        <div className="col-lg-6">
          <div className="chart-card">
            <h6 className="fw-bold">Residents per Street</h6>
            {chartsData.residentsPerStreet ? (
              <Bar data={chartsData.residentsPerStreet} options={verticalBarChartOptions} />
            ) : (
              <p className="text-muted text-center">Loading...</p>
            )}
          </div>
        </div>

        {/* Age Group Distribution */}
        <div className="col-lg-6">
          <div className="chart-card">
            <h6 className="fw-bold">Age Group Distribution</h6>
            {chartsData.ageGroupDistribution ? (
              <Bar data={chartsData.ageGroupDistribution} options={verticalBarChartOptions} />
            ) : (
              <p className="text-muted text-center">Loading...</p>
            )}
          </div>
        </div>
      </div>

      {/* Health Conditions & Nutrition */}
      <h5 className="fw-bold mb-3">Health Status</h5>
      <div className="row g-3">
        {/* Most Common Health Conditions */}
        <div className="col-lg-6">
          <div className="chart-card">
            <h6 className="fw-bold">Most Common Health Conditions</h6>
            {chartsData.healthConditions ? (
              <div style={{ maxHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pie data={chartsData.healthConditions} options={chartOptions} />
              </div>
            ) : (
              <p className="text-muted text-center">Loading...</p>
            )}
          </div>
        </div>

        {/* Nutrition Status Distribution */}
        <div className="col-lg-6">
          <div className="chart-card">
            <h6 className="fw-bold">Nutrition Status Distribution</h6>
            {chartsData.nutritionStatus ? (
              <div style={{ maxHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut data={chartsData.nutritionStatus} options={chartOptions} />
              </div>
            ) : (
              <p className="text-muted text-center">Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
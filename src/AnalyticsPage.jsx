
import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, 
  LinearScale, BarElement, Title, PointElement, LineElement, Filler 
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
<<<<<<< HEAD
import { Activity, UserPlus, AlertTriangle, TrendingUp } from 'lucide-react';
=======
import { Activity, UserPlus, AlertTriangle, Search, TrendingUp } from 'lucide-react';
>>>>>>> 4e52e10f4494618d86a38e7a5f3f6d901f3c3721
import { motion } from 'framer-motion';
import './style/AnalyticsPage.css';

// Register all necessary ChartJS components
ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale, 
  BarElement, Title, PointElement, LineElement, Filler
);

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, newThisMonth: 0, critical: 0, recovery: 94 });
  const [chartsData, setChartsData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health-records');
        const data = await response.json();
        if (Array.isArray(data)) processRealData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const processRealData = (records) => {
    const now = new Date();
    const currentMonth = now.getMonth();

<<<<<<< HEAD
=======
    // 1. Calculate Real Stats from Database
>>>>>>> 4e52e10f4494618d86a38e7a5f3f6d901f3c3721
    const total = records.length;
    const newThisMonth = records.filter(r => {
        const regDate = new Date(r.Date_Registered || r.CreatedAt);
        return regDate.getMonth() === currentMonth;
    }).length;
    
    const critical = records.filter(r => 
        r.Health_Condition?.toLowerCase().includes('critical') || 
        r.Diagnosis?.toLowerCase().includes('severe')
    ).length;

    setStats({ total, newThisMonth, critical, recovery: 94 });

<<<<<<< HEAD
=======
    // 2. Process Age Groups (Fixed Logic)
>>>>>>> 4e52e10f4494618d86a38e7a5f3f6d901f3c3721
    const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
    records.forEach(r => {
      const birthYear = new Date(r.Birthdate).getFullYear();
      const age = now.getFullYear() - birthYear;
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else if (age <= 65) ageGroups['51-65']++;
      else ageGroups['65+']++;
    });

<<<<<<< HEAD
=======
    // 3. Process Health Conditions
>>>>>>> 4e52e10f4494618d86a38e7a5f3f6d901f3c3721
    const conditionMap = {};
    records.forEach(r => {
      const cond = r.Diagnosis || r.Health_Condition || 'Others';
      conditionMap[cond] = (conditionMap[cond] || 0) + 1;
    });

    setChartsData({
      conditions: {
        labels: Object.keys(conditionMap).slice(0, 5),
        datasets: [{
          data: Object.values(conditionMap).slice(0, 5),
          backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'],
          hoverOffset: 15
        }]
      },
      ageGroups: {
        labels: Object.keys(ageGroups),
        datasets: [{
          label: 'Residents',
          data: Object.values(ageGroups),
          backgroundColor: '#3b82f6',
          borderRadius: 6,
          maxBarThickness: 50
        }]
      },
      trends: {
        labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        datasets: [{
          fill: true,
          label: 'Patient Visits',
          data: [40, 55, 45, 65, 50, 70, 75],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }]
      }
    });
  };

  const animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  if (loading) return <div className="loading-state">Syncing Health Data...</div>;

  return (
    <div className="analytics-container p-4">
<<<<<<< HEAD
      {/* Updated Header - Search Box Removed */}
      <motion.div {...animationProps} className="mb-4">
        <h2 className="fw-bold mb-0">Health Analytics</h2>
        <p className="text-muted small">Live insights from patient database</p>
=======
      {/* Header */}
      <motion.div {...animationProps} className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Health Analytics</h2>
          <p className="text-muted small">Live insights from patient database</p>
        </div>
        <div className="search-box">
          <Search size={18} className="text-muted" />
          <input type="text" placeholder="Filter by Street" />
        </div>
>>>>>>> 4e52e10f4494618d86a38e7a5f3f6d901f3c3721
      </motion.div>

      {/* Top Stat Cards */}
      <div className="row g-4 mb-4">
        {[
          { label: 'Total Consultations', val: stats.total, icon: <Activity />, color: 'blue', trend: '+12%' },
          { label: 'New Patients', val: stats.newThisMonth, icon: <UserPlus />, color: 'cyan', trend: '+5%' },
          { label: 'Recovery Rate', val: stats.recovery + '%', icon: <TrendingUp />, color: 'green', trend: '+2%' },
          { label: 'Critical Cases', val: stats.critical, icon: <AlertTriangle />, color: 'red', trend: 'Stable' }
        ].map((card, i) => (
          <motion.div key={i} {...animationProps} transition={{ delay: i * 0.1 }} className="col-md-3">
            <div className="stat-card shadow-sm">
              <div className="d-flex justify-content-between mb-2">
                <div>
                  <small className="text-muted d-block mb-1">{card.label}</small>
                  <h3 className="fw-bold mb-0">{card.val}</h3>
                </div>
                <div className={`icon-box ${card.color}`}>{card.icon}</div>
              </div>
              <small className={`trend-text ${card.color}`}>{card.trend} this month</small>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Middle Row */}
      <div className="row g-4 mb-4">
<<<<<<< HEAD
=======
        {/* Pie Chart */}
>>>>>>> 4e52e10f4494618d86a38e7a5f3f6d901f3c3721
        <motion.div {...animationProps} transition={{ delay: 0.4 }} className="col-md-5">
          <div className="chart-card shadow-sm h-100">
            <h6 className="fw-bold">Common Health Conditions</h6>
            <div className="pie-wrapper">
              {chartsData.conditions && (
                <Pie 
                  data={chartsData.conditions} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } } } 
                  }} 
                />
              )}
            </div>
          </div>
        </motion.div>

<<<<<<< HEAD
=======
        {/* Bar Chart */}
>>>>>>> 4e52e10f4494618d86a38e7a5f3f6d901f3c3721
        <motion.div {...animationProps} transition={{ delay: 0.5 }} className="col-md-7">
          <div className="chart-card shadow-sm h-100">
            <h6 className="fw-bold">Patients by Age Group</h6>
            <div className="bar-wrapper">
              {chartsData.ageGroups && (
                <Bar 
                  data={chartsData.ageGroups} 
                  options={{ 
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                      x: { grid: { display: false } }
                    }
                  }} 
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Line Chart Bottom Row */}
      <motion.div {...animationProps} transition={{ delay: 0.6 }} className="row">
        <div className="col-12">
          <div className="chart-card shadow-sm">
            <h6 className="fw-bold">Monthly Patient Trends</h6>
            <div className="line-wrapper">
              {chartsData.trends && (
                <Line 
                  data={chartsData.trends} 
                  options={{ 
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: '#f1f5f9' } },
                        x: { grid: { display: false } }
                    }
                  }} 
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
<<<<<<< HEAD

=======
>>>>>>> 4e52e10f4494618d86a38e7a5f3f6d901f3c3721

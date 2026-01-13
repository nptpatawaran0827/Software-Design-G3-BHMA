import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels'; 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './style/AnalyticsPage.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartDataLabels);

const AnalyticsPage = () => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);
  
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

  const handleExportPDF = async () => {
    const element = reportRef.current;
    
    // Higher scale for crisp text in the PDF
    const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff" // Ensures background is white
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Health_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const calculateAnalytics = (records) => {
    if (!records || records.length === 0) return;
    const uniqueResidents = new Set(records.map(r => r.Resident_ID));
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

    setStats({ totalResidents: uniqueResidents.size, maleCount, femaleCount, topCondition, pwdCount });
    buildChartsData(records, conditionCounts, pwdCount);
  };

  const buildChartsData = (records, conditionCounts, pwdCount) => {
    const streetCounts = {};
    records.forEach(r => {
      if (r.Street) {
        const street = r.Street.trim();
        streetCounts[street] = (streetCounts[street] || 0) + 1;
      }
    });
    const sortedStreets = Object.entries(streetCounts).sort((a, b) => b[1] - a[1]);

    const ageGroupCounts = { 'Infants': 0, 'Children': 0, 'Teens': 0, 'Adults': 0, 'Seniors': 0 };
    records.forEach(r => {
      let age = r.Age || (r.Birthdate ? new Date().getFullYear() - new Date(r.Birthdate).getFullYear() : 0);
      if (age <= 1) ageGroupCounts['Infants']++;
      else if (age <= 12) ageGroupCounts['Children']++;
      else if (age <= 19) ageGroupCounts['Teens']++;
      else if (age <= 59) ageGroupCounts['Adults']++;
      else ageGroupCounts['Seniors']++;
    });

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

  const commonOptions = {
    animation: false,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      datalabels: {
        display: true,
        color: '#000000',
        font: { weight: 'bold', size: 14 },
        formatter: (value) => value > 0 ? value : '', 
      }
    }
  };

  const barOptions = {
    ...commonOptions,
    plugins: { ...commonOptions.plugins, legend: { display: false }, datalabels: { ...commonOptions.plugins.datalabels, anchor: 'end', align: 'top', offset: 4 } },
    scales: { y: { beginAtZero: true, grace: '15%', ticks: { stepSize: 1 } } }
  };

  const pieOptions = {
    ...commonOptions,
    plugins: { ...commonOptions.plugins, legend: { position: 'bottom' }, datalabels: { ...commonOptions.plugins.datalabels, anchor: 'center', align: 'center', textStrokeColor: '#ffffff', textStrokeWidth: 2 } }
  };

  if (loading) return <div className="p-4 text-center">Loading analytics...</div>;

  const totalGender = stats.maleCount + stats.femaleCount;
  const mPct = totalGender > 0 ? Math.round((stats.maleCount / totalGender) * 100) : 0;
  const fPct = totalGender > 0 ? 100 - mPct : 0;

  return (
    <div className="analytics-page-root p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0 fw-bold">Analytics Dashboard</h2>
        <button className="btn btn-danger fw-bold px-4" onClick={handleExportPDF}>
          <i className="bi bi-file-earmark-pdf me-2"></i>Download PDF Report
        </button>
      </div>

      {/* THE PRINTABLE AREA STARTS HERE */}
      <div ref={reportRef} className="bg-white p-4 rounded-4 shadow-sm border">
        
        {/* ================= PDF HEADER (NEW) ================= */}
        <div className="text-center mb-5 pb-3 border-bottom">
            <h2 className="fw-bold text-uppercase mb-1" style={{ letterSpacing: '2px' }}>Health Analytics Report</h2>
            <h5 className="text-muted mb-3">Community Health Information System</h5>
            <div className="d-flex justify-content-center gap-4 small text-secondary">
                <span><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span><strong>Total Records:</strong> {healthRecords.length}</span>
            </div>
        </div>
        {/* ==================================================== */}

        <div className="row g-3 mb-4">
          <div className="col-lg-3"><div className="stat-card"><div>Total Residents</div><h3>{stats.totalResidents}</h3></div></div>
          <div className="col-lg-3">
              <div className="stat-card">
                  <div>Gender Split</div>
                  <span>M: {mPct}% | F: {fPct}%</span>
                  <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '5px' }}>
                      <div style={{ width: `${mPct}%`, backgroundColor: '#4A90E2' }}></div>
                      <div style={{ width: `${fPct}%`, backgroundColor: '#F56969' }}></div>
                  </div>
              </div>
          </div>
          <div className="col-lg-3"><div className="stat-card"><div>Total PWDs</div><h3>{stats.pwdCount}</h3></div></div>
          <div className="col-lg-3"><div className="stat-card"><div>Leading Condition</div><h3 className="text-success">{stats.topCondition}</h3></div></div>
        </div>

        <h5 className="fw-bold mb-3 border-start border-4 border-primary ps-2">Community Demographics</h5>
        <div className="row g-3 mb-5">
          <div className="col-lg-6">
            <div className="chart-card">
              <h6 className="fw-bold text-muted">Residents per Street</h6>
              {chartsData.residentsPerStreet && <Bar data={chartsData.residentsPerStreet} options={barOptions} />}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="chart-card">
              <h6 className="fw-bold text-muted">Age Group Distribution</h6>
              {chartsData.ageGroupDistribution && <Bar data={chartsData.ageGroupDistribution} options={barOptions} />}
            </div>
          </div>
        </div>

        <h5 className="fw-bold mb-3 border-start border-4 border-primary ps-2">Health & Disability Overview</h5>
        <div className="row g-3">
          <div className="col-lg-4">
            <div className="chart-card text-center">
              <h6 className="fw-bold text-muted">PWD Distribution</h6>
              {chartsData.pwdDistribution && <Doughnut data={chartsData.pwdDistribution} options={pieOptions} />}
            </div>
          </div>
          <div className="col-lg-4">
            <div className="chart-card text-center">
              <h6 className="fw-bold text-muted">Health Conditions</h6>
              {chartsData.healthConditions && <Pie data={chartsData.healthConditions} options={pieOptions} />}
            </div>
          </div>
          <div className="col-lg-4">
            <div className="chart-card text-center">
              <h6 className="fw-bold text-muted">Nutrition Status</h6>
              {chartsData.nutritionStatus && <Doughnut data={chartsData.nutritionStatus} options={pieOptions} />}
            </div>
          </div>
        </div>

          {/* PDF FOOTER (Optional) */}
          <div className="mt-5 pt-4 text-center border-top small text-muted">
              <p>Generated by Health Information System Dashboard oF PUP CEA GROUP 3 &copy; 2026</p>
          </div>
        </div>
      </div>
    );
  };

  export default AnalyticsPage;
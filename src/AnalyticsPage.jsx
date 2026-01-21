import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Calendar, X, Activity, Filter, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderBanner from "./HeaderBanner";
import "./style/AnalyticsPage.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartDataLabels);

const AnalyticsPage = ({ onLogout }) => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [showCalendar, setShowCalendar] = useState(false);
  const [filterMode, setFilterMode] = useState("weekly"); // Default changed to weekly

  // HELPER: Get the Sunday and Saturday of a given date's week
  const getWeekRange = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToSun = date.getDate() - day;
    
    const startOfWeek = new Date(date.setDate(diffToSun));
    const endOfWeek = new Date(date.setDate(startOfWeek.getDate() + 6));
    
    return { startOfWeek, endOfWeek };
  };

  const formatToLongDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { month: "long", day: "numeric", year: "numeric" };
    
    if (filterMode === "weekly") {
      const { startOfWeek, endOfWeek } = getWeekRange(dateStr);
      return `${startOfWeek.toLocaleDateString("en-US", options)} – ${endOfWeek.toLocaleDateString("en-US", options)}`;
    }
    
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const [stats, setStats] = useState({ totalResidents: 0, maleCount: 0, femaleCount: 0, pwdCount: 0 });
  const [chartsData, setChartsData] = useState({
    residentsPerStreet: null, ageGroupDistribution: null, healthConditions: null, nutritionStatus: null, pwdDistribution: null,
  });

  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health-records");
        const data = await response.json();
        if (Array.isArray(data)) setHealthRecords(data);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchHealthRecords();
  }, []);

  useEffect(() => {
    if (healthRecords.length === 0) return;

    const filtered = healthRecords.filter((record) => {
      const dateField = record.Date_Visited || record.Date;
      const recordD = new Date(dateField);
      
      if (filterMode === "weekly") {
        const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
        // Normalize to midnight for comparison
        recordD.setHours(0,0,0,0);
        startOfWeek.setHours(0,0,0,0);
        endOfWeek.setHours(0,0,0,0);
        return recordD >= startOfWeek && recordD <= endOfWeek;
      } else {
        // Monthly
        const selectedD = new Date(selectedDate + "T00:00:00");
        return recordD.getFullYear() === selectedD.getFullYear() && recordD.getMonth() === selectedD.getMonth();
      }
    });
    calculateAnalytics(filtered);
  }, [selectedDate, filterMode, healthRecords]);

  const handleExportPDF = async () => {
    const element = reportRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = canvas.width * 0.132; 
    const imgHeight = canvas.height * 0.132;
    const pdf = new jsPDF({ orientation: imgWidth > imgHeight ? "l" : "p", unit: "mm", format: [imgWidth, imgHeight] });
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Health_Report_${filterMode}_${selectedDate}.pdf`);
  };

  const calculateAnalytics = (records) => {
    if (!records.length) {
      setStats({ totalResidents: 0, maleCount: 0, femaleCount: 0, pwdCount: 0 });
      setChartsData({ residentsPerStreet: null, ageGroupDistribution: null, healthConditions: null, nutritionStatus: null, pwdDistribution: null });
      return;
    }
    const uniqueResidents = new Set(records.map((r) => r.Resident_ID));
    const maleCount = records.filter((r) => r.Sex === "Male").length;
    const femaleCount = records.filter((r) => r.Sex === "Female").length;
    const pwdCount = records.filter((r) => (r.Is_PWD == 1 || r.Is_PWD === true)).length;

    const conditionCounts = {};
    const nutritionCounts = {};
    const streetCounts = {};
    const ageGroupCounts = { Infants: 0, Children: 0, Teens: 0, Adults: 0, Seniors: 0 };

    records.forEach((r) => {
      if (r.Health_Condition) conditionCounts[r.Health_Condition] = (conditionCounts[r.Health_Condition] || 0) + 1;
      if (r.Nutrition_Status) nutritionCounts[r.Nutrition_Status] = (nutritionCounts[r.Nutrition_Status] || 0) + 1;
      const street = r.Street || "Unknown";
      streetCounts[street] = (streetCounts[street] || 0) + 1;
      const age = r.Age || 0;
      if (age <= 2) ageGroupCounts["Infants"]++;
      else if (age <= 12) ageGroupCounts["Children"]++;
      else if (age <= 19) ageGroupCounts["Teens"]++;
      else if (age <= 59) ageGroupCounts["Adults"]++;
      else ageGroupCounts["Seniors"]++;
    });

    setStats({ totalResidents: uniqueResidents.size, maleCount, femaleCount, pwdCount });
    setChartsData({
      residentsPerStreet: { labels: Object.keys(streetCounts), datasets: [{ label: "Residents", data: Object.values(streetCounts), backgroundColor: "#4A90E2" }] },
      ageGroupDistribution: { labels: Object.keys(ageGroupCounts), datasets: [{ data: Object.values(ageGroupCounts), backgroundColor: ["#FFB3A7", "#86EFAC", "#67E8F9", "#FFD700", "#DDA0DD"] }] },
      healthConditions: { labels: Object.keys(conditionCounts), datasets: [{ data: Object.values(conditionCounts), backgroundColor: ["#FFB3A7", "#86EFAC", "#67E8F9", "#FFD700", "#DDA0DD"] }] },
      nutritionStatus: { labels: Object.keys(nutritionCounts), datasets: [{ data: Object.values(nutritionCounts), backgroundColor: ["#FFB3A7", "#86EFAC", "#67E8F9", "#FFD700"] }] },
      pwdDistribution: { labels: ["PWD", "Non-PWD"], datasets: [{ data: [pwdCount, records.length - pwdCount], backgroundColor: ["#4A90E2", "#F5A623"] }] },
    });
  };

  const commonOptions = {
    animation: false, responsive: true, maintainAspectRatio: true,
    plugins: { datalabels: { display: true, color: "#000", font: { weight: "bold" } }, legend: { position: "bottom" } },
  };

  if (loading) return <div className="p-5 text-center">Loading Analytics...</div>;

  const totalGender = stats.maleCount + stats.femaleCount;
  const mPct = totalGender > 0 ? Math.round((stats.maleCount / totalGender) * 100) : 0;
  const fPct = totalGender > 0 ? 100 - mPct : 0;

  return (
    <div className="dashboard-container d-flex">
      <div className="main-wrapper flex-grow-1 bg-light d-flex flex-column">
        <main className="flex-grow-1 main-content">
          <HeaderBanner onLogout={onLogout} />

          <div className="analytics-page-wrapper">
            <AnimatePresence>
              {showCalendar && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="calendar-modal-overlay" onClick={() => setShowCalendar(false)}>
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="calendar-header">
                      <h3 className="calendar-title">📅 Filter Data</h3>
                      <button className="calendar-close-btn" onClick={() => setShowCalendar(false)}><X size={20} /></button>
                    </div>
                    <div className="filter-mode-selector p-3">
                      <div className="btn-group w-100 mb-3">
                        <button className={`btn ${filterMode === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilterMode('weekly')}>Weekly</button>
                        <button className={`btn ${filterMode === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilterMode('monthly')}>Monthly</button>
                      </div>
                      <input type="date" className="calendar-date-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                      <p className="text-muted small mt-2">Selecting any date will filter for that entire week.</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="analytics-header d-flex justify-content-between align-items-center p-4">
              <div>
                <h2 className="analytics-title">ANALYTICS DASHBOARD</h2>
                <p className="analytics-subtitle">{filterMode.toUpperCase()}: {formatToLongDate(selectedDate)}</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn-filter-toggle" onClick={() => setShowCalendar(true)}><Filter size={18} className="me-2" /> Change Period</button>
                <button className="btn-export-pdf" onClick={handleExportPDF}><FileText size={18} className="me-2" /> Export PDF</button>
              </div>
            </div>

            <div ref={reportRef} className="report-container p-4 bg-white" style={{ width: "fit-content", minWidth: "1000px" }}>
              <div className="report-header-pdf text-center mb-4">
                <h2 className="report-title-pdf" style={{color: '#1e293b', fontWeight: '800'}}>HEALTH ANALYTICS REPORT</h2>
                <h5 className="report-subtitle-pdf text-muted">{filterMode.toUpperCase()} | {formatToLongDate(selectedDate)}</h5>
              </div>

              <div className="stats-section-pdf mb-4">
                <h3 className="section-heading mb-3">KEY STATISTICS</h3>
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div className="stat-card-modern border rounded p-3 text-center">
                    <h3 className="stat-number">{stats.totalResidents}</h3>
                    <p className="stat-label">Total Residents Checked</p>
                  </div>

                  <div className="stat-card-modern border rounded p-3 text-center">
                    <h3 className="stat-number">M: {mPct}% | F: {fPct}%</h3>
                    <p className="stat-label">Gender Split</p>
                    <div className="gender-bar mt-2" style={{height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden', display: 'flex'}}>
                      <div style={{width: `${mPct}%`, background: '#4A90E2'}}></div>
                      <div style={{width: `${fPct}%`, background: '#F5A623'}}></div>
                    </div>
                  </div>

                  <div className="stat-card-modern border rounded p-3 text-center">
                    <h3 className="stat-number">{stats.pwdCount}</h3>
                    <p className="stat-label">PWD Residents</p>
                  </div>
                </div>
              </div>

              <div className="charts-grid mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="chart-box border rounded p-3">
                  <h6 className="text-center mb-2">Residents per Street</h6>
                  {chartsData.residentsPerStreet && <Bar data={chartsData.residentsPerStreet} options={commonOptions} />}
                </div>
                <div className="chart-box border rounded p-3">
                  <h6 className="text-center mb-2">Age Distribution</h6>
                  {chartsData.ageGroupDistribution && <Bar data={chartsData.ageGroupDistribution} options={commonOptions} />}
                </div>
              </div>

              <div className="charts-grid-three" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div className="chart-box border rounded p-3">
                  <h6 className="text-center mb-2">PWD Distribution</h6>
                  {chartsData.pwdDistribution && <Doughnut data={chartsData.pwdDistribution} options={commonOptions} />}
                </div>
                <div className="chart-box border rounded p-3">
                  <h6 className="text-center mb-2">Health Conditions</h6>
                  {chartsData.healthConditions && <Pie data={chartsData.healthConditions} options={commonOptions} />}
                </div>
                <div className="chart-box border rounded p-3">
                  <h6 className="text-center mb-2">Nutrition Status</h6>
                  {chartsData.nutritionStatus && <Doughnut data={chartsData.nutritionStatus} options={commonOptions} />}
                </div>
              </div>

              <div className="text-center mt-5 text-muted small border-top pt-3">
                Generated by Health Information System &copy; 2026 | Weekly Summary Report
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
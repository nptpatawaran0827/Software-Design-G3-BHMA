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
import { Calendar, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderBanner from "./HeaderBanner";
import "./style/AnalyticsPage.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartDataLabels,
);

const AnalyticsPage = ({ onLogout }) => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);
  const [zoomedContent, setZoomedContent] = useState(null);

  // Filter States
  const [filterMode, setFilterMode] = useState("weekly"); 
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [stats, setStats] = useState({
    totalResidents: 0,
    maleCount: 0,
    femaleCount: 0,
    topCondition: "N/A",
    pwdCount: 0,
  });

  const [chartsData, setChartsData] = useState({
    residentsPerStreet: null,
    ageGroupDistribution: null,
    healthConditions: null,
    nutritionStatus: null,
    pwdDistribution: null,
  });

  /* ==================== DATE FILTER HELPERS ==================== */
  const getWeekRange = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const day = date.getDay();
    const diffToSun = date.getDate() - day;
    const startOfWeek = new Date(new Date(date).setDate(diffToSun));
    const endOfWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6));
    return { startOfWeek, endOfWeek };
  };

  const formatPeriodLabel = () => {
    const options = { month: "long", day: "numeric", year: "numeric" };
    if (filterMode === "weekly") {
      const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
      return `${startOfWeek.toLocaleDateString("en-US", options)} – ${endOfWeek.toLocaleDateString("en-US", options)}`;
    }
    return new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  /* ==================== DATA FETCHING & FILTERING ==================== */
  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health-records");
        const data = await response.json();
        if (Array.isArray(data)) setHealthRecords(data);
      } catch (error) {
        console.error("Error fetching health records:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHealthRecords();
  }, []);

  useEffect(() => {
    if (healthRecords.length === 0) return;

    const filtered = healthRecords.filter((record) => {
      const dateField = record.Date_Visited || record.Date || record.createdAt;
      if (!dateField) return true;
      const recordD = new Date(dateField);
      recordD.setHours(0, 0, 0, 0);

      if (filterMode === "weekly") {
        const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
        return recordD >= startOfWeek && recordD <= endOfWeek;
      } else {
        const selectedD = new Date(selectedDate + "T00:00:00");
        return recordD.getFullYear() === selectedD.getFullYear() && recordD.getMonth() === selectedD.getMonth();
      }
    });

    calculateAnalytics(filtered);
  }, [selectedDate, filterMode, healthRecords]);

  const calculateAnalytics = (records) => {
    if (!records || records.length === 0) {
      setStats({ totalResidents: 0, maleCount: 0, femaleCount: 0, topCondition: "N/A", pwdCount: 0 });
      setChartsData({ residentsPerStreet: null, ageGroupDistribution: null, healthConditions: null, nutritionStatus: null, pwdDistribution: null });
      return;
    }

    const uniqueResidents = new Set(records.map((r) => r.Resident_ID));
    const maleCount = records.filter((r) => r.Sex === "Male").length;
    const femaleCount = records.filter((r) => r.Sex === "Female").length;
    const pwdCount = records.filter((r) => r.Is_PWD == 1 || r.Is_PWD === true).length;

    const conditionCounts = {};
    records.forEach((record) => {
      if (record.Health_Condition) {
        conditionCounts[record.Health_Condition] = (conditionCounts[record.Health_Condition] || 0) + 1;
      }
    });
    const topCondition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    setStats({ totalResidents: uniqueResidents.size, maleCount, femaleCount, topCondition, pwdCount });
    buildChartsData(records, conditionCounts, pwdCount);
  };

  const buildChartsData = (records, conditionCounts, pwdCount) => {
    const streetCounts = {};
    records.forEach(r => {
      if (r.Street_Name) {
        const street = r.Street_Name.trim();
        streetCounts[street] = (streetCounts[street] || 0) + 1;
      }
    });
    const sortedStreets = Object.entries(streetCounts).sort((a, b) => b[1] - a[1]);

    const ageGroupCounts = { Infants: 0, Children: 0, Teens: 0, Adults: 0, Seniors: 0 };
    records.forEach((r) => {
      let age = r.Age || (r.Birthdate ? new Date().getFullYear() - new Date(r.Birthdate).getFullYear() : 0);
      if (age <= 1) ageGroupCounts["Infants"]++;
      else if (age <= 12) ageGroupCounts["Children"]++;
      else if (age <= 19) ageGroupCounts["Teens"]++;
      else if (age <= 59) ageGroupCounts["Adults"]++;
      else ageGroupCounts["Seniors"]++;
    });

    const nutritionCounts = {};
    records.forEach((r) => {
      if (r.Nutrition_Status) nutritionCounts[r.Nutrition_Status] = (nutritionCounts[r.Nutrition_Status] || 0) + 1;
    });

    setChartsData({
      residentsPerStreet: {
        labels: sortedStreets.map(([s]) => s),
        datasets: [{ label: "Residents", data: sortedStreets.map(([, c]) => c), backgroundColor: "#4A90E2", borderRadius: 8 }],
      },
      ageGroupDistribution: {
        labels: Object.keys(ageGroupCounts),
        datasets: [{ data: Object.values(ageGroupCounts), backgroundColor: ["#FFB3A7", "#86EFAC", "#67E8F9", "#FFD700", "#DDA0DD"], borderRadius: 8 }],
      },
      healthConditions: {
        labels: Object.keys(conditionCounts),
        datasets: [{ data: Object.values(conditionCounts), backgroundColor: ["#FFB3A7", "#86EFAC", "#67E8F9", "#FFD700", "#DDA0DD"] }],
      },
      nutritionStatus: {
        labels: Object.keys(nutritionCounts),
        datasets: [{ data: Object.values(nutritionCounts), backgroundColor: ["#FFB3A7", "#86EFAC", "#67E8F9", "#FFD700"] }],
      },
      pwdDistribution: {
        labels: ["PWD", "Non-PWD"],
        datasets: [{ data: [pwdCount, records.length - pwdCount], backgroundColor: ["#4A90E2", "#F5A623"] }],
      },
    });
  };

  const handleExportPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Health_Report_${selectedDate}.pdf`);
  };

  /* ==================== CHART OPTIONS ==================== */
  const commonOptions = {
    animation: false,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      datalabels: {
        display: true,
        color: "#000000",
        font: { weight: "bold", size: 14 },
        formatter: (value) => (value > 0 ? value : ""),
      },
    },
  };

  const barOptions = { ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false }, datalabels: { ...commonOptions.plugins.datalabels, anchor: "end", align: "top", offset: 4 } }, scales: { y: { beginAtZero: true, grace: "15%", ticks: { stepSize: 1 } } } };
  const pieOptions = { ...commonOptions, plugins: { ...commonOptions.plugins, legend: { position: "bottom" }, datalabels: { ...commonOptions.plugins.datalabels, anchor: "center", align: "center", textStrokeColor: "#ffffff", textStrokeWidth: 2 } } };

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

  const totalGender = stats.maleCount + stats.femaleCount;
  const mPct = totalGender > 0 ? Math.round((stats.maleCount / totalGender) * 100) : 0;
  const fPct = totalGender > 0 ? 100 - mPct : 0;

  return (
    <div className="dashboard-container d-flex">
      <div className="main-wrapper flex-grow-1 bg-light d-flex flex-column">
        <main className="flex-grow-1 main-content">
          <HeaderBanner onLogout={onLogout} />

          <div className="analytics-page-wrapper">
            
            {/* TOP TOOLBAR: Right-aligned filters and button */}
            <div className="filter-toolbar-top d-flex align-items-center justify-content-end p-3 bg-white shadow-sm mb-4 rounded-3 mx-4 mt-3 gap-3">
              <div className="d-flex align-items-center gap-2 border-end pe-3">
                <div className="btn-group shadow-sm">
                  <button className={`btn btn-sm ${filterMode === 'weekly' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilterMode('weekly')}>Weekly</button>
                  <button className={`btn btn-sm ${filterMode === 'monthly' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilterMode('monthly')}>Monthly</button>
                </div>
                <div className="d-flex align-items-center bg-light px-2 py-1 rounded border ms-1">
                  <Calendar size={16} className="text-muted me-2" />
                  <input type="date" className="border-0 bg-transparent" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ fontSize: '0.9rem', outline: 'none' }} />
                </div>
              </div>
              <button className="btn-export-pdf" onClick={handleExportPDF}>
                <i className="bi bi-file-earmark-pdf me-2"></i>Export PDF
              </button>
            </div>

            {/* REPORT START */}
            <div ref={reportRef} className="report-container px-4">
              <div className="report-header-pdf mb-4">
                <h2 className="report-title-pdf">BARANGAY HEALTH ANALYTICS REPORT</h2>
                <h5 className="report-subtitle-pdf text-muted">{filterMode.toUpperCase()} | {formatPeriodLabel()}</h5>
              </div>

              {/* STATS SECTION: 3 Items in one horizontal line */}
              <div className="stats-section-pdf mb-4">
                <h3 className="section-heading mb-3 pb-2 border-bottom">KEY STATISTICS</h3>
                <div className="row g-3"> 
                  {/* Total Residents */}
                  <div className="col-4">
                    <div className="stat-card-modern shadow-none border h-100 p-3">
                      <i className="bi bi-people stat-icon text-success mb-2"></i>
                      <div className="stat-content">
                        <h3 className="stat-number mb-0">{stats.totalResidents}</h3>
                        <p className="stat-label text-muted small mb-0">Total Residents</p>
                      </div>
                    </div>
                  </div>

                  {/* Gender Split */}
                  <div className="col-4">
                    <div className="stat-card-modern shadow-none border h-100 p-3">
                      <div className="stat-content w-100">
                        <h3 className="stat-number mb-0">M: {mPct}% | F: {fPct}%</h3>
                        <p className="stat-label text-muted small mb-2">Gender Split</p>
                        <div className="gender-bar" style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                          <div className="bg-primary" style={{ width: `${mPct}%` }}></div>
                          <div className="bg-danger" style={{ width: `${fPct}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PWD Count */}
                  <div className="col-4">
                    <div className="stat-card-modern shadow-none border h-100 p-3">
                      <i className="bi bi-person-wheelchair stat-icon text-success mb-2"></i>
                      <div className="stat-content">
                        <h3 className="stat-number mb-0">{stats.pwdCount}</h3>
                        <p className="stat-label text-muted small mb-0">PWD Residents</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CHARTS SECTION */}
              <div className="charts-section mt-4">
                <h3 className="section-heading">COMMUNITY DEMOGRAPHICS</h3>
                <div className="charts-grid">
                    <div className="chart-card-modern border shadow-none">
                        <div className="chart-header"><h6 className="chart-title">Residents per Street</h6></div>
                        <div className="chart-body">{chartsData.residentsPerStreet && <Bar data={chartsData.residentsPerStreet} options={barOptions} />}</div>
                    </div>
                    <div className="chart-card-modern border shadow-none">
                        <div className="chart-header"><h6 className="chart-title">Age Group Distribution</h6></div>
                        <div className="chart-body">{chartsData.ageGroupDistribution && <Bar data={chartsData.ageGroupDistribution} options={barOptions} />}</div>
                    </div>
                </div>
              </div>

              <div className="charts-section mt-4">
                <h3 className="section-heading">HEALTH & DISABILITY OVERVIEW</h3>
                <div className="charts-grid-three">
                    <div className="chart-card-modern border shadow-none">
                        <div className="chart-header"><h6 className="chart-title">PWD Distribution</h6></div>
                        <div className="chart-body">{chartsData.pwdDistribution && <Doughnut data={chartsData.pwdDistribution} options={pieOptions} />}</div>
                    </div>
                    <div className="chart-card-modern border shadow-none">
                        <div className="chart-header"><h6 className="chart-title">Health Conditions</h6></div>
                        <div className="chart-body">{chartsData.healthConditions && <Pie data={chartsData.healthConditions} options={pieOptions} />}</div>
                    </div>
                    <div className="chart-card-modern border shadow-none">
                        <div className="chart-header"><h6 className="chart-title">Nutrition Status</h6></div>
                        <div className="chart-body">{chartsData.nutritionStatus && <Doughnut data={chartsData.nutritionStatus} options={pieOptions} />}</div>
                    </div>
                </div>
              </div>

              <div className="report-footer-pdf mt-5 text-center">
                <p className="text-muted small">Generated by Health Information System Dashboard &copy; 2026</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ZOOM MODAL */}
      {zoomedContent && (
        <div className="zoom-overlay" onClick={() => setZoomedContent(null)}>
          <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
            <button className="zoom-close" onClick={() => setZoomedContent(null)}><i className="bi bi-x-lg"></i></button>
            {zoomedContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
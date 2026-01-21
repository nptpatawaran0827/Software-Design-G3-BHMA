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
import { Calendar, X } from "lucide-react";
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

  // Calendar Modal States
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [stats, setStats] = useState({
    totalResidents: 0,
    maleCount: 0,
    femaleCount: 0,
    activeCases: 0,
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

  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/health-records",
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setHealthRecords(data);
          calculateAnalytics(data);
        }
      } catch (error) {
        console.error("Error fetching health records:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHealthRecords();
  }, []);

  /* ==================== CALENDAR MODAL HANDLERS ==================== */
  const handleOpenCalendar = () => {
    setShowCalendar(true);
  };

  const handleCloseCalendar = () => {
    setShowCalendar(false);
  };

  const handleDateChange = (dateString) => {
    setSelectedDate(dateString);
  };

  const handleExportPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(
      `Health_Analytics_Report_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  const calculateAnalytics = (records) => {
    if (!records || records.length === 0) return;
    const uniqueResidents = new Set(records.map((r) => r.Resident_ID));
    const maleCount = records.filter((r) => r.Sex === "Male").length;
    const femaleCount = records.filter((r) => r.Sex === "Female").length;
    const pwdCount = records.filter(
      (r) => r.Is_PWD == 1 || r.Is_PWD === true,
    ).length;

    const conditionCounts = {};
    records.forEach((record) => {
      if (record.Health_Condition) {
        conditionCounts[record.Health_Condition] =
          (conditionCounts[record.Health_Condition] || 0) + 1;
      }
    });
    const topCondition =
      Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "N/A";

    setStats({
      totalResidents: uniqueResidents.size,
      maleCount,
      femaleCount,
      topCondition,
      pwdCount,
    });
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
    const sortedStreets = Object.entries(streetCounts).sort(
      (a, b) => b[1] - a[1],
    );

    const ageGroupCounts = {
      Infants: 0,
      Children: 0,
      Teens: 0,
      Adults: 0,
      Seniors: 0,
    };
    records.forEach((r) => {
      let age =
        r.Age ||
        (r.Birthdate
          ? new Date().getFullYear() - new Date(r.Birthdate).getFullYear()
          : 0);
      if (age <= 1) ageGroupCounts["Infants"]++;
      else if (age <= 12) ageGroupCounts["Children"]++;
      else if (age <= 19) ageGroupCounts["Teens"]++;
      else if (age <= 59) ageGroupCounts["Adults"]++;
      else ageGroupCounts["Seniors"]++;
    });

    const nutritionCounts = {};
    records.forEach((r) => {
      if (r.Nutrition_Status)
        nutritionCounts[r.Nutrition_Status] =
          (nutritionCounts[r.Nutrition_Status] || 0) + 1;
    });

    setChartsData({
      residentsPerStreet: {
        labels: sortedStreets.map(([s]) => s),
        datasets: [
          {
            label: "Residents",
            data: sortedStreets.map(([, c]) => c),
            backgroundColor: "#4A90E2",
            borderRadius: 8,
          },
        ],
      },
      ageGroupDistribution: {
        labels: Object.keys(ageGroupCounts),
        datasets: [
          {
            data: Object.values(ageGroupCounts),
            backgroundColor: [
              "#FFB3A7",
              "#86EFAC",
              "#67E8F9",
              "#FFD700",
              "#DDA0DD",
            ],
            borderRadius: 8,
          },
        ],
      },
      healthConditions: {
        labels: Object.keys(conditionCounts),
        datasets: [
          {
            data: Object.values(conditionCounts),
            backgroundColor: [
              "#FFB3A7",
              "#86EFAC",
              "#67E8F9",
              "#FFD700",
              "#DDA0DD",
            ],
          },
        ],
      },
      nutritionStatus: {
        labels: Object.keys(nutritionCounts),
        datasets: [
          {
            data: Object.values(nutritionCounts),
            backgroundColor: ["#FFB3A7", "#86EFAC", "#67E8F9", "#FFD700"],
          },
        ],
      },
      pwdDistribution: {
        labels: ["PWD", "Non-PWD"],
        datasets: [
          {
            data: [pwdCount, records.length - pwdCount],
            backgroundColor: ["#4A90E2", "#F5A623"],
          },
        ],
      },
    });
  };

  const handleAcceptResident = (residentData) => {
    console.log("Resident accepted:", residentData);
  };

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

  const barOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: { display: false },
      datalabels: {
        ...commonOptions.plugins.datalabels,
        anchor: "end",
        align: "top",
        offset: 4,
      },
    },
    scales: { y: { beginAtZero: true, grace: "15%", ticks: { stepSize: 1 } } },
  };

  const pieOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: { position: "bottom" },
      datalabels: {
        ...commonOptions.plugins.datalabels,
        anchor: "center",
        align: "center",
        textStrokeColor: "#ffffff",
        textStrokeWidth: 2,
      },
    },
  };

  const zoomedBarOptions = {
    ...barOptions,
    plugins: {
      ...barOptions.plugins,
      datalabels: {
        ...barOptions.plugins.datalabels,
        font: { weight: "bold", size: 18 },
      },
    },
  };

  const zoomedPieOptions = {
    ...pieOptions,
    plugins: {
      ...pieOptions.plugins,
      legend: {
        position: "bottom",
        labels: {
          font: { size: 18, weight: "bold" },
          padding: 25,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        titleFont: { size: 16 },
        bodyFont: { size: 16 },
        padding: 14,
      },
      datalabels: {
        ...pieOptions.plugins.datalabels,
        font: { weight: "bold", size: 18 },
      },
    },
  };

  if (loading)
    return (
      <div className="dashboard-container d-flex">
        <div className="main-wrapper flex-grow-1 bg-light d-flex flex-column">
          <main className="flex-grow-1 main-content">
            <HeaderBanner
              onAcceptResident={handleAcceptResident}
              onLogout={onLogout}
            />
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading analytics...</p>
            </div>
          </main>
        </div>
      </div>
    );

  const totalGender = stats.maleCount + stats.femaleCount;
  const mPct =
    totalGender > 0 ? Math.round((stats.maleCount / totalGender) * 100) : 0;
  const fPct = totalGender > 0 ? 100 - mPct : 0;

  return (
    <div className="dashboard-container d-flex">
      <div className="main-wrapper flex-grow-1 bg-light d-flex flex-column">
        <main className="flex-grow-1 main-content">
          <HeaderBanner
            onAcceptResident={handleAcceptResident}
            onLogout={onLogout}
          />

          <div className="analytics-page-wrapper">
            {/* Calendar Modal */}
            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="calendar-modal-overlay"
                  onClick={handleCloseCalendar}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="calendar-modal-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="calendar-header">
                      <h3 className="calendar-title">📅 Search by Date</h3>
                      <button
                        className="calendar-close-btn"
                        onClick={handleCloseCalendar}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="calendar-input-wrapper">
                      <label className="calendar-input-label">
                        Select Date
                      </label>
                      <input
                        type="date"
                        className="calendar-date-input"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header Section */}
            <div className="analytics-header">
              <div>
                <h2 className="analytics-title">ANALYTICS DASHBOARD</h2>
                <p className="analytics-subtitle">
                  Comprehensive Health Data Insights & Reporting
                </p>
              </div>
              <button className="btn-export-pdf" onClick={handleExportPDF}>
                <i className="bi bi-file-earmark-pdf me-2"></i>Export PDF Report
              </button>
            </div>

            {/* Printable Report Section */}
            <div ref={reportRef} className="report-container">
              <div className="report-header-pdf">
                <h2 className="report-title-pdf">HEALTH ANALYTICS REPORT</h2>
                <h5 className="report-subtitle-pdf">
                  Community Health Information System
                </h5>
              </div>

              {/* Stats Overview Inside PDF */}
              <div className="stats-section-pdf">
                <h3 className="section-heading">KEY STATISTICS</h3>
                <div className="stats-grid">
                  <div className="stat-card-modern">
                    <i className="bi bi-people stat-icon text-success"></i>
                    <div className="stat-content">
                      <h3 className="stat-number">{stats.totalResidents}</h3>
                      <p className="stat-label">Total Residents</p>
                    </div>
                  </div>

                  <div className="stat-card-modern">
                    <div className="stat-content">
                      <h3 className="stat-number">
                        M: {mPct}% | F: {fPct}%
                      </h3>
                      <p className="stat-label">Gender Split</p>
                      <div className="gender-bar">
                        <div
                          className="gender-bar-male"
                          style={{ width: `${mPct}%` }}
                        ></div>
                        <div
                          className="gender-bar-female"
                          style={{ width: `${fPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card-modern">
                    <i className="bi bi-person-wheelchair stat-icon text-success"></i>
                    <div className="stat-content">
                      <h3 className="stat-number">{stats.pwdCount}</h3>
                      <p className="stat-label">PWD Residents</p>
                    </div>
                  </div>

                  {/* Date Card - Clickable */}
                  <div
                    className="stat-card-modern stat-card-clickable"
                    onClick={handleOpenCalendar}
                  >
                    <div className="stat-icon-calendar">
                      <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-number">
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </h3>
                      <p className="stat-label">Today's Date</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-section">
                <h3 className="section-heading">COMMUNITY DEMOGRAPHICS</h3>
                <div className="charts-grid">
                  <div
                    className="chart-card-modern zoom-card"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setZoomedContent(
                        <div
                          className="d-flex flex-column align-items-center justify-content-center"
                          style={{ padding: "2rem", minHeight: "500px" }}
                        >
                          <div
                            className="text-white text-center fw-bold mb-4 rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#14b8a6",
                              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                              letterSpacing: "2px",
                              width: "100%",
                              height: "80px",
                              padding: "1rem",
                            }}
                          >
                            RESIDENTS PER STREET
                          </div>
                          <div
                            className="d-flex align-items-center justify-content-center flex-grow-1"
                            style={{
                              width: "100%",
                              maxWidth: "600px",
                              padding: "1rem",
                            }}
                          >
                            {chartsData.residentsPerStreet && (
                              <Bar
                                data={chartsData.residentsPerStreet}
                                options={zoomedBarOptions}
                              />
                            )}
                          </div>
                        </div>,
                      )
                    }
                  >
                    <div className="chart-header">
                      <h6 className="chart-title">Residents per Street</h6>
                    </div>
                    <div className="chart-body">
                      {chartsData.residentsPerStreet && (
                        <Bar
                          data={chartsData.residentsPerStreet}
                          options={barOptions}
                        />
                      )}
                    </div>
                  </div>

                  <div
                    className="chart-card-modern zoom-card"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setZoomedContent(
                        <div
                          className="d-flex flex-column align-items-center justify-content-center"
                          style={{ padding: "2rem", minHeight: "500px" }}
                        >
                          <div
                            className="text-white text-center fw-bold mb-4 rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#14b8a6",
                              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                              letterSpacing: "2px",
                              width: "100%",
                              height: "80px",
                              padding: "1rem",
                            }}
                          >
                            AGE GROUP DISTRIBUTION
                          </div>
                          <div
                            className="d-flex align-items-center justify-content-center flex-grow-1"
                            style={{
                              width: "100%",
                              maxWidth: "600px",
                              padding: "1rem",
                            }}
                          >
                            {chartsData.ageGroupDistribution && (
                              <Bar
                                data={chartsData.ageGroupDistribution}
                                options={zoomedBarOptions}
                              />
                            )}
                          </div>
                        </div>,
                      )
                    }
                  >
                    <div className="chart-header">
                      <h6 className="chart-title">Age Group Distribution</h6>
                    </div>
                    <div className="chart-body">
                      {chartsData.ageGroupDistribution && (
                        <Bar
                          data={chartsData.ageGroupDistribution}
                          options={barOptions}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="charts-section">
                <h3 className="section-heading">
                  HEALTH & DISABILITY OVERVIEW
                </h3>
                <div className="charts-grid-three">
                  <div
                    className="chart-card-modern zoom-card"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setZoomedContent(
                        <div
                          className="d-flex flex-column align-items-center justify-content-center"
                          style={{ padding: "2rem", minHeight: "500px" }}
                        >
                          <div
                            className="text-white text-center fw-bold mb-4 rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#14b8a6",
                              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                              letterSpacing: "2px",
                              width: "100%",
                              height: "80px",
                              padding: "1rem",
                            }}
                          >
                            PWD DISTRIBUTION
                          </div>
                          <div
                            className="d-flex align-items-center justify-content-center flex-grow-1"
                            style={{
                              width: "100%",
                              maxWidth: "500px",
                              padding: "1rem",
                            }}
                          >
                            {chartsData.pwdDistribution && (
                              <Doughnut
                                data={chartsData.pwdDistribution}
                                options={zoomedPieOptions}
                              />
                            )}
                          </div>
                        </div>,
                      )
                    }
                  >
                    <div className="chart-header">
                      <h6 className="chart-title">PWD Distribution</h6>
                    </div>
                    <div className="chart-body">
                      {chartsData.pwdDistribution && (
                        <Doughnut
                          data={chartsData.pwdDistribution}
                          options={pieOptions}
                        />
                      )}
                    </div>
                  </div>

                  <div
                    className="chart-card-modern zoom-card"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setZoomedContent(
                        <div
                          className="d-flex flex-column align-items-center justify-content-center"
                          style={{ padding: "2rem", minHeight: "500px" }}
                        >
                          <div
                            className="text-white text-center fw-bold mb-4 rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#14b8a6",
                              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                              letterSpacing: "2px",
                              width: "100%",
                              height: "80px",
                              padding: "1rem",
                            }}
                          >
                            HEALTH CONDITIONS
                          </div>
                          <div
                            className="d-flex align-items-center justify-content-center flex-grow-1"
                            style={{
                              width: "100%",
                              maxWidth: "500px",
                              padding: "1rem",
                            }}
                          >
                            {chartsData.healthConditions && (
                              <Pie
                                data={chartsData.healthConditions}
                                options={zoomedPieOptions}
                              />
                            )}
                          </div>
                        </div>,
                      )
                    }
                  >
                    <div className="chart-header">
                      <h6 className="chart-title">Health Conditions</h6>
                    </div>
                    <div className="chart-body">
                      {chartsData.healthConditions && (
                        <Pie
                          data={chartsData.healthConditions}
                          options={pieOptions}
                        />
                      )}
                    </div>
                  </div>

                  <div
                    className="chart-card-modern zoom-card"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setZoomedContent(
                        <div
                          className="d-flex flex-column align-items-center justify-content-center"
                          style={{ padding: "2rem", minHeight: "500px" }}
                        >
                          <div
                            className="text-white text-center fw-bold mb-4 rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#14b8a6",
                              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                              letterSpacing: "2px",
                              width: "100%",
                              height: "80px",
                              padding: "1rem",
                            }}
                          >
                            NUTRITION STATUS
                          </div>
                          <div
                            className="d-flex align-items-center justify-content-center flex-grow-1"
                            style={{
                              width: "100%",
                              maxWidth: "500px",
                              padding: "1rem",
                            }}
                          >
                            {chartsData.nutritionStatus && (
                              <Doughnut
                                data={chartsData.nutritionStatus}
                                options={zoomedPieOptions}
                              />
                            )}
                          </div>
                        </div>,
                      )
                    }
                  >
                    <div className="chart-header">
                      <h6 className="chart-title">Nutrition Status</h6>
                    </div>
                    <div className="chart-body">
                      {chartsData.nutritionStatus && (
                        <Doughnut
                          data={chartsData.nutritionStatus}
                          options={pieOptions}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="report-footer-pdf">
                <p>
                  Generated by Health Information System Dashboard &copy; 2026
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ZOOM MODAL for charts */}
      {zoomedContent && (
        <div className="zoom-overlay" onClick={() => setZoomedContent(null)}>
          <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="zoom-close"
              onClick={() => setZoomedContent(null)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
            {zoomedContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;

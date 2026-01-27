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
import RecordsPage from "./RecordsPage";
import HeaderBanner from "./HeaderBanner";
import HeatmapPage from "./HeatmapPage";
import "./style/Home.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);


function Home({ onLogout }) {
  // ===== RETRIEVE ADMIN INFO FROM LOCALSTORAGE =====
  const adminUsername = localStorage.getItem("username") || "Administrator";
  const adminId = localStorage.getItem("adminId") || "N/A";

  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState("Home");

  const [filter, setFilter] = useState("All Activities");
  const [activities, setActivities] = useState([]);
  const [shouldAutoOpenForm, setShouldAutoOpenForm] = useState(false);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preFillData, setPreFillData] = useState(null);
  const [zoomedContent, setZoomedContent] = useState(null);

  const [dbStats, setDbStats] = useState({
    totalPatients: 0,
    newPatients: 0,
    patientsWithDisability: 0,
    totalReports: 0,
    maleCount: 0,
    femaleCount: 0,
  });

  const [diagnosisChartData, setDiagnosisChartData] = useState(null);
  const [genderChartData, setGenderChartData] = useState(null);

  // ===== PERSIST ACTIVE TAB TO LOCALSTORAGE =====
  useEffect(() => {
    localStorage.setItem("activeDashboardTab", activeTab);
  }, [activeTab]);

  // ===== DATA FETCHING: ACTIVITIES =====
  const fetchActivities = async () => {
    try {
      const response = await fetch("https://software-design-g3-bhma-2026.onrender.com/api/activity-logs");
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  // ===== DATA FETCHING: HEALTH RECORDS =====
  const fetchHealthRecords = async () => {
    try {
      const response = await fetch("https://software-design-g3-bhma-2026.onrender.com/api/health-records");
      const data = await response.json();
      if (Array.isArray(data)) {
        setHealthRecords(data);
        calculateStatistics(data);
      }
    } catch (error) {
      console.error("Error fetching health records:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===== AUTO-REFRESH DATA EVERY 5 SECONDS =====
  useEffect(() => {
    fetchHealthRecords();
    fetchActivities();

    const interval = setInterval(() => {
      fetchHealthRecords();
      fetchActivities();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ===== CALCULATE STATISTICS FROM HEALTH RECORDS =====
  const calculateStatistics = (records) => {
    if (!records || records.length === 0) {
      setDbStats({
        totalPatients: 0,
        newPatients: 0,
        patientsWithDisability: 0,
        totalReports: 0,
        maleCount: 0,
        femaleCount: 0,
      });
      return;
    }

    // Count unique patients
    const uniquePatients = new Set(records.map((r) => r.Resident_ID)).size;

    // Count by gender
    const maleCount = records.filter(
      (r) => r.Sex?.toLowerCase() === "male"
    ).length;
    const femaleCount = records.filter(
      (r) => r.Sex?.toLowerCase() === "female"
    ).length;

    // Count PWD patients
    const pwdCount = records.filter(
      (r) => r.Is_PWD == 1 || r.Is_PWD === true
    ).length;

    // Calculate diagnosis counts
    const diagCounts = {};
    records.forEach((r) => {
      if (r.Diagnosis) {
        const d = r.Diagnosis.toLowerCase().trim();
        diagCounts[d] = (diagCounts[d] || 0) + 1;
      }
    });

    // Get top 5 diagnoses
    const sortedDiag = Object.entries(diagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Set diagnosis chart data
    setDiagnosisChartData({
      labels: sortedDiag.map(([d]) => d.charAt(0).toUpperCase() + d.slice(1)),
      datasets: [
        {
          data: sortedDiag.map(([, c]) => c),
          backgroundColor: [
            "#FFB3A7",
            "#86EFAC",
            "#67E8F9",
            "#FFD700",
            "#DDA0DD",
          ],
          borderWidth: 1,
        },
      ],
    });

    // Set gender chart data
    setGenderChartData({
      labels: ["Male", "Female"],
      datasets: [
        {
          data: [maleCount, femaleCount],
          backgroundColor: ["#4A90E2", "#F5A623"],
          borderWidth: 1,
        },
      ],
    });

    // Update stats
    setDbStats({
      totalPatients: uniquePatients,
      newPatients: records.length,
      patientsWithDisability: pwdCount,
      totalReports: records.length,
      maleCount,
      femaleCount,
    });
  };

 // This function is passed to HeaderBanner
  const handleAcceptResident = (residentData) => {
    const now = new Date();
    const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];

    const updatedResidentData = {
      ...residentData,
      Date_Visited: localToday
    };

    setPreFillData(updatedResidentData);
    setActiveTab("Records"); // This switches the view
    setShouldAutoOpenForm(true); // This tells RecordsPage to open the modal/form
    
    fetchHealthRecords();
    fetchActivities();
  };

  // ===== RENDER CONTENT BASED ON ACTIVE TAB =====
  const renderContent = () => {
    // ===== RECORDS TAB =====
    if (activeTab === "Records") {
      return (
        <RecordsPage
          autoOpenForm={shouldAutoOpenForm}
          preFillData={preFillData}
          onSubmitSuccess={() => {
            setShouldAutoOpenForm(false);
            setPreFillData(null);
            fetchHealthRecords();
            fetchActivities();
          }}
        />
      );
    }

    // ===== HEATMAP TAB =====
    if (activeTab === "Heatmap") {
      return <HeatmapPage />;
    }

    // ===== HOME TAB (DEFAULT DASHBOARD) =====
    return (
      <>
        {/* WELCOME SECTION */}
        <div className="top-actions-bar">
          <h2 className="fw-bold mb-0 text-uppercase">
           WELCOME BACK, <span className="text-primary">{adminUsername}</span>
          </h2>
        </div>

        {/* RECENT ACTIVITY CARD */}
        <div className="card border-0 shadow-sm rounded-4 mb-3 activity-card">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
            <h5 className="mb-0 fw-bold text-dark">Recent Activity</h5>
            <select
              className="form-select form-select-sm w-auto border-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ borderColor: "#e5e7eb" }}
            >
              <option value="All Activities">All Activities</option>
              <option value="New Patients">New Patients</option>
              <option value="Updated Records">Updated Records</option>
            </select>
          </div>
          <div className="card-body p-0 activity-list">
  <ul className="list-group list-group-flush">
    {(() => {
      const seen = new Set();
      const filtered = activities
        .filter((item) => {
          const action = (item.action_type || "").toLowerCase();
          const isReport = action === "generated_report" || 
                           (item.record_name && (item.record_name.toUpperCase().includes("WEEKLY") || item.record_name.toUpperCase().includes("MONTHLY")));
          if (isReport) return false;

          if (filter === "All Activities") return true;
          if (filter === "New Patients") return action === "added";
          if (filter === "Updated Records") return action === "modified" || action === "updated";
          return true;
        })
        .filter((item) => {
          if (!item.created_at) return true;
          // FIX: Check for both Casing types in the fingerprint
          const resId = item.Resident_ID || item.resident_id || "unknown";
          const dateMinute = new Date(item.created_at).toISOString().slice(0, 16);
          const fingerprint = `${resId}-${item.action_type}-${dateMinute}`;
          if (seen.has(fingerprint)) return false;
          seen.add(fingerprint);
          return true;
        });

      if (filtered.length === 0) {
        return <li className="list-group-item py-4 text-center text-muted border-0">No recent updates found.</li>;
      }

      return filtered.map((log) => {
        // Find the ID regardless of casing
        const idKey = Object.keys(log).find(k => k.toLowerCase() === 'resident_id');
        const actualID = idKey ? log[idKey] : "N/A";


        const action = (log.action_type || "").toLowerCase();
let actionText = "updated";
let actionClass = "text-warning";
let bulletClass = "text-warning";

if (action === "added") {
  actionText = "added";
  actionClass = "text-success";
  bulletClass = "text-success";
} 
// CHANGE THIS LINE: from "deleted" to "removed"
else if (action === "deleted" || action === "removed") { 
  actionText = "deleted";
  actionClass = "text-danger";
  bulletClass = "text-danger";
}

        const dateObj = new Date(log.created_at);
        const time = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const dateFormatted = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

        return (
          <li key={log.log_id || Math.random()} className="list-group-item d-flex align-items-center py-3 border-0 px-4">
            <i className={`bi bi-circle-fill ${bulletClass} me-3 activity-icon`} style={{ fontSize: '10px' }}></i>
            <div className="small">
              <strong>{adminUsername}</strong>{" "}
              <span className={`fw-bold ${actionClass}`}>{actionText}</span> a Health Record for Resident ID:{" "}
              <span className="fw-bold text-primary">{actualID}</span> at{" "}
              <span className="activity-time">{time}</span> on{" "}
              <span className="activity-date">{dateFormatted}</span>
            </div>
          </li>
        );
      });
    })()}
  </ul>
</div>
        </div>

        {/* DASHBOARD OVERVIEW TITLE */}
        <h2 className="text-success fw-bold mb-3 dashboard-overview-title">
          Dashboard Overview
        </h2>

        {/* DASHBOARD OVERVIEW CONTENT */}
        <div className="bg-white p-4 rounded-4 shadow-sm border dashboard-overview-content">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="row g-4 h-100">
                <div className="col-6">
                  <div
                    className="border rounded-4 p-4 text-center shadow-sm bg-white d-flex flex-column justify-content-center"
                    style={{ minHeight: "180px" }}
                  >
                    <i className="bi bi-people text-success fs-1 mb-3"></i>
                    <h2 className="fw-bold mb-1">{dbStats.totalPatients}</h2>
                    <small className="text-muted fw-semibold">
                      Total Residents
                    </small>
                  </div>
                </div>

                <div className="col-6">
                  <div
                    className="border rounded-4 p-4 text-center shadow-sm bg-white d-flex flex-column justify-content-center"
                    style={{ minHeight: "180px" }}
                  >
                    <i className="bi bi-journal-medical text-success fs-1 mb-3"></i>
                    <h2 className="fw-bold mb-1">{dbStats.newPatients}</h2>
                    <small className="text-muted fw-semibold">
                      Health Records
                    </small>
                  </div>
                </div>

                <div className="col-6">
                  <div
                    className="border rounded-4 p-4 text-center shadow-sm bg-white d-flex flex-column justify-content-center"
                    style={{ minHeight: "180px" }}
                  >
                    <i className="bi bi-person-wheelchair text-success fs-1 mb-3"></i>
                    <h2 className="fw-bold mb-1">
                      {dbStats.patientsWithDisability}
                    </h2>
                    <small className="text-muted d-block fw-bold pwd-stat-label">
                      PWD PATIENTS
                    </small>
                  </div>
                </div>

                <div className="col-6">
                  <div
                    className="border rounded-4 p-4 text-center shadow-sm bg-white d-flex flex-column justify-content-center"
                    style={{ minHeight: "180px" }}
                  >
                    <i className="bi bi-file-earmark-bar-graph text-success fs-1 mb-3"></i>
                    <h2 className="fw-bold mb-1">{dbStats.totalReports}</h2>
                    <small className="text-muted fw-semibold">
                      Total Reports
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div
                className="border rounded-4 overflow-hidden shadow-sm bg-white d-flex flex-column h-100 zoom-card"
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
                        GENDER DISTRIBUTION
                      </div>
                      <div
                        className="d-flex align-items-center justify-content-center flex-grow-1"
                        style={{
                          width: "100%",
                          maxWidth: "500px",
                          padding: "1rem",
                        }}
                      >
                        {genderChartData && (
                          <Doughnut
                            data={genderChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: true,
                              plugins: {
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
                              },
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )
                }
              >
                <div className="text-white text-center py-2 fw-bold small gender-chart-header">
                  GENDER DISTRIBUTION
                </div>
                <div className="p-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <div
                    style={{
                      maxWidth: "280px",
                      maxHeight: "280px",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {genderChartData && (
                      <Doughnut
                        data={genderChartData}
                        options={{
                          plugins: { legend: { position: "bottom" } },
                          maintainAspectRatio: true,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div
                className="border rounded-4 overflow-hidden shadow-sm bg-white d-flex flex-column h-100 zoom-card"
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
                        COMMON DIAGNOSIS
                      </div>
                      <div
                        className="d-flex align-items-center justify-content-center flex-grow-1"
                        style={{
                          width: "100%",
                          maxWidth: "500px",
                          padding: "1rem",
                        }}
                      >
                        {diagnosisChartData && (
                          <Pie
                            data={diagnosisChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: true,
                              plugins: {
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
                              },
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )
                }
              >
                <div className="text-white text-center py-2 fw-bold small gender-chart-header">
                  COMMON DIAGNOSIS
                </div>
                <div className="p-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <div
                    style={{
                      maxWidth: "280px",
                      maxHeight: "280px",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {diagnosisChartData && (
                      <Pie
                        data={diagnosisChartData}
                        options={{
                          plugins: { legend: { position: "bottom" } },
                          maintainAspectRatio: true,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ===== RENDER HOME COMPONENT =====
  return (
    <div className="dashboard-container d-flex">
      <div className="main-wrapper flex-grow-1 bg-light d-flex flex-column">
        <main className="flex-grow-1 main-content">
          <HeaderBanner
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onAcceptResident={handleAcceptResident}
            onLogout={onLogout}
          />

          {/* MAIN CONTENT AREA */}
          {renderContent()}
        </main>
      </div>

      {/* ZOOM MODAL FOR CHARTS */}
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
}

export default Home;
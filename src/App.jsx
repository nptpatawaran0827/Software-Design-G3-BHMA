import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MainLayout from './MainLayout.jsx'; 
import LoginPage from './LoginPage.jsx'
import Home from './Home.jsx'
import LandingPage from './LandingPage.jsx'
import ResidentPage from './ResidentPage.jsx'
import AnalyticsPage from './AnalyticsPage.jsx' 
import RecordsPage from './RecordsPage.jsx'     
import HeatmapPage from './HeatmapPage'; // Heatmap imported
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion' 

function App() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(Boolean(localStorage.getItem('authToken')));
  const [submittedId, setSubmittedId] = useState(null);

  // --- INACTIVITY STATES ---
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

    // --- SUCCESS HANDLER FOR RESIDENT FORM ---
  // This function is triggered when a resident successfully submits the form
  const handleResidentSubmitSuccess = (id) => {
    setSubmittedId(id); // Store the ID to show in LandingPage
    navigate('/');      // Redirect back to LandingPage
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    setIsAuthed(false);
    setShowWarning(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    navigate('/'); 
  }, [navigate]);

  function handleLoginSuccess() {
    localStorage.setItem('authToken', 'sample-token');
    setIsAuthed(true);
    navigate('/Dashboard'); 
  }

  const resetInactivityTimer = useCallback(() => {
    setShowWarning(false);
    setCountdown(60);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    if (isAuthed) {
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true);
        countdownIntervalRef.current = setInterval(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
      }, 240000); 

      logoutTimerRef.current = setTimeout(() => {
        handleLogout();
      }, 300000);
    }
  }, [isAuthed, handleLogout]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    if (isAuthed) {
      events.forEach(e => window.addEventListener(e, resetInactivityTimer));
      resetInactivityTimer();
    }
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isAuthed, resetInactivityTimer]);

  return (
    <div className="app-root">
      <AnimatePresence>
        {showWarning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlayStyle}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={aestheticModalStyle}>
              <div style={iconCircleStyle}>⌛</div>
              <h5>Inactivity Timeout</h5>
              <p>Your session expires in <strong style={{ color: '#ff4757' }}>{countdown}s</strong></p>
              <div style={progressBgStyle}>
                <motion.div initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 60, ease: "linear" }} style={progressFillStyle} />
              </div>
              <button onClick={resetInactivityTimer} style={stayButtonStyle}>Keep working</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="app-content">
        <Routes>
          <Route path="/" element={
            <LandingPage 
              onHealthWorkerClick={() => navigate('/HWLogin')} 
              onResidentClick={() => navigate('/Resident')} 
              submissionStatus={submittedId} // UPDATED: Pass the ID here
            />
          } />
          <Route path="/Resident" element={
            <ResidentPage 
              onCancel={() => navigate('/')} 
              onSubmitSuccess={handleResidentSubmitSuccess} // UPDATED: Pass the handler here
            />
          } />
          
          <Route path="/HWLogin" element={
            isAuthed ? (
              <Navigate to="/Dashboard" />
            ) : (
              <LoginPage 
                onLoginSuccess={handleLoginSuccess} 
                onReturnToLanding={() => navigate('/')} 
              />
            )
          } />

          <Route element={isAuthed ? <MainLayout onLogout={handleLogout} /> : <Navigate to="/HWLogin" />}>
           <Route path="/Dashboard" element={<Home onLogout={handleLogout} />} />
           <Route path="/Records" element={<RecordsPage />} />
           <Route path="/Analytics" element={<AnalyticsPage />} />
           <Route path="/HealthMap" element={<HeatmapPage />} />
           <Route path="/Resident/:id" element={<ResidentPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div> 
    </div> 
  );
}

// --- WARNING STYLES ---
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const aestheticModalStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', width: '320px', border: '1px solid rgba(0,0,0,0.05)' };
const iconCircleStyle = { width: '50px', height: '50px', backgroundColor: '#f1f2f6', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', margin: '0 auto 15px' };
const progressBgStyle = { width: '100%', height: '6px', backgroundColor: '#f1f2f6', borderRadius: '10px', overflow: 'hidden', marginBottom: '25px' };
const progressFillStyle = { height: '100%', backgroundColor: '#ff4757', borderRadius: '10px' };
const stayButtonStyle = { width: '100%', padding: '12px', border: 'none', borderRadius: '12px', backgroundColor: '#2f3542', color: '#fff', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' };

export default App;
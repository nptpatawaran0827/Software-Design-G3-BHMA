import Header from './Header.jsx'
import LoginPage from './LoginPage.jsx'
import Home from './Home.jsx'
import LandingPage from './LandingPage.jsx'
import ResidentPage from './ResidentPage.jsx'
import AnalyticsPage from './AnalyticsPage.jsx' 
import RecordsPage from './RecordsPage.jsx'     
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion' 

function App() {
  const [isAuthed, setIsAuthed] = useState(Boolean(localStorage.getItem('authToken')))
  const [page, setPage] = useState(() => localStorage.getItem('currentPage') || 'landing')
  const [submittedId, setSubmittedId] = useState(null)

  // --- INACTIVITY STATES ---
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60); // Updated: Starts at 60s
  
  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('currentPage', page);
  }, [page]);

  function handleLoginSuccess() {
    localStorage.setItem('authToken', 'sample-token')
    setIsAuthed(true)
    setPage('home')
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentPage') 
    setIsAuthed(false)
    setPage('landing')
    setShowWarning(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    setShowWarning(false);
    setCountdown(60); // Reset to 60 seconds
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    if (isAuthed) {
      // 4 minutes (240,000ms) of silence -> Show warning
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true);
        countdownIntervalRef.current = setInterval(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
      }, 240000); 

      // 5 minutes (300,000ms) of silence -> Logout
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

  function handleResidentSuccess(newId) {
    setSubmittedId(newId);
    setPage('landing');
  }

  const isDashboardPage = ['home', 'analytics', 'records', 'healthform'].includes(page);

  return (
    <div className="app-root">
      {/* --- WARNING OVERLAY --- */}
      <AnimatePresence>
        {showWarning && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={overlayStyle}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={aestheticModalStyle}
            >
              <div style={iconCircleStyle}>⌛</div>
              <h5 style={{ fontWeight: '700', marginBottom: '8px' }}>Inactivity Timeout</h5>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
                Your session expires in <strong style={{ color: '#ff4757' }}>{countdown}s</strong>
              </p>
              
              {/* Progress Bar - Updated transition to 60s */}
              <div style={progressBgStyle}>
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 60, ease: "linear" }}
                  style={progressFillStyle}
                />
              </div>

              <button 
                onClick={resetInactivityTimer} 
                style={stayButtonStyle}
              >
                Keep working
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="app-content">
        {isAuthed && isDashboardPage && (
          <Header onNavigate={(target) => setPage(target)} onLogout={handleLogout} />
        )}

        {page === 'landing' && (
          <LandingPage 
            onHealthWorkerClick={() => { setSubmittedId(null); setPage('login'); }}
            onResidentClick={() => { setSubmittedId(null); setPage('resident'); }}
            submissionStatus={submittedId}
          />
        )}

        {page === 'resident' && (
          <ResidentPage onCancel={() => setPage('landing')} onSubmitSuccess={handleResidentSuccess} />
        )}

        {page === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} onReturnToLanding={() => setPage('landing')} />
        )}

        {isAuthed && (
          <>
            {page === 'home' && <Home onLogout={handleLogout} />}
            {page === 'analytics' && <AnalyticsPage />}
            {page === 'records' && <RecordsPage />}
            {page === 'healthform' && <RecordsPage autoOpenForm={true} />} 
          </>
        )}
      </div>
    </div>
  )
}

// --- WARNING STYLES ---
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.4)', 
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
  zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center'
};

const aestheticModalStyle = {
  backgroundColor: '#fff', padding: '30px', borderRadius: '24px',
  textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  width: '320px', border: '1px solid rgba(0,0,0,0.05)'
};

const iconCircleStyle = {
  width: '50px', height: '50px', backgroundColor: '#f1f2f6',
  borderRadius: '50%', display: 'flex', justifyContent: 'center',
  alignItems: 'center', fontSize: '1.5rem', margin: '0 auto 15px'
};

const progressBgStyle = {
  width: '100%', height: '6px', backgroundColor: '#f1f2f6',
  borderRadius: '10px', overflow: 'hidden', marginBottom: '25px'
};

const progressFillStyle = {
  height: '100%', backgroundColor: '#ff4757', borderRadius: '10px'
};

const stayButtonStyle = {
  width: '100%', padding: '12px', border: 'none', borderRadius: '12px',
  backgroundColor: '#2f3542', color: '#fff', fontWeight: '600',
  cursor: 'pointer', transition: 'all 0.2s ease'
};

export default App;
import Header from './Header.jsx'
import LoginPage from './LoginPage.jsx'
import Home from './Home.jsx'
import LandingPage from './LandingPage.jsx'
import ResidentPage from './ResidentPage.jsx'
import AnalyticsPage from './AnalyticsPage.jsx' // New Import
import RecordsPage from './RecordsPage.jsx'     // New Import
import { useState } from 'react'

function App() {
  const [isAuthed, setIsAuthed] = useState(
    Boolean(localStorage.getItem('authToken'))
  )

  const [page, setPage] = useState('landing') 
  const [submittedId, setSubmittedId] = useState(null)

  function handleLoginSuccess() {
    localStorage.setItem('authToken', 'sample-token')
    setIsAuthed(true)
    setPage('home')
  }

  function handleLogout() {
    localStorage.removeItem('authToken')
    setIsAuthed(false)
    setPage('landing')
  }

  function handleResidentSuccess(newId) {
    setSubmittedId(newId);
    setPage('landing');
  }

  return (
    <div className="app-root">
      <div className="app-content">
        {/* Pass setPage to Header so you can click "Analytics" or "Records" in the sidebar/nav */}
        {isAuthed && (page === 'home' || page === 'analytics' || page === 'records') && (
          <Header onNavigate={(target) => setPage(target)} onLogout={handleLogout} />
        )}

        {page === 'landing' && (
          <LandingPage 
            onHealthWorkerClick={() => {
              setSubmittedId(null);
              setPage('login');
            }}
            onResidentClick={() => {
              setSubmittedId(null);
              setPage('resident');
            }}
            submissionStatus={submittedId}
          />
        )}

        {page === 'resident' && (
          <ResidentPage 
            onCancel={() => setPage('landing')} 
            onSubmitSuccess={handleResidentSuccess} 
          />
        )}

        {page === 'login' && (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onReturnToLanding={() => setPage('landing')}
          />
        )}

        {/* Dashboard Pages */}
        {page === 'home' && isAuthed && (
          <Home onLogout={handleLogout} />
        )}

        {page === 'analytics' && isAuthed && (
          <AnalyticsPage />
        )}

        {page === 'records' && isAuthed && (
          <RecordsPage />
        )}
      </div>
    </div>
  )
}

export default App


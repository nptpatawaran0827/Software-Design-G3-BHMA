import Header from './Header.jsx'
import LoginPage from './LoginPage.jsx'
import Home from './Home.jsx'
import LandingPage from './LandingPage.jsx'
import ResidentPage from './ResidentPage.jsx'
import { useState } from 'react'

function App() {
  const [isAuthed, setIsAuthed] = useState(
    Boolean(localStorage.getItem('authToken'))
  )

  const [page, setPage] = useState('landing') 
  // State to hold the ID from ResidentPage
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

  // Function to handle the ID returned from the ResidentPage
  function handleResidentSuccess(newId) {
    setSubmittedId(newId);
    setPage('landing');
  }

  return (
    <div className="app-root">
      <div className="app-content">
        {isAuthed && page === 'home' && <Header />}

        {page === 'landing' && (
          <LandingPage 
            onHealthWorkerClick={() => {
              setSubmittedId(null); // Clear notification when moving to login
              setPage('login');
            }}
            onResidentClick={() => {
              setSubmittedId(null); // Clear notification when starting new form
              setPage('resident');
            }}
            submissionStatus={submittedId} // Pass ID to LandingPage
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

        {page === 'home' && isAuthed && (
          <Home onLogout={handleLogout} />
        )}
      </div>
    </div>
  )
}

export default App
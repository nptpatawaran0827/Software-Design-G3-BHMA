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

  // NEW: controls what screen is shown
  const [page, setPage] = useState('landing') 
  // landing | login | home

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

  return (
    <div className="app-root">
      <div className="app-content">
        {isAuthed && page === 'home' && <Header />}

        {page === 'landing' && (
          <LandingPage 
            onHealthWorkerClick={() => setPage('login')}
            onResidentClick={() => setPage('resident')}
          />
        )}

        {page === 'resident' && (
          <ResidentPage onCancel={() => setPage('landing')} />
        )}

        {page === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}

        {page === 'home' && isAuthed && (
          <Home onLogout={handleLogout} />
        )}
      </div>
    </div>
  )
}

export default App

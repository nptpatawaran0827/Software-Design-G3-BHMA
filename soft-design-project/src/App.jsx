import Header from './Header.jsx'
import LoginPage from './LoginPage.jsx'
import Home from './Home.jsx'
import { useState } from 'react'

function App() {
    const [isAuthed, setIsAuthed] = useState(Boolean(localStorage.getItem('authToken')))

    function handleLogout() {
        localStorage.removeItem('authToken')
        setIsAuthed(false)
    }

    return (
        <div className="app-root">
            <div className="app-content">
                {isAuthed && <Header />}

                {isAuthed ? (
                    <Home onLogout={handleLogout} />
                ) : (
                    <LoginPage onLoginSuccess={() => setIsAuthed(true)} />
                )}
            </div>
        </div>
    )
}

export default App

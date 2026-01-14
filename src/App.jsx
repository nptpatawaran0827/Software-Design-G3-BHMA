import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header.jsx';
import LoginPage from './LoginPage.jsx';
import Home from './Home.jsx';
import LandingPage from './LandingPage.jsx';
import ResidentPage from './ResidentPage.jsx';
import HeatmapPage from './HeatmapPage';

function App() {
    const [isAuthed, setIsAuthed] = useState(
        Boolean(localStorage.getItem('authToken'))
    );
    const [page, setPage] = useState('landing');
    const [submittedId, setSubmittedId] = useState(null);

    function handleLoginSuccess() {
        localStorage.setItem('authToken', 'sample-token');
        setIsAuthed(true);
        setPage('home');
    }

    function handleLogout() {
        localStorage.removeItem('authToken');
        setIsAuthed(false);
        setPage('landing');
    }

    function handleResidentSuccess(newId) {
        setSubmittedId(newId);
        setPage('landing'); // [cite: 357]
    }

    return (
        <div className="app-root">
            <Routes>
                {/* Protected Heatmap Route [cite: 358] */}
                <Route path="/heatmap" element={isAuthed ? <HeatmapPage /> : <Navigate to="/" />} />
                
                {/* Existing Main Routing Logic [cite: 359] */}
                <Route path="*" element={
                    <div className="app-content">
                        {isAuthed && page === 'home' && <Header />}
                        {page === 'landing' && (
                            <LandingPage
                                onHealthWorkerClick={() => setPage('login')}
                                onResidentClick={() => setPage('resident')}
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
                        {page === 'home' && isAuthed && (
                            <Home onLogout={handleLogout} />
                        )}
                    </div>
                } />
            </Routes>
        </div>
    );
}

export default App; // [cite: 360]
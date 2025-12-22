import { useState } from 'react';
// Import your logo image here
import logo from './assets/logo.png'; 

function LoginPage({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }
        if (username === 'admin' && password === 'password') {
            localStorage.setItem('authToken', 'demo-token');
            onLoginSuccess && onLoginSuccess();
        } else {
            setError('Invalid username or password');
        }
    }

    return (
        /* The "login-page" class now handles the blue gradient background from our CSS */
        <div className="login-page">
            <form className="login-card shadow bg-white" onSubmit={handleSubmit}>
                {/* Logo Section */}
                <div className="text-center mb-4">
                    <img 
                        src={logo} 
                        alt="Barangay Logo" 
                        style={{ width: '200px', height: '200px', objectFit: 'contain' }} 
                        className="mb-3"
                    />
                    <h2 className="fw-bold" style={{ color: '#333' }}>Log in</h2>
                 
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Username</label>
                    <input
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        placeholder="admin"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        placeholder="password"
                    />
                </div>

                <button type="submit" className="btn text-white w-100 mt-2 py-2" style={{ backgroundColor: '#4da3ff', fontWeight: 'bold' }}>
                    Log in
                </button>
                
                <p className="text-muted text-center mt-4 small">
                    Tip: try <strong>admin</strong> / <strong>password</strong>
                </p>

                {error && <div className="alert alert-danger mt-3 py-2 text-center" style={{ fontSize: '0.9rem' }}>{error}</div>}
            </form>
        </div>
    );
}

export default LoginPage;
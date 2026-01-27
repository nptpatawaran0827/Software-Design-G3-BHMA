import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'; // Import the icons
import logo from './assets/logo.png'
import login from './assets/Login.png'
import cloudBackground from './assets/bg-cloud.jpg'
import './style/LoginPage.css'

function LoginPage({ onLoginSuccess, onReturnToLanding  }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  // We add 'async' here so we can use 'await' for the database call
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }

    try {
      // 1. Send data to your Node.js backend
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      // 2. Check if the backend says the login is valid
      if (response.ok && data.success) {
        // We store the token and the Admin details provided by the backend
        localStorage.setItem('authToken', 'real-token-from-db');
        localStorage.setItem('adminId', data.adminId);  // Stores ID (e.g., 1 or 2)
        localStorage.setItem('username', data.username); // Stores Username (e.g., Admin_H1)
        
        onLoginSuccess && onLoginSuccess();
      } else {
        // This catches the 401 "Invalid credentials" error
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      // This catches errors if the server is offline
      setError('Cannot connect to server. Is your backend running?');
      console.error("Login error:", err);
    }
  }

  const pageStyle = cloudBackground ? {
    '--login-bg-image': `url(${cloudBackground})`
  } : {};

  return (
    <div className="login-portal" style={pageStyle}>
      <div className="login-card-split" role="main">
        <div className="login-left">

             <button className="return-btn" onClick={onReturnToLanding}>
            ← Return
          </button>
          
          <div className="logo-wrap">
            <div className="logo-placeholder" aria-hidden="true">
                <img src={logo} alt="Logo" />
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-title">Log in</h2>

            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Enter Username"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter Password"
                  style={{ paddingRight: '45px' }} // Make room for the icon
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-login w-100 mt-2">Log in</button>

            {/* Changed tip to reflect real DB usage */}
            <p className="text-muted text-center mt-3 small tip">
              Use your <strong>SQL database</strong> credentials.
            </p>

            {error && <div className="alert alert-danger mt-3 py-2 text-center">{error}</div>}
          </form>
        </div>

        <div className="login-right"
            style={{ "--login-right-image": `url(${login})` }}>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
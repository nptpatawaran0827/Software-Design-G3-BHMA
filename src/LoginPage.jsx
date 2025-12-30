import { useState } from 'react'
import logo from './assets/logo.png'
import login from './assets/Login.jpg'
import './style/LoginPage.css'  // new scoped styles, does not touch other pages

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }
    // Mock auth: accept admin / password
    if (username === 'admin' && password === 'password') {
      localStorage.setItem('authToken', 'demo-token')
      onLoginSuccess && onLoginSuccess()
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="login-portal">
      <div className="login-card-split" role="main">
        <div className="login-left">
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
                placeholder="admin"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="password"
              />
            </div>

            <button type="submit" className="btn btn-login w-100 mt-2">Log in</button>

            <p className="text-muted text-center mt-3 small tip">
              Tip: try <strong>admin</strong> / <strong>password</strong>
            </p>

            {error && <div className="alert alert-danger mt-3 py-2 text-center">{error}</div>}
          </form>
        </div>

        <div className="login-right" class="login-right"
            style={{ "--login-right-image": `url(${login})` }}>
        </div>
      </div>
    </div>
  );
}

export default LoginPage
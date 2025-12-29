import { useState } from 'react'

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
        <div className="login-page d-flex align-items-center justify-content-center vh-100 bg-light">
            <form className="login-card p-4 shadow-sm bg-white rounded" style={{ width: '100%', maxWidth: '400px' }} onSubmit={handleSubmit}>
                <h1 className="text-center mb-4">Sign in</h1>

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

                <button type="submit" className="btn btn-primary w-100 mt-2">Sign in</button>
                
                <p className="text-muted text-center mt-3 small">
                    Tip: try <strong>admin</strong> / <strong>password</strong>
                </p>

                {error && <div className="alert alert-danger mt-3 py-2 text-center">{error}</div>}
            </form>
        </div>
	);
}


export default LoginPage

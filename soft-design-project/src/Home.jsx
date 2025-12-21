import React from 'react'

function Home({ onLogout }) {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Welcome</h1>
      <p>This is a simple homepage shown after sign in.</p>
      <button onClick={() => {
        localStorage.removeItem('authToken')
        onLogout && onLogout()
      }}>Logout</button>
    </main>
  )
}

export default Home

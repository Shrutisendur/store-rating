import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function OwnerDash() {
  const [data, setData] = useState(null)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('dashboard')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get('http://localhost:5000/owner/dashboard', { headers }).then(r => setData(r.data))
  }, [])

  const updatePassword = async () => {
    await axios.put('http://localhost:5000/password', { password }, { headers })
    alert('Password updated!')
    setPassword('')
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Store Owner Dashboard</h2>
        <button onClick={logout} style={{ padding: '8px 16px', background: 'red', color: 'white' }}>Logout</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        {['dashboard', 'password'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ marginRight: 10, padding: '8px 16px', background: tab === t ? 'blue' : 'gray', color: 'white' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && data && (
        <div>
          <h3>Store: {data.store.name}</h3>
          <p>Address: {data.store.address}</p>
          <p>Average Rating: {data.avg_rating ? parseFloat(data.avg_rating).toFixed(1) : 'No ratings yet'}</p>
          <h3>Users who rated your store:</h3>
          <table border="1" width="100%" cellPadding="8">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Rating</th></tr>
            </thead>
            <tbody>
              {data.raters.map((r, i) => (
                <tr key={i}><td>{r.name}</td><td>{r.email}</td><td>{r.rating}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'password' && (
        <div style={{ maxWidth: 400 }}>
          <h3>Update Password</h3>
          <input placeholder="New Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
          <button onClick={updatePassword}
            style={{ width: '100%', padding: 10, background: 'blue', color: 'white' }}>
            Update Password
          </button>
        </div>
      )}
    </div>
  )
}
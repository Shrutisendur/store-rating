import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function UserDash() {
  const [stores, setStores] = useState([])
  const [search, setSearch] = useState('')
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('stores')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get('http://localhost:5000/stores', { headers }).then(r => setStores(r.data))
  }, [])

  const submitRating = async (store_id, rating) => {
    await axios.post('http://localhost:5000/ratings', { store_id, rating }, { headers })
    alert('Rating submitted!')
    const r = await axios.get('http://localhost:5000/stores', { headers })
    setStores(r.data)
  }

  const updatePassword = async () => {
    await axios.put('http://localhost:5000/password', { password }, { headers })
    alert('Password updated!')
    setPassword('')
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>User Dashboard</h2>
        <button onClick={logout} style={{ padding: '8px 16px', background: 'red', color: 'white' }}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        {['stores', 'password'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ marginRight: 10, padding: '8px 16px', background: tab === t ? 'blue' : 'gray', color: 'white' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Stores Tab */}
      {tab === 'stores' && (
        <div>
          <input placeholder="Search by name or address" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 8, marginBottom: 10, width: '100%' }} />
          <table border="1" width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Address</th>
                <th>Overall Rating</th>
                <th>Your Rating</th>
                <th>Submit Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.address}</td>
                  <td>{s.avg_rating ? parseFloat(s.avg_rating).toFixed(1) : 'No ratings'}</td>
                  <td>{s.my_rating || 'Not rated'}</td>
                  <td>
                    <select defaultValue={s.my_rating || ''}
                      onChange={e => submitRating(s.id, e.target.value)}>
                      <option value="" disabled>Select</option>
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Password Tab */}
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
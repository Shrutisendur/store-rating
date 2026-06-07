import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function AdminDash() {
  const [tab, setTab] = useState('dashboard')
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [stores, setStores] = useState([])
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'user' })
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', owner_id: '' })
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get('http://localhost:5000/admin/dashboard', { headers }).then(r => setStats(r.data))
    axios.get('http://localhost:5000/admin/users', { headers }).then(r => setUsers(r.data))
    axios.get('http://localhost:5000/admin/stores', { headers }).then(r => setStores(r.data))
  }, [])

  const addUser = async () => {
    await axios.post('http://localhost:5000/admin/users', newUser, { headers })
    alert('User added!')
    const r = await axios.get('http://localhost:5000/admin/users', { headers })
    setUsers(r.data)
  }

  const addStore = async () => {
    await axios.post('http://localhost:5000/admin/stores', newStore, { headers })
    alert('Store added!')
    const r = await axios.get('http://localhost:5000/admin/stores', { headers })
    setStores(r.data)
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Admin Dashboard</h2>
        <button onClick={logout} style={{ padding: '8px 16px', background: 'red', color: 'white' }}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        {['dashboard', 'users', 'stores', 'addUser', 'addStore'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ marginRight: 10, padding: '8px 16px', background: tab === t ? 'blue' : 'gray', color: 'white' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && (
        <div>
          <h3>Stats</h3>
          <p>Total Users: {stats.users}</p>
          <p>Total Stores: {stats.stores}</p>
          <p>Total Ratings: {stats.ratings}</p>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          <input placeholder="Search by name or email" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 8, marginBottom: 10, width: '100%' }} />
          <table border="1" width="100%" cellPadding="8">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Address</th><th>Role</th></tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.address}</td><td>{u.role}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stores Tab */}
      {tab === 'stores' && (
        <div>
          <input placeholder="Search by name or email" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 8, marginBottom: 10, width: '100%' }} />
          <table border="1" width="100%" cellPadding="8">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Address</th><th>Avg Rating</th></tr>
            </thead>
            <tbody>
              {filteredStores.map(s => (
                <tr key={s.id}><td>{s.name}</td><td>{s.email}</td><td>{s.address}</td><td>{s.avg_rating ? parseFloat(s.avg_rating).toFixed(1) : 'No ratings'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Tab */}
      {tab === 'addUser' && (
        <div style={{ maxWidth: 400 }}>
          <h3>Add New User</h3>
          {['name', 'email', 'password', 'address'].map(field => (
            <input key={field} placeholder={field} type={field === 'password' ? 'password' : 'text'}
              value={newUser[field]} onChange={e => setNewUser({ ...newUser, [field]: e.target.value })}
              style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
          ))}
          <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
            style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}>
            <option value="user">Normal User</option>
            <option value="admin">Admin</option>
            <option value="store_owner">Store Owner</option>
          </select>
          <button onClick={addUser}
            style={{ width: '100%', padding: 10, background: 'blue', color: 'white' }}>
            Add User
          </button>
        </div>
      )}

      {/* Add Store Tab */}
      {tab === 'addStore' && (
        <div style={{ maxWidth: 400 }}>
          <h3>Add New Store</h3>
          {['name', 'email', 'address'].map(field => (
            <input key={field} placeholder={field}
              value={newStore[field]} onChange={e => setNewStore({ ...newStore, [field]: e.target.value })}
              style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
          ))}
          <input placeholder="Owner ID (user id of store owner)"
            value={newStore.owner_id} onChange={e => setNewStore({ ...newStore, owner_id: e.target.value })}
            style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
          <button onClick={addStore}
            style={{ width: '100%', padding: 10, background: 'blue', color: 'white' }}>
            Add Store
          </button>
        </div>
      )}
    </div>
  )
}
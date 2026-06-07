import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const validate = () => {
    if (form.name.length < 20 || form.name.length > 60) return 'Name must be 20-60 characters'
    if (form.address.length > 400) return 'Address max 400 characters'
    if (!/^.{8,16}$/.test(form.password) || !/[A-Z]/.test(form.password) || !/[^a-zA-Z0-9]/.test(form.password))
      return 'Password: 8-16 chars, 1 uppercase, 1 special character'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email'
    return null
  }

  const handleRegister = async () => {
    const err = validate()
    if (err) return setError(err)
    try {
      await axios.post('http://localhost:5000/register', form)
      alert('Registered successfully!')
      navigate('/')
    } catch {
      setError('Registration failed')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input placeholder="Name (min 20 chars)" value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
      <input placeholder="Email" value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
      <input placeholder="Address" value={form.address}
        onChange={e => setForm({ ...form, address: e.target.value })}
        style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
      <input placeholder="Password" type="password" value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
      <button onClick={handleRegister}
        style={{ width: '100%', padding: 10, background: 'green', color: 'white' }}>
        Register
      </button>
      <p>Already have account? <a href="/">Login</a></p>
    </div>
  )
}
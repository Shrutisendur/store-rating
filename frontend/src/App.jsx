import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDash from './pages/AdminDash'
import UserDash from './pages/UserDash'
import OwnerDash from './pages/OwnerDash'

function App() {
  const role = localStorage.getItem('role')
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={role === 'admin' ? <AdminDash /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={role === 'user' ? <UserDash /> : <Navigate to="/" />} />
        <Route path="/owner" element={role === 'store_owner' ? <OwnerDash /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
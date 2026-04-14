import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { fetchAdminUser } from './slices/authSlice'
import Sidebar from './components/Sidebar'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Tasks from './pages/Tasks'
import Applications from './pages/Applications'
import ActiveWorkers from './pages/ActiveWorkers'

function AdminRoute({ children }) {
  const { token, user } = useSelector((s) => s.auth)
  if (!token) return <Navigate to="/login" replace />
  if (user && !user.is_admin) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const dispatch = useDispatch()
  const { token } = useSelector((s) => s.auth)

  useEffect(() => {
    if (token) dispatch(fetchAdminUser())
  }, [token, dispatch])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/*" element={
          <AdminRoute>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-gray-100">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/active-workers" element={<ActiveWorkers />} />
                </Routes>
              </main>
            </div>
          </AdminRoute>
        } />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  )
}

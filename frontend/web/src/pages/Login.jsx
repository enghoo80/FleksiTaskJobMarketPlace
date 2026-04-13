import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginWithEmail } from '../store/authSlice'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((s) => s.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    try {
      await dispatch(loginWithEmail({ email, password })).unwrap()
      navigate('/')
    } catch (err) {
      toast.error(err || 'Login failed')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to find your next task</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" required autoComplete="current-password" />
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
            <strong>Google Sign-In:</strong> obtain a Google ID token client-side and POST to{' '}
            <code className="bg-blue-100 px-1 rounded">/api/v1/auth/google</code>
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

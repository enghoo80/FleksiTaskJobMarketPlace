import { Link } from 'react-router-dom'

export default function Register() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Start finding flexible work today</p>
          </div>

          <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 text-sm text-primary-800">
            <p className="font-semibold mb-2">Quick Registration</p>
            <p className="text-xs">Obtain a Google ID token and POST it to <code className="bg-primary-100 px-1 rounded">/api/v1/auth/google</code> — the API creates your account automatically.</p>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Instant account creation</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Browse hundreds of local tasks</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> One-tap application</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Real-time push notifications</li>
          </ul>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Placeholder: would hit an admin /users endpoint in v2
    setLoading(false)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-medium">User management</p>
          <p className="text-sm mt-1">Connect to the <code className="bg-gray-100 px-1 rounded">/api/v1/admin/users</code> endpoint (add in backend v2).</p>
        </div>
      )}
    </div>
  )
}

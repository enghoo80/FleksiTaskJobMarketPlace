import { useEffect, useState } from 'react'
import api from '../api/client'
import { toast } from 'react-toastify'

export default function Applications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load recent applications via a known task (admin would have a dedicated endpoint in v2)
    setLoading(false)
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/applications/${id}/status`, { status })
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
      toast.success(`Application ${status}`)
    } catch {
      toast.error('Update failed')
    }
  }

  const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
    withdrawn: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Applications</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">📝</p>
          <p>No applications loaded. Select a task from the Tasks page to view its applications.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b">
              <tr>
                <th className="px-4 py-3 text-left">Worker</th>
                <th className="px-4 py-3 text-left">Task</th>
                <th className="px-4 py-3 text-left">Applied</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{app.worker?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{app.task?.title ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(app.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    {app.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(app.id, 'approved')} className="text-xs text-green-600 hover:underline">Approve</button>
                        <button onClick={() => updateStatus(app.id, 'rejected')} className="text-xs text-red-600 hover:underline">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Tasks() {
  const [data, setData] = useState({ tasks: [], total: 0, page: 1, total_pages: 1 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const load = (p = 1) => {
    setLoading(true)
    api.get(`/tasks?page=${p}&page_size=15`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])

  const handleStatusChange = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status })
    load(page)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tasks ({data.total})</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Pay/min</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : data.tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{task.title}</td>
                <td className="px-4 py-3 text-gray-600">{task.location}</td>
                <td className="px-4 py-3 text-gray-600">{task.category}</td>
                <td className="px-4 py-3 text-right font-medium">${task.pay_rate_per_minute}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    task.status === 'open' ? 'bg-green-100 text-green-700' :
                    task.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-100 text-red-600'
                  }`}>{task.status}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {task.status === 'open' && (
                    <button
                      onClick={() => handleStatusChange(task.id, 'cancelled')}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Prev</button>
          <span className="px-3 py-1 text-sm">{page} / {data.total_pages}</span>
          <button onClick={() => setPage(p => Math.min(data.total_pages, p + 1))} disabled={page === data.total_pages} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}

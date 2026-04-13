import { useEffect, useState } from 'react'
import StatsCard from '../components/StatsCard'
import api from '../api/client'

export default function Dashboard() {
  const [stats, setStats] = useState({ tasks: 0 })

  useEffect(() => {
    api.get('/tasks?page_size=1').then((r) => {
      setStats({ tasks: r.data.total })
    }).catch(() => {})
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Tasks" value={stats.tasks} icon="📋" color="green" />
        <StatsCard label="Total Users" value="—" icon="👥" color="blue" />
        <StatsCard label="Applications" value="—" icon="📝" color="yellow" />
        <StatsCard label="Open Tasks" value="—" icon="🟢" color="purple" />
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center text-gray-400">
        <p className="text-4xl mb-3">📊</p>
        <p className="font-medium">Analytics charts coming in v2</p>
      </div>
    </div>
  )
}

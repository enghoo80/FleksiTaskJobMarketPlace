import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTasks } from '../store/taskSlice'
import TaskCard from '../components/TaskCard'
import FilterBar from '../components/FilterBar'

export default function Home() {
  const dispatch = useDispatch()
  const { items, loading, error, total, page, totalPages, filters } = useSelector((s) => s.tasks)

  useEffect(() => {
    dispatch(fetchTasks({}))
  }, [dispatch])

  const handlePage = (newPage) => {
    dispatch(fetchTasks({ ...filters, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Find Flexible Work <span className="text-primary-600">Near You</span>
        </h1>
        <p className="mt-2 text-gray-600 text-lg">Browse tasks, apply in one tap, and start earning today.</p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterBar filters={filters} />
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {loading ? 'Loading...' : `${total} task${total !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* Error */}
      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {/* Task Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No tasks found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((task) => <TaskCard key={task.id} task={task} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => handlePage(page - 1)}
            disabled={page === 1}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="flex items-center text-sm text-gray-600 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePage(page + 1)}
            disabled={page === totalPages}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

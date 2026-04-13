import api from './client'

export const tasksApi = {
  list: async ({ page = 1, pageSize = 20, location, category, minPay, maxPay } = {}) => {
    const params = new URLSearchParams({ page, page_size: pageSize })
    if (location) params.set('location', location)
    if (category) params.set('category', category)
    if (minPay) params.set('min_pay', minPay)
    if (maxPay) params.set('max_pay', maxPay)
    const { data } = await api.get(`/tasks?${params}`)
    return data
  },
  getById: async (id) => {
    const { data } = await api.get(`/tasks/${id}`)
    return data
  },
  create: async (payload) => {
    const { data } = await api.post('/tasks', payload)
    return data
  },
}

export const applicationsApi = {
  apply: async (taskId, coverNote) => {
    const { data } = await api.post('/applications', { task_id: taskId, cover_note: coverNote })
    return data
  },
  getMyApplications: async () => {
    const { data } = await api.get('/applications/my')
    return data
  },
  getTaskApplications: async (taskId) => {
    const { data } = await api.get(`/applications/task/${taskId}`)
    return data
  },
  updateStatus: async (applicationId, status) => {
    const { data } = await api.patch(`/applications/${applicationId}/status`, { status })
    return data
  },
}

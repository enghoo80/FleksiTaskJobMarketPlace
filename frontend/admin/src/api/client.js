import axios from 'axios'

function normalizeApiHost(value) {
  if (!value) return ''
  return value.endsWith('/') ? value.slice(0, -1) : value
}

const configuredApiHost = normalizeApiHost(import.meta.env.VITE_API_BASE_URL?.trim())
const apiHost = configuredApiHost || ''
const apiBaseUrl = `${apiHost}/api/v1`

const api = axios.create({ baseURL: apiBaseUrl })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const rt = localStorage.getItem('admin_refresh_token')
      if (rt) {
        try {
          const { data } = await axios.post(`${apiBaseUrl}/auth/refresh`, { refresh_token: rt })
          localStorage.setItem('admin_access_token', data.access_token)
          localStorage.setItem('admin_refresh_token', data.refresh_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          localStorage.removeItem('admin_access_token')
          localStorage.removeItem('admin_refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export { apiBaseUrl }
export default api

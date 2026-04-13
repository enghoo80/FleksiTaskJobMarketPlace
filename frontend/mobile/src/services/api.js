import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const BASE_URL = 'http://10.0.2.2:8000/api/v1' // Android emulator loopback

const client = axios.create({ baseURL: BASE_URL })

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const rt = await AsyncStorage.getItem('refresh_token')
      if (rt) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: rt })
          await AsyncStorage.setItem('access_token', data.access_token)
          await AsyncStorage.setItem('refresh_token', data.refresh_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return client(original)
        } catch {
          await AsyncStorage.multiRemove(['access_token', 'refresh_token'])
        }
      }
    }
    return Promise.reject(error)
  }
)

export const tasksService = {
  list: async ({ page = 1, pageSize = 20, location, category } = {}) => {
    const params = new URLSearchParams({ page, page_size: pageSize })
    if (location) params.set('location', location)
    if (category) params.set('category', category)
    const { data } = await client.get(`/tasks?${params}`)
    return data
  },
  getById: async (id) => {
    const { data } = await client.get(`/tasks/${id}`)
    return data
  },
}

export const applicationsService = {
  apply: async (taskId, coverNote) => {
    const { data } = await client.post('/applications', { task_id: taskId, cover_note: coverNote })
    return data
  },
  getMyApplications: async () => {
    const { data } = await client.get('/applications/my')
    return data
  },
}

export const usersService = {
  updateProfile: async (payload) => {
    const { data } = await client.put('/users/me', payload)
    return data
  },
  updateFCMToken: async (fcmToken) => {
    await client.put('/users/me/fcm-token', { fcm_token: fcmToken })
  },
}

export default client

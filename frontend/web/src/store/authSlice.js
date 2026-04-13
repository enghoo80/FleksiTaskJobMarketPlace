import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '../api/auth'

export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (idToken, { rejectWithValue }) => {
  try {
    const data = await authApi.googleAuth(idToken)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Google login failed')
  }
})

export const loginWithEmail = createAsyncThunk('auth/loginWithEmail', async ({ email, password }, { rejectWithValue }) => {
  try {
    const data = await authApi.login(email, password)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Login failed')
  }
})

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    return await authApi.getMe()
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to fetch user')
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authApi.logout()
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('access_token'),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
    setUser: (state, action) => { state.user = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithGoogle.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false
        state.accessToken = action.payload.access_token
      })
      .addCase(loginWithGoogle.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(loginWithEmail.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false
        state.accessToken = action.payload.access_token
      })
      .addCase(loginWithEmail.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.user = action.payload })
      .addCase(fetchCurrentUser.rejected, (state) => { state.user = null; state.accessToken = null })
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; state.accessToken = null })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer

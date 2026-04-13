import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authService } from '../services/auth'

export const loginWithGoogle = createAsyncThunk('auth/google', async (idToken, { rejectWithValue }) => {
  try {
    const data = await authService.googleAuth(idToken)
    await AsyncStorage.setItem('access_token', data.access_token)
    await AsyncStorage.setItem('refresh_token', data.refresh_token)
    const user = await authService.getMe(data.access_token)
    return { ...data, user }
  } catch (err) {
    return rejectWithValue(err.message || 'Google login failed')
  }
})

export const loadStoredSession = createAsyncThunk('auth/loadSession', async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('access_token')
    if (!token) return rejectWithValue('No stored session')
    const user = await authService.getMe(token)
    return { access_token: token, user }
  } catch {
    return rejectWithValue('Session invalid')
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.multiRemove(['access_token', 'refresh_token'])
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false, error: null },
  reducers: {
    setUser: (state, action) => { state.user = action.payload },
  },
  extraReducers: (b) => {
    b.addCase(loginWithGoogle.pending, (s) => { s.loading = true; s.error = null })
     .addCase(loginWithGoogle.fulfilled, (s, a) => { s.loading = false; s.token = a.payload.access_token; s.user = a.payload.user })
     .addCase(loginWithGoogle.rejected, (s, a) => { s.loading = false; s.error = a.payload })
     .addCase(loadStoredSession.fulfilled, (s, a) => { s.token = a.payload.access_token; s.user = a.payload.user })
     .addCase(loadStoredSession.rejected, (s) => { s.token = null })
     .addCase(logoutUser.fulfilled, (s) => { s.user = null; s.token = null })
  },
})

export const { setUser } = authSlice.actions
export default authSlice.reducer

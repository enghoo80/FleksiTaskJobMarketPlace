import { GoogleSignin } from '@react-native-google-signin/google-signin'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

const BASE_URL = 'http://10.0.2.2:8000/api/v1'

GoogleSignin.configure({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
})

export const authService = {
  initGoogleSignIn: () => {
    // Already configured above via GoogleSignin.configure
  },

  googleSignIn: async () => {
    await GoogleSignin.hasPlayServices()
    const userInfo = await GoogleSignin.signIn()
    const { idToken } = await GoogleSignin.getTokens()
    return idToken
  },

  googleAuth: async (idToken) => {
    const { data } = await axios.post(`${BASE_URL}/auth/google`, { id_token: idToken })
    return data
  },

  getMe: async (token) => {
    const { data } = await axios.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  logout: async () => {
    await GoogleSignin.signOut()
    await AsyncStorage.multiRemove(['access_token', 'refresh_token'])
  },
}

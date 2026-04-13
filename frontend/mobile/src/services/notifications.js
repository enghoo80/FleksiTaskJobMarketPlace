import messaging from '@react-native-firebase/messaging'
import { usersService } from './api'

export const setupNotifications = async () => {
  const authStatus = await messaging().requestPermission()
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL

  if (!enabled) return

  const fcmToken = await messaging().getToken()
  if (fcmToken) {
    await usersService.updateFCMToken(fcmToken).catch(() => {})
  }

  // Refresh token
  messaging().onTokenRefresh(async (newToken) => {
    await usersService.updateFCMToken(newToken).catch(() => {})
  })
}

export const onForegroundNotification = (handler) => {
  return messaging().onMessage(handler)
}

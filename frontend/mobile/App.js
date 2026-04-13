import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { store } from './src/store'
import AppNavigator from './src/navigation/AppNavigator'
import { setupNotifications } from './src/services/notifications'

export default function App() {
  useEffect(() => {
    setupNotifications()
  }, [])

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  )
}

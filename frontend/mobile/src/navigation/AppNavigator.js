import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import { useSelector } from 'react-redux'

import LoginScreen from '../screens/LoginScreen'
import HomeScreen from '../screens/HomeScreen'
import TaskDetailScreen from '../screens/TaskDetailScreen'
import ProfileScreen from '../screens/ProfileScreen'
import MyApplicationsScreen from '../screens/MyApplicationsScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text> }}
      />
      <Tab.Screen
        name="MyApplications"
        component={MyApplicationsScreen}
        options={{
          title: 'Applications',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text> }}
      />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const { token } = useSelector((s) => s.auth)

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{ headerShown: true, title: 'Task Details', headerBackTitle: 'Back' }}
          />
        </>
      )}
    </Stack.Navigator>
  )
}

import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Alert } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { launchImageLibrary } from 'react-native-image-picker'
import { setUser } from '../store/slices/authSlice'
import { usersService } from '../services/api'
import { authService } from '../services/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SKILLS = ['Cleaning', 'Driving', 'Delivery', 'Moving', 'Gardening', 'Tech Support', 'Tutoring', 'Cooking']

export default function ProfileScreen() {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    location: user?.location || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
  })

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await usersService.updateProfile(form)
      dispatch(setUser(updated))
      Alert.alert('Success', 'Profile updated!')
    } catch {
      Alert.alert('Error', 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await authService.logout()
          await AsyncStorage.multiRemove(['access_token', 'refresh_token'])
          dispatch(setUser(null))
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        {user?.profile_photo_url ? (
          <Image source={{ uri: user.profile_photo_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{user?.full_name?.[0] ?? 'U'}</Text>
          </View>
        )}
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Form */}
      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={form.full_name} onChangeText={(v) => setForm((p) => ({ ...p, full_name: v }))} />

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={form.location} onChangeText={(v) => setForm((p) => ({ ...p, location: v }))} placeholder="e.g. New York, NY" />

        <Text style={styles.label}>Bio</Text>
        <TextInput style={[styles.input, styles.textArea]} value={form.bio} onChangeText={(v) => setForm((p) => ({ ...p, bio: v }))} multiline numberOfLines={3} placeholder="Tell employers about yourself..." />
      </View>

      {/* Skills */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skills}>
          {SKILLS.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[styles.skillChip, form.skills.includes(skill) && styles.skillChipActive]}
              onPress={() => toggleSkill(skill)}
            >
              <Text style={[styles.skillText, form.skills.includes(skill) && styles.skillTextActive]}>
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, gap: 16 },
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarInitial: { fontSize: 32, fontWeight: '700', color: '#2563eb' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827' },
  email: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  textArea: { height: 80, textAlignVertical: 'top' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  skillChipActive: { backgroundColor: '#dbeafe', borderColor: '#2563eb' },
  skillText: { fontSize: 13, color: '#6b7280' },
  skillTextActive: { color: '#2563eb', fontWeight: '600' },
  saveBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  logoutBtn: { borderWidth: 1, borderColor: '#fca5a5', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 20 },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 15 },
})

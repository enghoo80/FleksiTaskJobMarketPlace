import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, ActivityIndicator } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTaskById } from '../store/slices/taskSlice'
import { applicationsService } from '../services/api'

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params
  const dispatch = useDispatch()
  const { selectedTask: task, loading } = useSelector((s) => s.tasks)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [coverNote, setCoverNote] = useState('')

  useEffect(() => {
    dispatch(fetchTaskById(taskId))
  }, [taskId, dispatch])

  const totalPay = task ? (task.pay_rate_per_minute * task.estimated_duration_minutes).toFixed(2) : 0

  const handleApply = async () => {
    setApplying(true)
    try {
      await applicationsService.apply(taskId, coverNote)
      setApplied(true)
      Alert.alert('Applied!', "You'll be notified when your application is reviewed.")
    } catch (err) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading || !task) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Pay Banner */}
      <View style={styles.payBanner}>
        <Text style={styles.payAmount}>${totalPay}</Text>
        <Text style={styles.payRate}>${task.pay_rate_per_minute}/min × {task.estimated_duration_minutes} min</Text>
      </View>

      {/* Info */}
      <View style={styles.card}>
        <View style={styles.tags}>
          <Text style={styles.tagGreen}>{task.status.replace('_', ' ')}</Text>
          <Text style={styles.tagGray}>{task.category}</Text>
        </View>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.location}>📍 {task.location}</Text>

        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statVal}>{task.estimated_duration_minutes} min</Text><Text style={styles.statLabel}>Duration</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>{task.application_count}</Text><Text style={styles.statLabel}>Applied</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>{task.max_applicants}</Text><Text style={styles.statLabel}>Spots</Text></View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.body}>{task.description}</Text>
      </View>

      {task.requirements && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <Text style={styles.body}>{task.requirements}</Text>
        </View>
      )}

      {/* Apply */}
      {task.status === 'open' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Apply for this Task</Text>
          {applied ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✓ Application Submitted!</Text>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.textArea}
                placeholder="Optional: Why are you a good fit? (optional)"
                multiline
                numberOfLines={3}
                value={coverNote}
                onChangeText={setCoverNote}
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApply} disabled={applying}>
                <Text style={styles.applyBtnText}>
                  {applying ? 'Submitting...' : '⚡ Apply Now'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  payBanner: { backgroundColor: '#2563eb', borderRadius: 16, padding: 20, alignItems: 'center' },
  payAmount: { fontSize: 40, fontWeight: '800', color: '#fff' },
  payRate: { fontSize: 13, color: '#bfdbfe', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  tags: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tagGreen: { backgroundColor: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tagGray: { backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  location: { fontSize: 14, color: '#6b7280' },
  stats: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 8 },
  body: { fontSize: 14, color: '#374151', lineHeight: 22 },
  textArea: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 10 },
  applyBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  successBox: { backgroundColor: '#dcfce7', borderRadius: 10, padding: 16, alignItems: 'center' },
  successText: { color: '#16a34a', fontWeight: '700', fontSize: 15 },
})

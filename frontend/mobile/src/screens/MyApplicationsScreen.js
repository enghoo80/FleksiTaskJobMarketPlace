import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { applicationsService } from '../services/api'

const STATUS_COLORS = {
  pending: { bg: '#fef9c3', text: '#ca8a04' },
  approved: { bg: '#dcfce7', text: '#16a34a' },
  rejected: { bg: '#fee2e2', text: '#dc2626' },
  withdrawn: { bg: '#f3f4f6', text: '#6b7280' },
}

export default function MyApplicationsScreen() {
  const navigation = useNavigation()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applicationsService.getMyApplications()
      .then(setApps)
      .finally(() => setLoading(false))
  }, [])

  const renderItem = ({ item }) => {
    const colors = STATUS_COLORS[item.status] || STATUS_COLORS.pending
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => item.task_id && navigation.navigate('TaskDetail', { taskId: item.task_id })}
      >
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Text style={styles.taskTitle} numberOfLines={1}>{item.task?.title ?? 'Task'}</Text>
            <Text style={styles.taskLocation}>📍 {item.task?.location ?? '—'}</Text>
            {item.task && (
              <Text style={styles.pay}>
                ${(item.task.pay_rate_per_minute * item.task.estimated_duration_minutes).toFixed(2)} total
              </Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>
        {item.cover_note ? <Text style={styles.note} numberOfLines={2}>"{item.cover_note}"</Text> : null}
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Applications</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={apps}
          keyExtractor={(a) => a.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No applications yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  list: { padding: 12, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { flex: 1, marginRight: 10 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  taskLocation: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  pay: { fontSize: 13, fontWeight: '600', color: '#2563eb', marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  note: { fontSize: 12, color: '#6b7280', marginTop: 8, fontStyle: 'italic' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#9ca3af' },
})

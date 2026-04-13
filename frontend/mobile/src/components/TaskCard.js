import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function TaskCard({ task, onPress }) {
  const totalPay = (task.pay_rate_per_minute * task.estimated_duration_minutes).toFixed(2)

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.tags}>
            <Text style={styles.tag}>{task.category}</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
          <Text style={styles.location}>📍 {task.location}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.pay}>${totalPay}</Text>
          <Text style={styles.payRate}>${task.pay_rate_per_minute}/min</Text>
        </View>
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaText}>⏱ {task.estimated_duration_minutes} min</Text>
        <Text style={styles.metaText}>👥 {task.application_count} applied</Text>
        <View style={styles.statusDot} />
        <Text style={[styles.metaText, styles.open]}>Open</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    marginBottom: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  left: { flex: 1, marginRight: 10 },
  right: { alignItems: 'flex-end', justifyContent: 'center' },
  tags: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  tag: { backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, fontWeight: '500' },
  title: { fontSize: 15, fontWeight: '600', color: '#111827' },
  location: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  pay: { fontSize: 20, fontWeight: '800', color: '#2563eb' },
  payRate: { fontSize: 10, color: '#9ca3af' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  metaText: { fontSize: 11, color: '#9ca3af' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16a34a', marginLeft: 'auto' },
  open: { color: '#16a34a', fontWeight: '600' },
})

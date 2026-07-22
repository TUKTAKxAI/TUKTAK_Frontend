import { apiRequest } from './client'

export function getNotifications(query) {
  return apiRequest('/api/v1/notifications', { query })
}

export function markNotificationRead(notificationId) {
  return apiRequest(`/api/v1/notifications/${notificationId}/read`, { method: 'PATCH' })
}

export function markAllNotificationsRead() {
  return apiRequest('/api/v1/notifications/read-all', { method: 'PATCH' })
}

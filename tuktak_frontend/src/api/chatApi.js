import { apiRequest, getAccessToken, getWebSocketBaseURL } from './client'

export function fetchChatRooms(query = {}) {
  return apiRequest('/chat/rooms', { query })
}

export function fetchChatMessages(chatRoomId, query = {}) {
  return apiRequest(`/chat/rooms/${chatRoomId}/messages`, { query })
}

export function markChatRoomRead(chatRoomId, lastReadMessageId) {
  return apiRequest(`/chat/rooms/${chatRoomId}/read`, {
    method: 'POST',
    body: { last_read_message_id: lastReadMessageId ?? null },
  })
}

export function createChatSocket(chatRoomId) {
  const token = getAccessToken()
  const url = new URL(`${getWebSocketBaseURL()}/ws/chat/rooms/${chatRoomId}`)
  if (token) url.searchParams.set('token', token)
  return new WebSocket(url.toString())
}

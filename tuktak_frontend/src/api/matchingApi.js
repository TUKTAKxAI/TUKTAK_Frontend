import { apiRequest } from './client'

export function createMatchingRequest(body) {
  return apiRequest('/api/v1/matching-requests', {
    method: 'POST',
    body,
  })
}

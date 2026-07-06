import { apiRequest } from './client'

export async function apiClient(endpoint, options = {}) {
  return apiRequest(endpoint, options)
}

export const api = {
  get: (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiClient(endpoint, {
    ...options,
    method: 'POST',
    body,
  }),
}

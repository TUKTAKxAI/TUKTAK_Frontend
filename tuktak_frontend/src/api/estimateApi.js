import { apiRequest } from './client'

export function getMyAiEstimates(query) {
  return apiRequest('/api/v1/users/me/ai-estimates', { query })
}

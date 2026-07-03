import { apiFormRequest, apiRequest } from './client'

export function getMyAiEstimates(query) {
  return apiRequest('/api/v1/users/me/ai-estimates', { query })
}

export function createAiEstimate(formData) {
  return apiFormRequest('/ai-estimates', formData)
}

export function getAiEstimate(estimateId) {
  return apiRequest(`/ai-estimates/${estimateId}`)
}

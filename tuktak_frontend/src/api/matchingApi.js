import { apiRequest } from './client'

export function createMatchingRequest(body) {
  return apiRequest('/api/v1/matching-requests', {
    method: 'POST',
    body,
  })
}

export function getMatchingRequests(query) {
  return apiRequest('/api/v1/matching-requests', { query })
}

export function getMatchingRequest(matchingRequestId) {
  return apiRequest(`/api/v1/matching-requests/${matchingRequestId}`)
}

export function getMatchingQuotes(matchingRequestId) {
  return apiRequest(`/api/v1/matching-requests/${matchingRequestId}/quotes`)
}

export function selectMatchingQuote(matchingRequestId, quoteId) {
  return apiRequest(`/api/v1/matching-requests/${matchingRequestId}/select-quote`, {
    method: 'POST',
    body: { quote_id: quoteId },
  })
}

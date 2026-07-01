import { apiRequest } from './client'

export function getContractorQuote(quoteId) {
  return apiRequest(`/api/v1/contractor-quotes/${quoteId}`)
}

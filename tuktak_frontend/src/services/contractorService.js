import {
  contractorActiveWork,
  contractorChats,
  contractorNotifications,
  contractorProfile,
  contractorQuotes,
  contractorRequests,
  contractorReviews,
  contractorWorkOrders,
} from '../data/contractorData'

const mockResponse = (data) => Promise.resolve(data)

export function fetchContractorMe() {
  return mockResponse(contractorProfile)
}

export function fetchContractorMatchingRequests() {
  return mockResponse(contractorRequests)
}

export function fetchContractorQuotes() {
  return mockResponse(contractorQuotes)
}

export function fetchContractorWorkOrders() {
  return mockResponse(contractorWorkOrders)
}

export function fetchContractorChats() {
  return mockResponse(contractorChats)
}

export function fetchContractorReviews() {
  return mockResponse(contractorReviews)
}

export function fetchContractorNotifications() {
  return mockResponse(contractorNotifications)
}

export function fetchContractorActiveWork() {
  return mockResponse(contractorActiveWork)
}

export function submitContractorQuote(payload) {
  return mockResponse({ quoteId: 'mock-quote-id', ...payload })
}

export function uploadBusinessLicenseMock(file) {
  return mockResponse({ fileName: file?.name ?? '', status: 'ready' })
}

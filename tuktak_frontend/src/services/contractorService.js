import { apiRequest } from '../api/client'

export function fetchContractorMe() {
  return apiRequest('/contractors/me').then((data) => data.contractor)
}

export function updateContractorAlertSettings(matchingAlertEnabled) {
  return apiRequest('/contractors/me/alert-settings', {
    method: 'PATCH',
    body: { matching_alert_enabled: matchingAlertEnabled },
  })
}

// 전문분야 선택 화면에서 사용할 전체 작업 항목 조회
export function fetchServiceTasks(query = {}) {
  return apiRequest('/service-tasks', { query }).then((data) => data.tasks || [])
}

// 지역 선택 화면에서 사용할 공통 코드 조회
export function fetchReferenceCodes(query = {}) {
  return apiRequest('/reference-codes', { query }).then((data) => data.codes || [])
}

// 가입/수정 시 저장된 시공자의 전문분야 + 작업지역 조합 조회
export function fetchContractorServices() {
  return apiRequest('/contractors/me/services').then((data) => data.services || [])
}

// 내 전문분야/내 지역 수정 결과 저장
export function updateContractorServices(services) {
  return apiRequest('/contractors/me/services', {
    method: 'PUT',
    body: { services },
  })
}

export function fetchContractorMatchingRequests(query = {}) {
  return apiRequest('/contractors/me/matching-requests', { query })
}

export function declineContractorMatchingRequest(matchingRequestId, declinedReason = '') {
  return apiRequest(`/contractors/me/matching-requests/${matchingRequestId}/decline`, {
    method: 'PATCH',
    body: { declined_reason: declinedReason || null },
  })
}

export function fetchContractorQuotes(query = {}) {
  return apiRequest('/contractors/me/quotes', { query })
}

export function fetchContractorQuote(quoteId) {
  return apiRequest(`/contractor-quotes/${quoteId}`).then((data) => data.quote)
}

export function deleteContractorQuote(quoteId) {
  return apiRequest(`/contractor-quotes/${quoteId}`, { method: 'DELETE' })
}

export function fetchContractorWorkOrders(query = {}) {
  return apiRequest('/work-orders', { query })
}

export function fetchContractorWorkOrder(workOrderId) {
  return apiRequest(`/work-orders/${workOrderId}`).then((data) => data.work_order)
}

export function startContractorWorkOrder(workOrderId) {
  return apiRequest(`/work-orders/${workOrderId}/start`, { method: 'PATCH' })
}

export function completeContractorWorkOrder(workOrderId) {
  return apiRequest(`/work-orders/${workOrderId}/complete`, { method: 'PATCH' })
}

export function submitContractorQuote(matchingRequestId, payload) {
  return apiRequest(`/matching-requests/${matchingRequestId}/quotes`, {
    method: 'POST',
    body: payload,
  })
}

export function uploadBusinessLicenseMock(file) {
  return Promise.resolve({ fileName: file?.name ?? '', status: 'ready' })
}

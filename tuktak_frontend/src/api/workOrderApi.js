import { apiRequest } from './client'

export function getWorkOrders(query) {
  return apiRequest('/api/v1/work-orders', { query })
}

export function getWorkOrder(workOrderId) {
  return apiRequest(`/api/v1/work-orders/${workOrderId}`)
}
     
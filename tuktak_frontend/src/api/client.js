import axios from 'axios'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'
const API_PREFIX = '/api/v1'

function getBaseURL() {
  const baseURL = RAW_API_BASE_URL.replace(/\/$/, '')
  return baseURL.endsWith(API_PREFIX) ? baseURL : `${baseURL}${API_PREFIX}`
}

function normalizePath(path = '') {
  const requestPath = String(path).startsWith('/') ? String(path) : `/${path}`
  return requestPath.startsWith(API_PREFIX)
    ? requestPath.slice(API_PREFIX.length) || '/'
    : requestPath
}

function normalizeError(error) {
  const data = error.response?.data
  const message = data?.detail || data?.message || data?.code || error.message || 'API request failed'
  const normalized = new Error(message)
  normalized.status = error.response?.status
  normalized.data = data
  return normalized
}

const client = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
})

client.interceptors.request.use((config) => ({
  ...config,
  url: normalizePath(config.url || ''),
}))

client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
)

export function hasAccessToken() {
  return true
}

export async function apiRequest(path, { method = 'GET', body, query, headers } = {}) {
  const response = await client.request({
    url: path,
    method,
    params: query,
    data: body,
    headers,
  })

  return response.data
}

export async function apiFormRequest(path, formData, options = {}) {
  return apiRequest(path, {
    ...options,
    method: options.method ?? 'POST',
    body: formData,
  })
}

export async function apiClient(endpoint, options = {}) {
  return apiRequest(endpoint, {
    method: options.method,
    body: options.body,
    headers: options.headers,
  })
}

export const api = {
  get: (endpoint, config = {}) => client.get(endpoint, config).then((response) => response.data),
  post: (endpoint, body, config = {}) => client.post(endpoint, body, config).then((response) => response.data),
  patch: (endpoint, body, config = {}) => client.patch(endpoint, body, config).then((response) => response.data),
  put: (endpoint, body, config = {}) => client.put(endpoint, body, config).then((response) => response.data),
  delete: (endpoint, config = {}) => client.delete(endpoint, config).then((response) => response.data),
}

export default client

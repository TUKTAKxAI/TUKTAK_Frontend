import axios from 'axios'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'
const API_PREFIX = '/api/v1'
const ACCESS_TOKEN_KEY = 'tuktak_access_token'
const REFRESH_TOKEN_KEY = 'tuktak_refresh_token'

function getStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export function getAccessToken() {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) || ''
}

export function getRefreshToken() {
  return getStorage()?.getItem(REFRESH_TOKEN_KEY) || ''
}

export function setAuthTokens(tokens = {}) {
  const storage = getStorage()
  if (!storage) return

  if (tokens.access_token) storage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
  if (tokens.refresh_token) storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
}

export function clearAuthTokens() {
  const storage = getStorage()
  if (!storage) return

  storage.removeItem(ACCESS_TOKEN_KEY)
  storage.removeItem(REFRESH_TOKEN_KEY)
}

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

client.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  const headers = {
    ...(config.headers || {}),
  }

  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  return {
    ...config,
    headers,
    url: normalizePath(config.url || ''),
  }
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const requestUrl = normalizePath(originalRequest?.url || '')
    const canRefresh =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh &&
      requestUrl !== '/auth/login' &&
      requestUrl !== '/auth/logout' &&
      requestUrl !== '/auth/refresh'

    if (canRefresh) {
      try {
        originalRequest._retry = true
        const refreshToken = getRefreshToken()
        if (!refreshToken) throw error

        const refreshResponse = await client.post(
          '/auth/refresh',
          { refresh_token: refreshToken },
          { _skipAuthRefresh: true },
        )
        setAuthTokens(refreshResponse.data)
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${refreshResponse.data.access_token}`,
        }
        return client.request(originalRequest)
      } catch {
        clearAuthTokens()
        // Fall through to the normalized original error.
      }
    }

    return Promise.reject(normalizeError(error))
  },
)

export function hasAccessToken() {
  return Boolean(readAccessToken())
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

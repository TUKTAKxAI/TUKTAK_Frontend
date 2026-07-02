const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const API_PREFIX = '/api/v1'

function getBaseUrl() {
  return RAW_API_BASE_URL.replace(/\/$/, '')
}

function normalizePath(path) {
  const requestPath = path.startsWith('/') ? path : `/${path}`
  return requestPath.startsWith(API_PREFIX) ? requestPath : `${API_PREFIX}${requestPath}`
}

function buildUrl(path, query) {
  const baseUrl = getBaseUrl()
  let requestPath = normalizePath(path)

  if (baseUrl.endsWith(API_PREFIX)) {
    requestPath = requestPath.slice(API_PREFIX.length) || '/'
  }

  const url = new URL(`${baseUrl}${requestPath}`, window.location.origin)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }

  return baseUrl ? url.toString() : `${url.pathname}${url.search}`
}

export function getAccessToken() {
  return null
}

export function getRefreshToken() {
  return null
}

export function hasAccessToken() {
  return true
}

export async function apiRequest(path, { method = 'GET', body, query, headers } = {}) {
  const requestHeaders = new Headers(headers)

  if (body && !(body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: requestHeaders,
    credentials: 'include',
    body: body instanceof FormData ? body : typeof body === 'string' ? body : body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || data?.code || `API request failed: ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export async function apiFormRequest(path, formData, options = {}) {
  return apiRequest(path, {
    ...options,
    method: options.method ?? 'POST',
    body: formData,
  })
}

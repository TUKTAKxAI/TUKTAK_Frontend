const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function getAccessToken() {
  return localStorage.getItem('access_token') || localStorage.getItem('accessToken')
}

function buildUrl(path, query) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }
  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`
}

export async function apiRequest(path, { method = 'GET', body, query, headers } = {}) {
  const token = getAccessToken()
  const requestHeaders = {
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: requestHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
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
    const error = new Error(data?.message || data?.code || 'API request failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

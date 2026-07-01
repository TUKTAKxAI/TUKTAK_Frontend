<<<<<<< HEAD
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
=======
// 백엔드 API 공통 설정 파일입니다.
// .env에 VITE_API_BASE_URL이 있으면 배포/개발 백엔드를 보고,
// 없으면 로컬 FastAPI 기본 주소인 http://localhost:8081/api/v1을 사용합니다.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api/v1'

// 로그인 API가 저장한 access token을 읽습니다.
// 팀원 코드에서 토큰 key 이름이 달라도 받아올 수 있게 3가지 이름을 허용합니다.
export function getAccessToken() {
  return (
    localStorage.getItem('access_token')
    ?? localStorage.getItem('accessToken')
    ?? localStorage.getItem('tuktak_access_token')
  )
}

// 로그아웃/토큰 재발급에 쓸 refresh token을 읽습니다.
export function getRefreshToken() {
  return (
    localStorage.getItem('refresh_token')
    ?? localStorage.getItem('refreshToken')
    ?? localStorage.getItem('tuktak_refresh_token')
  )
}

// 토큰이 없으면 아직 실제 백엔드 데이터를 볼 수 없는 상태입니다.
// 이때 마이페이지 API는 mock 데이터로 fallback합니다.
export function hasAccessToken() {
  return Boolean(getAccessToken())
}

// 마이페이지에서 백엔드로 요청할 때 쓰는 공통 fetch 함수입니다.
// 여기서 Authorization 헤더를 자동으로 붙이므로 화면 파일에서는 토큰을 직접 만지지 않아도 됩니다.
export async function apiRequest(path, options = {}) {
  const token = getAccessToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `API request failed: ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}

// PATCH /users/me 처럼 FormData를 보내야 하는 API에서 사용합니다.
export async function apiFormRequest(path, formData, options = {}) {
  return apiRequest(path, {
    ...options,
    method: options.method ?? 'POST',
    body: formData,
  })
>>>>>>> mypage
}

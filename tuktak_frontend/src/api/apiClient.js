const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function getBaseUrl() {
  return RAW_API_BASE_URL.replace(/\/$/, '')
}

export async function apiClient(endpoint, options = {}) {
  const baseUrl = getBaseUrl()
  const requestPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = baseUrl ? `${baseUrl}${requestPath}` : requestPath
  
  const config = {
    credentials: 'include', 
    ...options,
  };

  if (!(options.body instanceof FormData)) {
    config.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  const response = await fetch(url, config);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || 'API 요청에 실패했습니다.');
  }

  return data;
}

export const api = {
  get: (endpoint) => apiClient(endpoint, { method: 'GET' }),
  
  post: (endpoint, body) => apiClient(endpoint, { 
    method: 'POST', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
};

const BASE_URL = 'http://localhost:8081';

export async function apiClient(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
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
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.message || 'API 요청에 실패했습니다.');
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
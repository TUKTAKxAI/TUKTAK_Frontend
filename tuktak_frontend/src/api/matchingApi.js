import { apiRequest } from './client'

export function createMatchingRequest(body) {
  return apiRequest('/api/v1/matching-requests', {
    method: 'POST',
    body,
  })
}

let cachedRegionCodesPromise = null

// 매칭 가능 지역(REGION reference_codes) 목록. 백엔드 시드 데이터가 아직 서울 전역과
// 경기/인천 일부 지역만 커버하므로, 매칭 요청을 만들기 전에 프론트에서 먼저 걸러내기 위해 사용한다.
export function fetchSupportedRegionCodes() {
  if (!cachedRegionCodesPromise) {
    cachedRegionCodesPromise = apiRequest('/api/v1/reference-codes', {
      query: { code_group: 'REGION' },
    })
      .then((data) => data.codes || [])
      .catch(() => [])
  }
  return cachedRegionCodesPromise
}

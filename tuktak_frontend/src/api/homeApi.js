import { apiFormRequest, apiRequest, hasAccessToken } from './client'

export const defaultHomeAddress = {
  district: '관악구',
  title: '신림동 1458-31',
  detail: '서울특별시 관악구 관천로16길 22 (신림동)',
  zipNo: '',
  regionCodeId: null,
}

export const defaultNearbySummary = {
  contractorCount: 13,
}

export const defaultActiveWorkSummary = {
  hasActiveWork: false,
  activeCount: 0,
}

export function getDistrictFromAddress(address) {
  const match = String(address || '').match(/[가-힣]+구/)
  return match?.[0] ?? '주소'
}

export function mapJusoPayloadToHomeAddress(payload = {}) {
  const fullAddress = payload.roadFullAddr || [payload.roadAddrPart1, payload.addrDetail].filter(Boolean).join(' ')
  const title = payload.addrDetail || payload.roadAddrPart1 || fullAddress

  if (!fullAddress) return null

  return {
    district: getDistrictFromAddress(fullAddress),
    title,
    detail: fullAddress,
    zipNo: payload.zipNo || '',
    regionCodeId: payload.admCd || null,
  }
}

function getUserPayload(data = {}) {
  return data.user ?? data.data ?? data
}

function mapBackendAddress(address = {}) {
  const addressPayload = address.default_address_json || address
  const detail = addressPayload.address || addressPayload.roadFullAddr || addressPayload.road_addr || addressPayload.road_address || ''
  const title = addressPayload.address_detail || addressPayload.detail_address || addressPayload.addrDetail || addressPayload.title || ''

  if (!detail) return null

  return {
    district: getDistrictFromAddress(detail),
    title,
    detail,
    zipNo: addressPayload.zip_no || addressPayload.zipNo || '',
    regionCodeId: addressPayload.region_code_id || addressPayload.adm_cd || addressPayload.admCd || null,
  }
}

export async function fetchHomeAddress() {
  if (!hasAccessToken()) return defaultHomeAddress

  try {
    const data = await apiRequest('/users/me')
    return mapBackendAddress(getUserPayload(data)) || defaultHomeAddress
  } catch (error) {
    console.warn('home address fallback:', error)
    return defaultHomeAddress
  }
}

export async function saveHomeAddress(address) {
  if (!hasAccessToken()) return address

  const formData = new FormData()
  formData.append('default_address_json', JSON.stringify({
    address: address.detail || '',
    address_detail: address.title || '',
    zip_no: address.zipNo || '',
    region_code_id: address.regionCodeId || null,
  }))

  try {
    const data = await apiFormRequest('/users/me', formData, { method: 'PATCH' })
    return mapBackendAddress(getUserPayload(data)) || address
  } catch (error) {
    console.warn('home address save failed:', error)
    throw error
  }
}

// TODO: 백엔드 주변 시공자 API 확정 후 실제 경로로 교체합니다.
// 예상 후보: GET /contractors/nearby?region_code_id=...
export async function fetchNearbySummary(address) {
  if (!hasAccessToken() || !address?.regionCodeId) return defaultNearbySummary

  // The backend does not expose GET /contractors/nearby yet.
  // Avoid hitting /contractors/{contractor_id} with "nearby", which returns 422.
  return defaultNearbySummary

  // try {
  //   const data = await apiRequest('/contractors/nearby', {
  //     query: {
  //       region_code_id: address.regionCodeId,
  //     },
  //   })
  //
  //   return {
  //     contractorCount: data.contractor_count ?? data.count ?? defaultNearbySummary.contractorCount,
  //   }
  // } catch (error) {
  //   console.warn('nearby summary fallback:', error)
  //   return defaultNearbySummary
  // }
}

// 진행중 시공 요약: GET /api/v1/work-orders
// 매칭 히스토리와 같은 work-orders 데이터를 기준으로 홈의 진행중 건수를 계산합니다.
export async function fetchActiveWorkSummary() {
  if (!hasAccessToken()) return defaultActiveWorkSummary

  try {
    const data = await apiRequest('/work-orders', {
      query: {
        size: 100,
      },
    })

    const activeItems = (data.items ?? []).filter((item) => (
      !['COMPLETED', 'CANCELLED', '완료', '완료됨', '취소'].includes(item.work_order_status)
    ))

    return {
      hasActiveWork: activeItems.length > 0,
      activeCount: activeItems.length,
    }
  } catch (error) {
    console.warn('active work summary fallback:', error)
    return defaultActiveWorkSummary
  }
}

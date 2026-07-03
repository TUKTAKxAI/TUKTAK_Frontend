import { apiRequest, hasAccessToken } from './client'

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
  hasActiveWork: true,
  activeCount: 1,
}

function getDistrictFromAddress(address) {
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

function mapBackendAddress(address = {}) {
  const detail = address.address || address.roadFullAddr || address.road_addr || address.road_address || ''
  const title = address.address_detail || address.detail_address || address.addrDetail || address.title || detail

  if (!detail) return null

  return {
    addressId: address.address_id || address.id,
    district: getDistrictFromAddress(detail),
    title,
    detail,
    zipNo: address.zip_no || address.zipNo || '',
    regionCodeId: address.region_code_id || address.adm_cd || address.admCd || null,
  }
}

// TODO: 백엔드 주소 API 확정 후 실제 경로로 교체합니다.
// 예상 후보: GET /users/me, GET /users/me/addresses
export async function fetchHomeAddress() {
  if (!hasAccessToken()) return defaultHomeAddress

  try {
    const data = await apiRequest('/users/me/addresses')
    const address = data.items?.find((item) => item.is_default) || data.items?.[0]
    return mapBackendAddress(address) || defaultHomeAddress
  } catch (error) {
    console.warn('home address fallback:', error)
    return defaultHomeAddress
  }
}

// TODO: 백엔드 주소 저장 API 확정 후 실제 경로로 교체합니다.
// 예상 후보: POST /users/me/addresses, PATCH /users/me/addresses/{address_id}
export async function saveHomeAddress(address) {
  if (!hasAccessToken()) return address

  try {
    await apiRequest('/users/me/addresses', {
      method: 'POST',
      body: {
        address: address.detail,
        address_detail: address.title,
        zip_no: address.zipNo,
        region_code_id: address.regionCodeId,
        is_default: true,
      },
    })
  } catch (error) {
    console.warn('home address save pending:', error)
  }

  return address
}

// TODO: 백엔드 주변 시공자 API 확정 후 실제 경로로 교체합니다.
// 예상 후보: GET /contractors/nearby?region_code_id=...
export async function fetchNearbySummary(address) {
  if (!hasAccessToken() || !address?.regionCodeId) return defaultNearbySummary

  try {
    const data = await apiRequest('/contractors/nearby', {
      query: {
        region_code_id: address.regionCodeId,
      },
    })

    return {
      contractorCount: data.contractor_count ?? data.count ?? defaultNearbySummary.contractorCount,
    }
  } catch (error) {
    console.warn('nearby summary fallback:', error)
    return defaultNearbySummary
  }
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

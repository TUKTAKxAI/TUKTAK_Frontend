import { apiFormRequest, apiRequest, hasAccessToken } from './client'
import { estimateCards, historyCards } from '../data/customerData'

const defaultProfile = {
  nickname: '사용자',
  name: '사용자',
  email: '',
  phone: '',
  social: '연동 정보 없음',
  address: '주소를 등록해 주세요',
  payment: '결제 수단을 등록해 주세요',
}

function getFallbackProfile() {
  return {
    ...defaultProfile,
    userId: '',
  }
}

// 마이페이지 개발용 안전장치입니다. 백엔드 API가 아직 없거나 응답이 비어도 화면이 깨지지 않게 합니다.
// HttpOnly Cookie 인증은 JS에서 토큰을 읽을 수 없으므로 실제 API를 호출한 뒤 실패하면 fallback으로 내려갑니다.
function withMockFallback(request, fallback) {
  const fallbackValue = typeof fallback === 'function' ? fallback() : fallback

  if (!hasAccessToken()) return Promise.resolve(fallbackValue)

  return request().catch((error) => {
    console.warn('API fallback:', error)
    return fallbackValue
  })
}

// 백엔드 원본 날짜/금액을 마이페이지 화면에 맞는 형식으로 바꾸는 공통 포맷터입니다.
function formatDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '0'
  return Number(value).toLocaleString('ko-KR')
}

// GET /users/me/ai-estimates 목록 응답을 내 AI 견적서 카드 화면용 데이터로 변환합니다.
function mapEstimateListItem(item) {
  const minPrice = item.min_price ?? 0
  const maxPrice = item.max_price ?? minPrice
  const price = Math.round((Number(minPrice) + Number(maxPrice)) / 2)

  return {
    id: item.estimate_id,
    date: formatDate(item.created_at),
    status: item.estimate_status,
    title: `${item.repair_task_name || item.main_category || 'AI'} 견적서`,
    subtitle: `예상 비용 : ${formatMoney(price)}`,
    price,
    details: {
      location: item.main_category ?? '확인 필요',
      request: item.repair_task_name ?? 'AI 분석 결과 확인 필요',
      estimatedTime: '상세에서 확인',
      summary: `신뢰도 ${item.confidence_score ?? '-'} 기준으로 생성된 AI 견적입니다.`,
    },
  }
}

// GET /ai-estimates/{estimate_id} 상세 응답을 AI 견적서 상세 모달용 데이터로 변환합니다.
function mapEstimateDetail(estimate) {
  const minPrice = estimate.min_price ?? 0
  const maxPrice = estimate.max_price ?? minPrice
  const price = Math.round((Number(minPrice) + Number(maxPrice)) / 2)
  const minMinutes = estimate.estimated_minutes_min ?? 0
  const maxMinutes = estimate.estimated_minutes_max ?? minMinutes

  return {
    id: estimate.estimate_id,
    date: formatDate(estimate.created_at),
    status: estimate.estimate_status,
    title: `${estimate.repair_task_name || estimate.main_category || 'AI'} 견적서`,
    subtitle: `예상 비용 : ${formatMoney(price)}`,
    price,
    details: {
      location: estimate.main_category ?? '확인 필요',
      request: estimate.description ?? estimate.repair_task_name ?? '요청 내용 없음',
      estimatedTime: `${minMinutes}~${maxMinutes}분`,
      summary: estimate.ai_summary ?? 'AI 견적 상세 내용입니다.',
    },
  }
}

// GET /work-orders 목록 응답을 매칭 히스토리 카드 화면용 데이터로 변환합니다.
function mapWorkOrder(item) {
  const status = item.work_order_status === 'COMPLETED' ? '완료됨' : '진행중'

  return {
    id: item.work_order_id,
    date: formatDate(item.created_at),
    status,
    title: item.matching_request_title ?? '시공 건',
    cost: `확정 시공 비용 : ${formatMoney(item.final_amount)}`,
    partner: `담당 파트너 : ${item.contractor_name ?? '확인 필요'}`,
    schedule: `시공 예정일 : ${formatDate(item.scheduled_date) || '미정'}`,
    reviewable: Boolean(item.can_review),
    details: {
      request: [
        ['요청명', item.matching_request_title ?? '확인 필요'],
        ['매칭 요청 ID', String(item.matching_request_id)],
        ['견적 ID', String(item.quote_id)],
      ],
      work: [
        ['시공 상태', item.work_order_status],
        ['확정 금액', formatMoney(item.final_amount)],
        ['시공 예정일', formatDate(item.scheduled_date) || '미정'],
      ],
      partnerInfo: [
        ['파트너명', item.contractor_name ?? '확인 필요'],
        ['파트너 ID', String(item.contractor_id)],
        ['리뷰 가능 여부', item.can_review ? '가능' : '불가'],
      ],
    },
  }
}

// 매칭 히스토리 목록: GET /api/v1/work-orders
export async function fetchMatchingHistory() {
  return withMockFallback(
    async () => {
      const data = await apiRequest('/work-orders')
      return (data.items ?? []).map(mapWorkOrder)
    },
    historyCards,
  )
}

// 내 정보 조회: GET /api/v1/users/me
export async function fetchMyProfile() {
  return withMockFallback(
    async () => {
      const data = await apiRequest('/users/me')
      const user = data.user ?? data

      return {
        ...getFallbackProfile(),
        nickname: user.nickname ?? user.name ?? getFallbackProfile().nickname,
        name: user.name ?? user.nickname ?? getFallbackProfile().name,
        email: user.email ?? getFallbackProfile().email,
        phone: user.phone ?? '',
        userId: user.user_id ? `USER-${user.user_id}` : getFallbackProfile().userId,
      }
    },
    getFallbackProfile,
  )
}

// 내 정보 수정: PATCH /api/v1/users/me
// 현재 백엔드가 FormData를 받기 때문에 FormData로 전송합니다.
export async function updateMyProfile(fieldKey, value) {
  const backendFieldMap = {
    nickname: 'nickname',
    name: 'name',
    phone: 'phone',
  }
  const backendField = backendFieldMap[fieldKey]

  if (!backendField) {
    return { [fieldKey]: value }
  }

  const formData = new FormData()
  formData.append(backendField, value)

  try {
    const data = await apiFormRequest('/users/me', formData, { method: 'PATCH' })
    return data.user ?? data
  } catch (error) {
    console.warn('Profile update fallback:', error)
    return { [fieldKey]: value }
  }
}

// 내 AI 견적서 목록: GET /api/v1/users/me/ai-estimates
export async function fetchMyAiEstimates() {
  return withMockFallback(
    async () => {
      const data = await apiRequest('/users/me/ai-estimates?size=100')
      return (data.items ?? []).map(mapEstimateListItem)
    },
    estimateCards,
  )
}

// AI 견적서 상세: GET /api/v1/ai-estimates/{estimate_id}
export async function fetchAiEstimateDetail(estimateId) {
  const fallback = estimateCards.find((item) => String(item.id) === String(estimateId)) ?? estimateCards[0]

  return withMockFallback(
    async () => {
      const data = await apiRequest(`/ai-estimates/${estimateId}`)
      return mapEstimateDetail(data.estimate)
    },
    fallback,
  )
}


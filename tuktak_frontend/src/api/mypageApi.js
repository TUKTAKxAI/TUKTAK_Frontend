import { apiFormRequest, apiRequest, getRefreshToken, hasAccessToken } from './client'
import { estimateCards, historyCards, riskCards } from '../data/customerData'

const fallbackProfile = {
  nickname: '전지원',
  name: '전지원',
  email: 'abcd123@gmail.com',
  phone: '010-1234-5678',
  social: '카카오 연동됨',
  address: '서울시 종로구 인사동길',
  payment: '신한카드 **** 1234',
}

// 마이페이지 개발용 안전장치입니다.
// 로그인 토큰이 아직 없거나 백엔드가 준비되지 않은 경우 화면이 깨지지 않도록 mock 데이터를 보여줍니다.
// 실제 백엔드 연결 테스트 때는 로그인 API로 access token이 localStorage에 저장되어야 request가 실행됩니다.
function withMockFallback(request, fallback) {
  if (!hasAccessToken()) return Promise.resolve(fallback)

  return request().catch((error) => {
    console.warn('API fallback:', error)
    return fallback
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

// risk report 상세 응답이 { report } 또는 바로 report 객체로 와도 처리할 수 있게 맞춥니다.
function getReportPayload(data) {
  return data.report ?? data.risk_report ?? data
}

// 백엔드 dev와 로컬 risk 브랜치의 필드명이 다를 수 있어서 둘 다 허용합니다.
function getRiskArray(report, baseKey, jsonKey) {
  const value = report[baseKey] ?? report[jsonKey] ?? []
  return Array.isArray(value) ? value : []
}

// 리스크리포트 만료 정책: 생성일 기준 한 달 뒤 만료입니다.
function getRiskExpiry(createdAt) {
  if (!createdAt) return { isExpired: false, expireLabel: '30일 뒤 만료' }

  const createdDate = new Date(createdAt)
  if (Number.isNaN(createdDate.getTime())) return { isExpired: false, expireLabel: '30일 뒤 만료' }

  const expiresAt = new Date(createdDate)
  expiresAt.setMonth(expiresAt.getMonth() + 1)

  const today = new Date()
  const diffDays = Math.ceil((expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return { isExpired: true, expireLabel: '만료됨' }
  return { isExpired: false, expireLabel: `${diffDays}일 뒤 만료` }
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

// GET /risk-reports 목록 응답을 내 리스크리포트 카드 화면용 데이터로 변환합니다.
function mapRiskListItem(item) {
  const expiry = getRiskExpiry(item.created_at)

  return {
    id: item.risk_report_id,
    riskReportId: item.risk_report_id,
    estimateId: item.estimate_id,
    date: formatDate(item.created_at),
    createdAt: item.created_at,
    title: item.title ?? item.repair_task_name ?? `견적서 ${item.estimate_id} 리스크`,
    estimatePrice: '예상 비용 : 상세 확인',
    riskScore: item.risk_score ?? 0,
    riskLevel: item.risk_level ?? item.report_status,
    reportStatus: item.report_status,
    summary: item.summary ?? '리스크 리포트가 생성 중이거나 요약이 없습니다.',
    items: [],
    checklist: [],
    pdfUrl: item.pdf_url,
    ...expiry,
  }
}

// GET /risk-reports/{risk_report_id} 상세 응답을 리스크리포트 상세 화면/모달용 데이터로 변환합니다.
function mapRiskDetail(report) {
  const expiry = getRiskExpiry(report.created_at)
  const riskItems = getRiskArray(report, 'risk_items', 'risk_items_json')
  const checklist = getRiskArray(report, 'checklist', 'checklist_json')

  return {
    id: report.risk_report_id,
    riskReportId: report.risk_report_id,
    estimateId: report.estimate_id,
    date: formatDate(report.created_at),
    createdAt: report.created_at,
    title: report.title ?? report.repair_task_name ?? `견적서 ${report.estimate_id} 리스크`,
    estimatePrice: '예상 비용 : 상세 확인',
    riskScore: report.risk_score ?? 0,
    riskLevel: report.risk_level ?? report.report_status,
    reportStatus: report.report_status,
    summary: report.summary ?? '리스크 리포트 상세 내용입니다.',
    items: riskItems.map((item) => item.title ?? item.summary ?? item.content ?? JSON.stringify(item)),
    checklist: checklist.map((item) => item.title ?? item.content ?? item.summary ?? JSON.stringify(item)),
    pdfUrl: report.pdf_url,
    ...expiry,
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
      return {
        ...fallbackProfile,
        nickname: data.user.nickname,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone ?? '',
      }
    },
    fallbackProfile,
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

  if (!backendField || !hasAccessToken()) {
    return { [fieldKey]: value }
  }

  const formData = new FormData()
  formData.append(backendField, value)
  const data = await apiFormRequest('/users/me', formData, { method: 'PATCH' })
  return data.user
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

// 내 리스크리포트 목록: GET /api/v1/risk-reports
export async function fetchMyRiskReports() {
  return withMockFallback(
    async () => {
      const data = await apiRequest('/risk-reports?size=100')
      return (data.items ?? []).map(mapRiskListItem)
    },
    riskCards,
  )
}

// 리스크리포트 상세: GET /api/v1/risk-reports/{risk_report_id}
export async function fetchRiskReportDetail(riskReportId) {
  const fallback = riskCards.find((item) => String(item.id) === String(riskReportId)) ?? riskCards[0]

  return withMockFallback(
    async () => {
      const data = await apiRequest(`/risk-reports/${riskReportId}`)
      return mapRiskDetail(getReportPayload(data))
    },
    fallback,
  )
}

// 리스크리포트 생성: POST /api/v1/risk-reports
// AI 견적서가 DB에 저장된 뒤 estimate_id를 넘겨 리스크리포트를 생성합니다.
export async function createRiskReport(estimateId) {
  if (!hasAccessToken()) {
    return {
      riskReportId: riskCards[0].id,
      report: riskCards[0],
    }
  }

  const data = await apiRequest('/risk-reports', {
    method: 'POST',
    body: JSON.stringify({ estimate_id: estimateId }),
  })
  const report = getReportPayload(data)

  return {
    riskReportId: data.risk_report_id ?? report.risk_report_id,
    report: report.risk_report_id ? mapRiskDetail(report) : null,
  }
}

// 로그아웃: POST /api/v1/auth/logout
export async function logout() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return

  await apiRequest('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

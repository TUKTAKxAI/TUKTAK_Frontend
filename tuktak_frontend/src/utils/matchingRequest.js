// 일반 매칭("매칭 시작하기")과 긴급 매칭(UrgentModal 확인) 양쪽에서 공유하는
// 매칭 요청 생성 바디 빌더. 예전에는 두 곳에 각각 따로 구현돼 있다가
// service_task_id 필드가 한쪽에서만 누락되는 식으로 드리프트가 생겨서 하나로 합침.
export function estimateTitle(estimate) {
  return estimate?.repair_task_name || estimate?.title || '견적 정보 없음'
}

export function buildMatchingRequestBody({ estimate, address, schedule, isEmergency }) {
  const fullAddress = [address.address, address.address_detail]
    .filter(Boolean)
    .join(' ')

  return {
    estimate_id: estimate.estimate_id,
    service_task_id: estimate.service_task_id || estimate.serviceTaskId || estimate.task_id || estimate.taskId || null,
    title: estimateTitle(estimate),
    region_code_id: address.region_code_id,
    address: fullAddress,
    preferred_date: schedule.preferred_date,
    preferred_time_start: isEmergency ? undefined : schedule.preferred_time_start,
    preferred_time_end: isEmergency ? undefined : schedule.preferred_time_end,
    budget_min: estimate.min_price,
    budget_max: estimate.max_price,
    request_message: '',
    privacy_settings: {},
    is_emergency: isEmergency,
  }
}

// 백엔드 _resolve_region_code_id(app/services/matching_request.py)와 동일한 우선순위
// (정확 일치 → 5자리 시군구 접두 → 2자리 시도 접두)로 지원 지역 여부를 판별하는 순수 함수.
// regionCodes를 못 불러온 경우(빈 배열)에는 굳이 사용자를 막지 않도록 fail-open으로 처리한다.
export function isRegionCodeSupported(admCd, regionCodes) {
  if (!admCd) return false
  if (!Array.isArray(regionCodes) || regionCodes.length === 0) return true

  const raw = String(admCd)
  const codes = new Set(regionCodes.map((item) => item.code))

  return codes.has(raw) || codes.has(raw.slice(0, 5)) || codes.has(raw.slice(0, 2))
}

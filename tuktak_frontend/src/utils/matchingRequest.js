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

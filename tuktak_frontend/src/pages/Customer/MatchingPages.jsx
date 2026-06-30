import { useEffect, useState } from 'react'
import { getMyAiEstimates } from '../../api/estimateApi'
import { hasJusoSearchKey, searchJusoAddresses } from '../../api/jusoApi'
import { createMatchingRequest, getMatchingQuotes, selectMatchingQuote } from '../../api/matchingApi'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { Avatar, PrimaryButton } from '../../components/customer/FormControls'
import { useCustomerFlow } from '../../context/CustomerFlowContext'
import { screens } from '../../data/customerData'
import { mockMatchingAddress, mockMatchingEstimates, mockMatchingQuotes, mockMatchingRequest, useMatchingMocks } from '../../data/matchingMockData'
import confirmImage from '../../assets/confirm.svg'
import './MatchingPages.css'

const timeSlots = [
  { start: '09:00', end: '12:00' },
  { start: '12:00', end: '15:00' },
  { start: '15:00', end: '18:00' },
  { start: '18:00', end: '21:00' },
]

function todayString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(value) {
  return value ? String(value).slice(0, 10) : todayString()
}

function formatWon(value) {
  if (value === undefined || value === null || value === '') return ''
  return `${Number(value).toLocaleString('ko-KR')}원`
}

function estimateTitle(estimate) {
  return estimate?.repair_task_name || estimate?.title || '견적 정보 없음'
}

function estimateCost(estimate) {
  if (estimate?.min_price && estimate?.max_price) return `${formatWon(estimate.min_price)} ~ ${formatWon(estimate.max_price)}`
  if (estimate?.max_price) return formatWon(estimate.max_price)
  if (estimate?.min_price) return formatWon(estimate.min_price)
  return '비용 정보 없음'
}

function buildMatchingRequestBody({ estimate, address, schedule, isEmergency }) {
  return {
    estimate_id: estimate.estimate_id,
    title: estimateTitle(estimate),
    region_code_id: address.region_code_id,
    address: address.address,
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

function normalizeJusoPayload(payload) {
  const nestedPayload = payload.juso || payload.results || payload.data
  const parsedPayload = typeof nestedPayload === 'string' ? JSON.parse(nestedPayload) : nestedPayload
  const source = Array.isArray(parsedPayload?.juso) ? parsedPayload.juso[0] : parsedPayload || payload
  const roadAddress = source.roadFullAddr || source.roadAddr || source.roadAddrPart1 || source.address || source.addr || ''
  const detailAddress = source.addrDetail || source.detailAddress || ''
  const fullAddress = source.roadFullAddr || [roadAddress, detailAddress].filter(Boolean).join(' ')

  return {
    ...source,
    fullAddress,
    roadAddress,
    detailAddress,
  }
}

function jusoResultToAddress(result) {
  const fullAddress = result.roadAddr || result.roadAddrPart1 || result.jibunAddr || ''

  return {
    address_id: result.bdMgtSn || result.rnMgtSn || Date.now(),
    region_code_id: result.admCd || null,
    address: fullAddress,
    base_address: fullAddress,
    road_addr_part1: result.roadAddrPart1 || result.roadAddr || '',
    address_detail: '',
    zip_no: result.zipNo || '',
    adm_cd: result.admCd || '',
    label: fullAddress,
    jibun_addr: result.jibunAddr || '',
  }
}

function buildMatchingHistoryRecord(flow, partner, data = {}) {
  const matchingRequestId = flow.matchingFlow.matchingRequestId || data.matching_request_id || `matching-${Date.now()}`

  return {
    id: `${matchingRequestId}-${partner.quote_id}-${Date.now()}`,
    matchingRequestId,
    selectedQuoteId: data.selected_quote_id || partner.quote_id,
    workOrderId: data.work_order_id || 'mock-work-order-001',
    matchingStatus: '시공 예정',
    estimate: flow.matchingFlow.selectedEstimate,
    address: flow.matchingFlow.selectedAddress,
    schedule: flow.matchingFlow.schedule,
    partner,
    createdAt: new Date().toISOString(),
  }
}

function quoteToPartner(quote, index) {
  return {
    quote_id: quote.quote_id,
    contractor: {
      contractor_id: quote.contractor?.contractor_id,
      business_name: quote.contractor?.business_name || `파트너 ${index + 1}`,
      rating_avg: quote.contractor?.rating_avg || 0,
      review_count: quote.contractor?.review_count || 0,
      profile_image_url: quote.contractor?.profile_image_url || '',
      phone: quote.contractor?.phone || '안심번호 준비중',
      business_address: quote.contractor?.business_address || '주소 정보 준비중',
    },
    specialty: quote.work_scope || '전문 분야 확인중',
    career: quote.contractor?.career || '-',
    total_amount: quote.total_amount,
    work_scope: quote.work_scope || '상세 작업 범위 확인중',
    estimated_minutes: quote.estimated_minutes,
    available_date: quote.available_date,
    arrival_time: quote.arrival_time || quote.available_time || '협의',
    additional_note: quote.additional_note || '추가 상세 내용이 없습니다.',
    reviews: [],
    avatar: index === 0 ? 'light' : index === 1 ? 'blue' : 'plain',
    highlight: '',
  }
}

function isMockId(id) {
  return !id
}

function toMinutes(time) {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

function isSlotSelectable(date, slot) {
  if (date > todayString()) return true
  if (date < todayString()) return false

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const start = toMinutes(slot.start)
  const end = toMinutes(slot.end)
  const midpoint = start + (end - start) / 2

  if (currentMinutes < start) return true
  return currentMinutes >= start && currentMinutes <= midpoint
}

function estimateMinutesLabel(minutes) {
  if (!minutes) return '약 3시간'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `약 ${hours}시간 ${rest}분` : `약 ${hours}시간`
}

function PartnerStars({ rating }) {
  const rounded = Math.round(rating)
  return (
    <span className="partner-stars">
      {'★'.repeat(rounded)}
      {'☆'.repeat(5 - rounded)}
      <em>{rating}/5</em>
    </span>
  )
}

function MatchingStatusBadge({ status }) {
  return <span className="matching-status-badge">{status}</span>
}

function PartnerCard({ partner, onOpenProposal, onOpenProfile }) {
  return (
    <article className="partner-bid-card matching-partner-card">
      <button className="partner-avatar-button" type="button" onClick={() => onOpenProfile(partner)} aria-label="파트너 프로필 보기">
        <Avatar tone={partner.avatar} />
      </button>
      <button className="partner-card-body" type="button" onClick={() => onOpenProposal(partner)}>
        <div className="partner-bid-head">
          <strong>{partner.contractor.business_name}</strong>
          <PartnerStars rating={partner.contractor.rating_avg} />
        </div>
        <p>{partner.specialty} / 경력 {partner.career}</p>
        <p>제안 시공 금액 : {formatWon(partner.total_amount)}</p>
        <p>예상 소요 시간 : {estimateMinutesLabel(partner.estimated_minutes)}</p>
        <small>방문 가능 시간 : {partner.available_date} {partner.arrival_time}</small>
      </button>
      {partner.highlight ? <em>{partner.highlight}</em> : null}
    </article>
  )
}

function ProposalModal({ partner, onClose, onSelect, isSelecting }) {
  if (!partner) return null

  return (
    <div className="modal-overlay matching-modal-overlay">
      <div className="modal-card proposal-modal-card">
        <button className="modal-close-button" type="button" onClick={onClose}>×</button>
        <div className="partner-profile-card">
          <Avatar tone={partner.avatar} />
          <div>
            <strong>{partner.contractor.business_name}</strong>
            <PartnerStars rating={partner.contractor.rating_avg} />
            <p>{partner.specialty} / 경력 {partner.career}</p>
            <p>{partner.contractor.phone}</p>
          </div>
        </div>
        <h3>제안 시공 금액 : {formatWon(partner.total_amount)}</h3>
        <div className="proposal-detail-list">
          <p>예상 소요 시간 : {estimateMinutesLabel(partner.estimated_minutes)}</p>
          <p>확정 방문 시간 : {partner.arrival_time}</p>
          <p>확정 시공일 : {partner.available_date}</p>
          <p>{partner.additional_note}</p>
        </div>
        <PrimaryButton narrow onClick={() => onSelect(partner)}>{isSelecting ? '선택중...' : '파트너 선택하기'}</PrimaryButton>
      </div>
    </div>
  )
}

function ProfileModal({ partner, onClose, onChat }) {
  const [visibleCount, setVisibleCount] = useState(5)
  if (!partner) return null

  const reviews = partner.reviews || []
  const visibleReviews = reviews.slice(0, visibleCount)

  return (
    <div className="modal-overlay matching-modal-overlay">
      <div className="modal-card profile-modal-card">
        <button className="modal-close-button" type="button" onClick={onClose}>×</button>
        <div className="partner-info-top">
          <Avatar tone={partner.avatar} />
          <div>
            <strong>{partner.contractor.business_name}</strong>
            <PartnerStars rating={partner.contractor.rating_avg} />
            <p>대표 번호 : {partner.contractor.phone}</p>
            <p>전문 / 시공 분야 : {partner.specialty}</p>
            <p>경력 사항 : {partner.career}</p>
            <p>주소지 : {partner.contractor.business_address}</p>
          </div>
        </div>
        <div className="partner-review-box">
          <small>최근리뷰</small>
          {visibleReviews.length ? visibleReviews.map((review, index) => (
            <div className="partner-mini-review" key={`${partner.quote_id}-${index}`}>
              작성자 : 고객 {index + 1} ★★★★★ 5/5<br />
              {review}
            </div>
          )) : <div className="partner-mini-review">아직 표시할 리뷰가 없습니다.</div>}
        </div>
        {reviews.length > visibleCount ? (
          <button className="mini-primary review-more-button" type="button" onClick={() => setVisibleCount((count) => count + 5)}>더보기</button>
        ) : null}
        {onChat ? <PrimaryButton narrow onClick={onChat}>1:1 채팅 상담</PrimaryButton> : null}
      </div>
    </div>
  )
}

function AddressSearchResultModal({ results, onClose, onSelect }) {
  return (
    <div className="modal-overlay matching-modal-overlay">
      <div className="modal-card address-result-modal-card">
        <button className="modal-close-button" type="button" onClick={onClose}>×</button>
        <h3>주소 검색 결과</h3>
        <div className="address-result-list">
          {results.map((result) => (
            <button
              className="address-result-item"
              key={`${result.bdMgtSn}-${result.zipNo}`}
              type="button"
              onClick={() => onSelect(result)}
            >
              <strong>{result.roadAddr}</strong>
              {result.jibunAddr ? <span>{result.jibunAddr}</span> : null}
              {result.zipNo ? <small>우편번호 {result.zipNo}</small> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function PartnerSelectConfirmModal({ partner, onClose, onConfirm, isSelecting }) {
  if (!partner) return null

  return (
    <div className="modal-overlay matching-modal-overlay">
      <div className="modal-card matching-confirm-modal-card">
        <button className="modal-close-button" type="button" onClick={onClose}>×</button>
        <div className="modal-icon">!</div>
        <h3>{partner.contractor.business_name}를 선택할까요?</h3>
        <p>선택하면 해당 파트너와 시공이 확정되고 현재 매칭 화면으로 이동합니다.</p>
        <div className="button-row">
          <PrimaryButton orange onClick={onClose}>취소</PrimaryButton>
          <PrimaryButton onClick={onConfirm}>{isSelecting ? '선택중...' : '파트너 선택'}</PrimaryButton>
        </div>
      </div>
    </div>
  )
}

function MatchingCompleteModal({ partner, onConfirm }) {
  if (!partner) return null

  return (
    <div className="modal-overlay matching-modal-overlay">
      <div className="modal-card matching-confirm-modal-card matching-complete-modal-card">
        <img className="matching-complete-image" src={confirmImage} alt="" />
        <h3>매칭이 성사됐어요</h3>
        <p>{partner.contractor.business_name} 파트너와 시공이 확정되었습니다.</p>
        <PrimaryButton narrow onClick={onConfirm}>확인</PrimaryButton>
      </div>
    </div>
  )
}

export function MatchingHomePage({ go }) {
  const flow = useCustomerFlow()

  if (flow.matchingFlow.hasCompletedMatching) {
    return <MatchingDonePage go={go} />
  }

  return (
    <section className="service-hero">
      <CustomerTopBar go={go} />
      <h1>매칭 서비스</h1>
      <h2>근처 최고의 시공 업자와 매칭해보세요</h2>
      <p>AI 견적서, 지역 기반으로 근처 최고의 시공 업자와 매칭해드립니다</p>
      <div className="service-shot-row">
        <div className="phone-shot first match" />
        <div className="phone-shot second match" />
        <div className="phone-shot fourth match" />
      </div>
      <div className="dot-row"><span className="active dim" /><span /><span /><span className="active dim" /></div>
      <PrimaryButton narrow onClick={() => go(screens.matchingEstimateSelect)}>매칭 시작하기</PrimaryButton>
    </section>
  )
}

export function MatchingEstimateSelectPage({ go }) {
  const flow = useCustomerFlow()
  const [estimates, setEstimates] = useState([])
  const [loadStatus, setLoadStatus] = useState('loading')

  useEffect(() => {
    let ignore = false

    getMyAiEstimates({ status: 'COMPLETED', page: 0, size: 20 })
      .then((data) => {
        if (ignore) return
        if (data?.items?.length) {
          setEstimates(data.items)
          setLoadStatus('loaded')
        } else if (useMatchingMocks) {
          setEstimates(mockMatchingEstimates)
          setLoadStatus('loaded')
        } else {
          setLoadStatus('empty')
        }
      })
      .catch(() => {
        if (!ignore) {
          if (useMatchingMocks) {
            setEstimates(mockMatchingEstimates)
            setLoadStatus('loaded')
          } else {
            setEstimates([])
            setLoadStatus('error')
          }
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const selectEstimate = (estimate) => {
    flow.updateMatchingFlow({ selectedEstimate: estimate })
    go(screens.matchingAddressList)
  }

  return (
    <section className="selection-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.matchingHome)}>‹</button>
      <h2>AI 견적서를 선택해주세요</h2>
      {loadStatus === 'loading' ? <p className="muted center">AI 견적서를 불러오는 중입니다.</p> : null}
      {loadStatus === 'error' ? <p className="muted center">AI 견적서를 불러오지 못했습니다. 로그인 상태와 서버 연결을 확인해주세요.</p> : null}
      {loadStatus === 'empty' ? <p className="muted center">완료된 AI 견적서가 아직 없어요.</p> : null}
      <div className="list-stack">
        {estimates.map((estimate) => (
          <article className="record-card estimate-card large" key={estimate.estimate_id}>
            <div className="record-side">
              <span>{formatDate(estimate.created_at)}</span>
              <small>{estimate.estimate_status}</small>
            </div>
            <div className="record-main">
              <h3>{estimateTitle(estimate)}</h3>
              <p>예상 시공 비용 : {estimateCost(estimate)}</p>
              <button className="wide-action" onClick={() => selectEstimate(estimate)}>매칭 요청하기</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function MatchingAddressListPage({ go }) {
  const flow = useCustomerFlow()
  const { updateMatchingFlow } = flow
  const selectedAddress = flow.matchingFlow.selectedAddress
  const [keyword, setKeyword] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchStatus, setSearchStatus] = useState('idle')
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'TUKTAK_JUSO_SELECTED') return

      const payload = event.data.payload || {}
      let addressPayload

      try {
        addressPayload = normalizeJusoPayload(payload)
      } catch {
        addressPayload = { fullAddress: '' }
      }

      if (!addressPayload.fullAddress) {
        setError('주소 정보를 받아오지 못했습니다. 다시 검색해주세요.')
        return
      }

      setError('')
      updateMatchingFlow({
        selectedAddress: {
          address_id: addressPayload.bdMgtSn || Date.now(),
          region_code_id: addressPayload.admCd || null,
          address: addressPayload.fullAddress,
          base_address: addressPayload.fullAddress,
          road_addr_part1: addressPayload.roadAddrPart1 || addressPayload.roadAddress || '',
          address_detail: addressPayload.addrDetail || addressPayload.detailAddress || '',
          zip_no: addressPayload.zipNo || '',
          adm_cd: addressPayload.admCd || '',
          label: addressPayload.fullAddress,
        },
      })
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [updateMatchingFlow])

  const searchAddress = async () => {
    const trimmedKeyword = keyword.trim()

    if (!hasJusoSearchKey()) {
      setError('.env에 VITE_JUSO_SEARCH_KEY 또는 VITE_JUSO_CONFIRM_KEY를 설정한 뒤 다시 실행해주세요.')
      return
    }
    if (trimmedKeyword.length < 2) {
      setError('주소 검색어를 2글자 이상 입력해주세요.')
      return
    }

    setError('')
    setSearchStatus('loading')

    try {
      const data = await searchJusoAddresses({ keyword: trimmedKeyword })
      setSearchResults(data.items)
      setSearchStatus(data.items.length ? 'loaded' : 'empty')
      setIsResultModalOpen(data.items.length > 0)
    } catch (searchError) {
      setSearchResults([])
      setSearchStatus('error')
      setIsResultModalOpen(false)
      setError(searchError.message || '주소 검색에 실패했습니다. 검색어와 API 키를 확인해주세요.')
    }
  }

  const selectSearchResult = (result) => {
    setError('')
    setIsResultModalOpen(false)
    updateMatchingFlow({
      selectedAddress: jusoResultToAddress(result),
    })
  }

  const updateAddressDetail = (detail) => {
    updateMatchingFlow((current) => {
      const currentAddress = current.selectedAddress
      if (!currentAddress) return current

      const baseAddress = currentAddress.base_address || currentAddress.road_addr_part1 || currentAddress.address || ''
      const trimmedDetail = detail.trim()

      return {
        selectedAddress: {
          ...currentAddress,
          base_address: baseAddress,
          address_detail: detail,
          address: trimmedDetail ? `${baseAddress}, ${trimmedDetail}` : baseAddress,
          label: trimmedDetail ? `${baseAddress}, ${trimmedDetail}` : baseAddress,
        },
      }
    })
  }

  const clearAddress = () => {
    updateMatchingFlow({
      selectedAddress: null,
    })
  }

  const selectMockAddress = () => {
    setError('')
    updateMatchingFlow({
      selectedAddress: mockMatchingAddress,
    })
  }

  const goNextSchedule = () => {
    if (!selectedAddress) {
      setError('주소를 먼저 선택해주세요.')
      return
    }
    if (!selectedAddress.address_detail?.trim()) {
      setError('상세 주소를 입력해주세요.')
      return
    }

    setError('')
    go(screens.matchingSchedule)
  }

  return (
    <section className="selection-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.matchingEstimateSelect)}>‹</button>
      <p className="small-copy">시공 지역을 알려주세요 !</p>
      <h1>내 주소목록</h1>
      <div className="matching-inline-editor">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') searchAddress()
          }}
          placeholder="도로명, 건물명, 지번을 입력해주세요"
        />
        <button className="wide-action" type="button" onClick={searchAddress}>
          {searchStatus === 'loading' ? '검색중...' : '주소 검색'}
        </button>
      </div>
      {searchStatus === 'empty' ? <p className="muted center">검색 결과가 없습니다. 검색어를 다시 입력해주세요.</p> : null}
      <div className="address-list matching-address-list">
        <article className={`address-row matching-address-card ${selectedAddress ? 'selected' : ''}`}>
          <div className="address-main-button">
            <div className="address-icon house" />
            <span>{selectedAddress?.address || '도로명 주소 검색으로 시공 주소를 선택해주세요.'}</span>
            {selectedAddress ? <strong>선택됨 ✓</strong> : null}
          </div>
          {selectedAddress ? <button className="address-edit-button" type="button" onClick={clearAddress}>삭제</button> : null}
        </article>
      </div>
      {selectedAddress ? (
        <div className="matching-inline-editor">
          <input
            value={selectedAddress.address_detail || ''}
            onChange={(event) => updateAddressDetail(event.target.value)}
            placeholder="상세주소를 입력해주세요. 예: 101동 202호"
          />
        </div>
      ) : null}
      {selectedAddress?.zip_no ? <p className="muted center">우편번호 {selectedAddress.zip_no}</p> : null}
      {error ? <p className="muted center">{error}</p> : null}
      {useMatchingMocks ? <button className="add-address" type="button" onClick={selectMockAddress}>개발용 주소 선택</button> : null}
      <PrimaryButton narrow onClick={goNextSchedule}>다음</PrimaryButton>
      {isResultModalOpen ? (
        <AddressSearchResultModal
          results={searchResults}
          onClose={() => setIsResultModalOpen(false)}
          onSelect={selectSearchResult}
        />
      ) : null}
    </section>
  )
}

export function MatchingAddressSelectPage({ go }) {
  return <MatchingAddressListPage go={go} />
}

export function MatchingSchedulePage({ go, openUrgent }) {
  const flow = useCustomerFlow()
  const initialDate = flow.matchingFlow.schedule.preferred_date > todayString() ? flow.matchingFlow.schedule.preferred_date : todayString()
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [selectedSlot, setSelectedSlot] = useState(flow.matchingFlow.schedule.preferred_time_start ? {
    start: flow.matchingFlow.schedule.preferred_time_start,
    end: flow.matchingFlow.schedule.preferred_time_end,
  } : null)
  const [submitStatus, setSubmitStatus] = useState('')

  const canContinue = Boolean(selectedDate && selectedSlot)

  const startMatching = async () => {
    if (!canContinue) return
    const estimate = flow.matchingFlow.selectedEstimate
    const address = flow.matchingFlow.selectedAddress
    const schedule = {
      preferred_date: selectedDate,
      preferred_time_start: selectedSlot.start,
      preferred_time_end: selectedSlot.end,
    }

    if (!estimate?.estimate_id) {
      setSubmitStatus('missing-estimate')
      return
    }
    if (!address?.region_code_id || !address?.address) {
      setSubmitStatus('missing-address')
      return
    }
    if (!address?.address_detail?.trim()) {
      setSubmitStatus('missing-address-detail')
      return
    }

    setSubmitStatus('submitting')

    try {
      const data = await createMatchingRequest(buildMatchingRequestBody({ estimate, address, schedule, isEmergency: false }))
      flow.updateMatchingFlow({
        isEmergency: false,
        matchingStatus: data.matching_status || '매칭 진행중',
        schedule,
        matchingRequestId: data.matching_request_id,
        matchedContractorCount: data.matched_contractor_count,
        matchingExpiresAt: data.expires_at,
      })
    } catch {
      if (!useMatchingMocks) {
        setSubmitStatus('error')
        return
      }

      flow.updateMatchingFlow({
        isEmergency: false,
        matchingStatus: mockMatchingRequest.matching_status,
        schedule,
        matchingRequestId: mockMatchingRequest.matching_request_id,
        matchedContractorCount: mockMatchingRequest.matched_contractor_count,
        matchingExpiresAt: mockMatchingRequest.expires_at,
      })
    }
    go(screens.matchingProgress)
  }

  const startEmergency = async () => {
    const estimate = flow.matchingFlow.selectedEstimate
    const address = flow.matchingFlow.selectedAddress
    const schedule = {
      preferred_date: todayString(),
      preferred_time_start: null,
      preferred_time_end: null,
    }

    if (!estimate?.estimate_id) {
      setSubmitStatus('missing-estimate')
      return
    }
    if (!address?.region_code_id || !address?.address) {
      setSubmitStatus('missing-address')
      return
    }
    if (!address?.address_detail?.trim()) {
      setSubmitStatus('missing-address-detail')
      return
    }

    setSubmitStatus('submitting')

    try {
      const data = await createMatchingRequest(buildMatchingRequestBody({ estimate, address, schedule, isEmergency: true }))
      flow.updateMatchingFlow({
        isEmergency: true,
        matchingStatus: data.matching_status || '매칭 진행중',
        schedule,
        matchingRequestId: data.matching_request_id,
        matchedContractorCount: data.matched_contractor_count,
        matchingExpiresAt: data.expires_at,
      })
    } catch {
      if (!useMatchingMocks) {
        setSubmitStatus('error')
        return
      }

      flow.updateMatchingFlow({
        isEmergency: true,
        matchingStatus: mockMatchingRequest.matching_status,
        schedule,
        matchingRequestId: mockMatchingRequest.matching_request_id,
        matchedContractorCount: mockMatchingRequest.matched_contractor_count,
        matchingExpiresAt: mockMatchingRequest.expires_at,
      })
    }
    go(screens.matchingProgress)
  }

  return (
    <section className="selection-screen schedule-screen">
      <button className="inline-back-arrow" onClick={() => go(screens.matchingAddressList)}>‹</button>
      <h1>시공을 예약할 날짜와 시간을 선택해주세요</h1>
      <div className="schedule-row">
        <div className="schedule-icon calendar" />
        <input className="schedule-input" type="date" min={todayString()} value={selectedDate} onChange={(event) => {
          setSelectedDate(event.target.value)
          setSelectedSlot(null)
        }} />
      </div>
      <div className="slot-grid">
        {timeSlots.map((slot) => {
          const disabled = !isSlotSelectable(selectedDate, slot)
          const active = selectedSlot?.start === slot.start
          return (
            <button
              className={`time-slot-button ${active ? 'active' : ''}`}
              disabled={disabled}
              key={slot.start}
              type="button"
              onClick={() => setSelectedSlot(slot)}
            >
              {slot.start} ~ {slot.end}
            </button>
          )
        })}
      </div>
      <button className="urgent-banner" onClick={openUrgent || startEmergency}>긴급 수리 요청</button>
      {submitStatus === 'submitting' ? <p className="muted center">매칭 요청을 생성하는 중입니다.</p> : null}
      {submitStatus === 'missing-estimate' ? <p className="muted center">AI 견적서를 먼저 선택해주세요.</p> : null}
      {submitStatus === 'missing-address' ? <p className="muted center">도로명 주소 검색으로 지역 코드가 포함된 주소를 선택해주세요.</p> : null}
      {submitStatus === 'missing-address-detail' ? <p className="muted center">상세 주소를 입력해주세요.</p> : null}
      {submitStatus === 'error' ? <p className="muted center">매칭 요청 생성에 실패했습니다. 서버 연결과 로그인 상태를 확인해주세요.</p> : null}
      <div className="button-row bottom-actions">
        <PrimaryButton orange onClick={() => go(screens.matchingAddressList)}>취소</PrimaryButton>
        <PrimaryButton onClick={startMatching}>{submitStatus === 'submitting' ? '요청중...' : canContinue ? '매칭 시작하기' : '시간 선택 필요'}</PrimaryButton>
      </div>
    </section>
  )
}

export function MatchingProgressPage({ go }) {
  const flow = useCustomerFlow()
  const { updateMatchingFlow } = flow

  useEffect(() => {
    const timer = window.setTimeout(() => {
      updateMatchingFlow({ matchingStatus: '견적 도착' })
      go(screens.matchingAuction)
    }, 1400)

    return () => window.clearTimeout(timer)
  }, [go, updateMatchingFlow])

  return (
    <section className="status-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow top-left" onClick={() => go(screens.matchingSchedule)}>‹</button>
      <div className="status-ring loading" />
      <h2>매칭 진행중 ...</h2>
      <p>매칭 가능한 파트너를 찾고 있습니다.</p>
      <p>조건에 맞는 파트너의 견적을 기다리는 중입니다.</p>
    </section>
  )
}

export function MatchingAuctionPage({ go }) {
  const flow = useCustomerFlow()
  const [proposalPartner, setProposalPartner] = useState(null)
  const [profilePartner, setProfilePartner] = useState(null)
  const [confirmPartner, setConfirmPartner] = useState(null)
  const [completePartner, setCompletePartner] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [partners, setPartners] = useState([])
  const [loadStatus, setLoadStatus] = useState(isMockId(flow.matchingFlow.matchingRequestId) ? 'missing-request' : 'loading')
  const [selectStatus, setSelectStatus] = useState('')
  const matchingRequestId = flow.matchingFlow.matchingRequestId
  const title = estimateTitle(flow.matchingFlow.selectedEstimate)

  useEffect(() => {
    if (isMockId(matchingRequestId)) return

    let ignore = false

    getMatchingQuotes(matchingRequestId)
      .then((data) => {
        if (ignore) return
        if (data?.quotes?.length) {
          setPartners(data.quotes.map(quoteToPartner))
          setLoadStatus('loaded')
        } else if (useMatchingMocks) {
          setPartners(mockMatchingQuotes.map(quoteToPartner))
          setLoadStatus('loaded')
        } else {
          setPartners([])
          setLoadStatus('empty')
        }
      })
      .catch(() => {
        if (!ignore) {
          if (useMatchingMocks) {
            setPartners(mockMatchingQuotes.map(quoteToPartner))
            setLoadStatus('loaded')
          } else {
            setPartners([])
            setLoadStatus('error')
          }
        }
      })

    return () => {
      ignore = true
    }
  }, [matchingRequestId])

  const selectPartner = async (partner) => {
    setIsSelecting(true)

    try {
      const data = await selectMatchingQuote(matchingRequestId, partner.quote_id)
      const record = buildMatchingHistoryRecord(flow, partner, data)
      flow.updateMatchingFlow((current) => ({
        selectedQuoteId: data.selected_quote_id || partner.quote_id,
        selectedQuote: partner,
        selectedPartner: partner,
        workOrderId: data.work_order_id,
        matchingStatus: record.matchingStatus,
        hasCompletedMatching: true,
        currentMatchingId: record.id,
        matchingHistory: [record, ...(current.matchingHistory || []).filter((item) => item.id !== record.id)],
      }))
      setProposalPartner(null)
      setConfirmPartner(null)
      setCompletePartner(partner)
    } catch {
      if (useMatchingMocks) {
        const record = buildMatchingHistoryRecord(flow, partner)
        flow.updateMatchingFlow((current) => ({
          selectedQuoteId: partner.quote_id,
          selectedQuote: partner,
          selectedPartner: partner,
          workOrderId: 'mock-work-order-001',
          matchingStatus: record.matchingStatus,
          hasCompletedMatching: true,
          currentMatchingId: record.id,
          matchingHistory: [record, ...(current.matchingHistory || []).filter((item) => item.id !== record.id)],
        }))
        setProposalPartner(null)
        setConfirmPartner(null)
        setCompletePartner(partner)
      } else {
        setSelectStatus('error')
      }
    } finally {
      setIsSelecting(false)
    }
  }

  return (
    <section className="selection-screen auction-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.matchingProgress)}>‹</button>
      <h1>{title}</h1>
      {loadStatus === 'loading' ? <p className="muted center">파트너 견적을 불러오는 중입니다.</p> : null}
      {loadStatus === 'missing-request' ? <p className="muted center">매칭 요청 ID가 없어 견적 목록을 불러올 수 없습니다.</p> : null}
      {loadStatus === 'error' ? <p className="muted center">파트너 견적을 불러오지 못했습니다. 서버 연결을 확인해주세요.</p> : null}
      {loadStatus === 'empty' ? <p className="muted center">아직 매칭에 응답한 파트너가 없어요.</p> : null}
      {selectStatus === 'error' ? <p className="muted center">파트너 선택에 실패했습니다. 다시 시도해주세요.</p> : null}
      <div className="list-stack">
        {partners.map((partner) => (
          <PartnerCard
            key={partner.quote_id}
            partner={partner}
            onOpenProposal={setProposalPartner}
            onOpenProfile={setProfilePartner}
          />
        ))}
      </div>
      <div className="auction-footer">
        <span>{formatDate(flow.matchingFlow.schedule.preferred_date)}</span>
        <span>견적 도착 : {partners.length}명</span>
      </div>
      <p className="muted center">파트너 카드를 눌러 상세 제안을 확인하세요</p>
      <ProposalModal partner={proposalPartner} onClose={() => setProposalPartner(null)} onSelect={setConfirmPartner} isSelecting={isSelecting} />
      <PartnerSelectConfirmModal
        partner={confirmPartner}
        onClose={() => setConfirmPartner(null)}
        onConfirm={() => selectPartner(confirmPartner)}
        isSelecting={isSelecting}
      />
      <MatchingCompleteModal
        partner={completePartner}
        onConfirm={() => go(screens.matchingDone)}
      />
      <ProfileModal partner={profilePartner} onClose={() => setProfilePartner(null)} />
    </section>
  )
}

export function MatchingPartnerPage({ go }) {
  const flow = useCustomerFlow()
  const partner = flow.matchingFlow.selectedPartner

  if (!partner) {
    return (
      <section className="document-screen">
        <button className="inline-back-arrow" onClick={() => go(screens.matchingAuction)}>‹</button>
        <p className="muted center">선택된 파트너 제안이 없습니다.</p>
      </section>
    )
  }

  return (
    <section className="document-screen">
      <button className="inline-back-arrow" onClick={() => go(screens.matchingAuction)}>‹</button>
      <ProposalModal partner={partner} onClose={() => go(screens.matchingAuction)} onSelect={() => go(screens.matchingDone)} />
    </section>
  )
}

export function MatchingPartnerInfoPage({ go }) {
  const flow = useCustomerFlow()
  const partner = flow.matchingFlow.selectedPartner

  if (!partner) {
    return (
      <section className="document-screen">
        <button className="inline-back-arrow" onClick={() => go(screens.matchingAuction)}>‹</button>
        <p className="muted center">선택된 파트너 정보가 없습니다.</p>
      </section>
    )
  }

  return (
    <section className="document-screen">
      <button className="inline-back-arrow" onClick={() => go(screens.matchingAuction)}>‹</button>
      <ProfileModal partner={partner} onClose={() => go(screens.matchingAuction)} />
    </section>
  )
}

export function LegacyMatchingDonePage({ go }) {
  const flow = useCustomerFlow()
  const selectedPartner = flow.matchingFlow.selectedPartner
  const estimate = flow.matchingFlow.selectedEstimate
  const address = flow.matchingFlow.selectedAddress
  const schedule = flow.matchingFlow.schedule
  const [profilePartner, setProfilePartner] = useState(null)

  if (!selectedPartner) {
    return (
      <section className="subpage-screen current-matching-screen">
        <CustomerTopBar go={go} />
        <button className="inline-back-arrow" onClick={() => go(screens.home)}>‹</button>
        <h1 className="matching-history-title">현재 매칭</h1>
        <article className="current-matching-panel">
          <MatchingStatusBadge status={flow.matchingFlow.matchingStatus || '진행중인 매칭 없음'} />
          <h2>진행중인 매칭이 없어요</h2>
          <p>AI 견적서를 선택하고 주소 정보를 연결한 뒤 매칭을 요청해보세요.</p>
          <PrimaryButton narrow onClick={() => go(screens.matchingEstimateSelect)}>매칭 시작하기</PrimaryButton>
        </article>
      </section>
    )
  }

  return (
    <section className="subpage-screen current-matching-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.home)}>‹</button>
      <h1 className="matching-history-title">현재 매칭</h1>
      <article className="current-matching-panel">
        <div className="current-matching-head">
          <div>
            <MatchingStatusBadge status="시공 예정" />
            <h2>{estimateTitle(estimate)}</h2>
          </div>
          <span>{selectedPartner.available_date}</span>
        </div>

        <div className="current-summary-grid">
          <div>
            <small>AI 견적</small>
            <strong>{estimateCost(estimate)}</strong>
          </div>
          <div>
            <small>확정 금액</small>
            <strong>{formatWon(selectedPartner.total_amount)}</strong>
          </div>
          <div>
            <small>예약 시간</small>
            <strong>{schedule.preferred_time_start ? `${schedule.preferred_time_start} ~ ${schedule.preferred_time_end}` : '긴급 요청'}</strong>
          </div>
          <div>
            <small>예상 소요</small>
            <strong>{estimateMinutesLabel(selectedPartner.estimated_minutes)}</strong>
          </div>
        </div>

        <section className="current-detail-section">
          <h3>시공 주소</h3>
          <p>{address?.address || address?.label || '서울특별시 강남구 테헤란로 123, 101동 202호'}</p>
        </section>

        <section className="current-detail-section">
          <h3>선택한 파트너</h3>
          <div className="partner-inline">
            <button className="partner-avatar-button" type="button" onClick={() => setProfilePartner(selectedPartner)} aria-label="파트너 프로필 보기">
              <Avatar tone={selectedPartner.avatar} />
            </button>
            <div>
              <strong>{selectedPartner.contractor.business_name}</strong>
              <PartnerStars rating={selectedPartner.contractor.rating_avg} />
              <p>{selectedPartner.specialty} / 경력 {selectedPartner.career}</p>
              <p>{selectedPartner.contractor.phone}</p>
            </div>
          </div>
        </section>

        <section className="current-detail-section">
          <h3>파트너 제안 내용</h3>
          <p>{selectedPartner.work_scope}</p>
          <p>{selectedPartner.additional_note}</p>
        </section>

        <div className="button-row bottom-actions">
          <PrimaryButton ghost onClick={() => go(screens.matchingAuction)}>견적 다시 보기</PrimaryButton>
          <PrimaryButton ghost onClick={() => go(screens.matchingEstimateSelect)}>추가 매칭하기</PrimaryButton>
          <PrimaryButton onClick={() => go(screens.chatRoom)}>1:1 채팅 상담</PrimaryButton>
        </div>
      </article>
      <ProfileModal
        partner={profilePartner}
        onClose={() => setProfilePartner(null)}
        onChat={() => go(screens.chatRoom)}
      />
    </section>
  )
}

export function MatchingDonePage({ go }) {
  const flow = useCustomerFlow()
  const selectedPartner = flow.matchingFlow.selectedPartner
  const latestRecord = selectedPartner ? {
    id: flow.matchingFlow.currentMatchingId || 'current-matching',
    matchingStatus: flow.matchingFlow.matchingStatus || '시공 예정',
    estimate: flow.matchingFlow.selectedEstimate,
    address: flow.matchingFlow.selectedAddress,
    schedule: flow.matchingFlow.schedule,
    partner: selectedPartner,
    createdAt: new Date().toISOString(),
  } : null
  const matchingRecords = (flow.matchingFlow.matchingHistory?.length ? flow.matchingFlow.matchingHistory : latestRecord ? [latestRecord] : [])
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  const [expandedRecordId, setExpandedRecordId] = useState(matchingRecords[0]?.id || null)
  const [profilePartner, setProfilePartner] = useState(null)

  if (!matchingRecords.length) {
    return (
      <section className="subpage-screen current-matching-screen">
        <CustomerTopBar go={go} />
        <button className="inline-back-arrow" onClick={() => go(screens.home)}>‹</button>
        <div className="matching-title-row">
          <h1 className="matching-history-title">현재 매칭</h1>
          <button className="mini-primary" type="button" onClick={() => go(screens.matchingEstimateSelect)}>추가 매칭하기</button>
        </div>
        <article className="current-matching-panel">
          <MatchingStatusBadge status={flow.matchingFlow.matchingStatus || '진행중인 매칭 없음'} />
          <h2>진행중인 매칭이 없어요</h2>
          <p>AI 견적서를 선택하고 주소 정보를 연결한 뒤 매칭을 요청해보세요.</p>
        </article>
      </section>
    )
  }

  return (
    <section className="subpage-screen current-matching-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.home)}>‹</button>
      <div className="matching-title-row">
        <h1 className="matching-history-title">현재 매칭</h1>
        <button className="mini-primary" type="button" onClick={() => go(screens.matchingEstimateSelect)}>추가 매칭하기</button>
      </div>
      <div className="matching-record-list">
        {matchingRecords.map((record, index) => {
          const isExpanded = expandedRecordId === record.id
          const recordPartner = record.partner
          const recordSchedule = record.schedule || {}

          if (!isExpanded) {
            return (
              <article className="current-matching-panel matching-record-card compact" key={record.id}>
                <div className="current-matching-head">
                  <div>
                    <MatchingStatusBadge status={record.matchingStatus || '시공 예정'} />
                    <h2>{estimateTitle(record.estimate)}</h2>
                    <p>{recordPartner.contractor.business_name} · {formatWon(recordPartner.total_amount)}</p>
                  </div>
                  <span>{recordPartner.available_date || formatDate(recordSchedule.preferred_date)}</span>
                </div>
                <button className="wide-action" type="button" onClick={() => setExpandedRecordId(record.id)}>자세히 보기</button>
              </article>
            )
          }

          return (
            <article className="current-matching-panel matching-record-card" key={record.id}>
              {index === 0 ? <small className="latest-matching-label">최신 매칭</small> : null}
              <div className="current-matching-head">
                <div>
                  <MatchingStatusBadge status={record.matchingStatus || '시공 예정'} />
                  <h2>{estimateTitle(record.estimate)}</h2>
                </div>
                <span>{recordPartner.available_date || formatDate(recordSchedule.preferred_date)}</span>
              </div>

              <div className="current-summary-grid">
                <div>
                  <small>AI 견적</small>
                  <strong>{estimateCost(record.estimate)}</strong>
                </div>
                <div>
                  <small>확정 금액</small>
                  <strong>{formatWon(recordPartner.total_amount)}</strong>
                </div>
                <div>
                  <small>예약 시간</small>
                  <strong>{recordSchedule.preferred_time_start ? `${recordSchedule.preferred_time_start} ~ ${recordSchedule.preferred_time_end}` : '긴급 요청'}</strong>
                </div>
                <div>
                  <small>예상 소요</small>
                  <strong>{estimateMinutesLabel(recordPartner.estimated_minutes)}</strong>
                </div>
              </div>

              <section className="current-detail-section">
                <h3>시공 주소</h3>
                <p>{record.address?.address || record.address?.label || '주소 정보 없음'}</p>
              </section>

              <section className="current-detail-section">
                <h3>매칭된 파트너</h3>
                <div className="partner-inline">
                  <button className="partner-avatar-button" type="button" onClick={() => setProfilePartner(recordPartner)} aria-label="파트너 프로필 보기">
                    <Avatar tone={recordPartner.avatar} />
                  </button>
                  <div>
                    <strong>{recordPartner.contractor.business_name}</strong>
                    <PartnerStars rating={recordPartner.contractor.rating_avg} />
                    <p>{recordPartner.specialty} / 경력 {recordPartner.career}</p>
                    <p>{recordPartner.contractor.phone}</p>
                  </div>
                </div>
              </section>

              <section className="current-detail-section">
                <h3>파트너 제안 내용</h3>
                <p>{recordPartner.work_scope}</p>
                <p>{recordPartner.additional_note}</p>
              </section>

              <div className="button-row bottom-actions">
                <PrimaryButton onClick={() => go(screens.chatRoom)}>1:1 채팅 상담</PrimaryButton>
              </div>
            </article>
          )
        })}
      </div>
      <ProfileModal
        partner={profilePartner}
        onClose={() => setProfilePartner(null)}
        onChat={() => go(screens.chatRoom)}
      />
    </section>
  )
}

export function ReviewWritePage({ go }) {
  return (
    <section className="review-write-screen">
      <article className="review-write-card">
        <div className="review-write-head">
          <div className="title-icon review" />
          <h1>리뷰 작성</h1>
        </div>
        <div className="review-avatar-block">
          <Avatar large tone="light" />
          <strong>김도배 파트너님</strong>
          <span>★★★★☆ 4.5/5</span>
        </div>
        <h2>이분의 시공은 어떠셨나요?</h2>
        <div className="big-stars">☆☆☆☆☆</div>
        <textarea className="textarea tall" placeholder="이분의 시공은 어땠는지 자세하게 알려주세요." />
        <div className="button-row">
          <PrimaryButton orange onClick={() => go(screens.matchHistory)}>취소</PrimaryButton>
          <PrimaryButton onClick={() => go(screens.myReviews)}>완료</PrimaryButton>
        </div>
      </article>
    </section>
  )
}

export function UrgentModal({ close, confirm }) {
  return (
    <div className="modal-overlay matching-modal-overlay">
      <div className="modal-card matching-confirm-modal-card">
        <div className="modal-icon">!</div>
        <h3>긴급 수리 요청 선택 시</h3>
        <p>최대한 빠르게 시공을 받아볼 수 있으며, 추가 비용이 발생할 수 있어요.</p>
        <small>진행하시겠습니까?</small>
        <div className="button-row">
          <PrimaryButton orange onClick={close}>취소</PrimaryButton>
          <PrimaryButton onClick={confirm}>확인</PrimaryButton>
        </div>
      </div>
    </div>
  )
}

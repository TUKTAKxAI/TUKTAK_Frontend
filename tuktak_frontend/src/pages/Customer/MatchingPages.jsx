import { useEffect, useState } from 'react'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { Avatar, PrimaryButton } from '../../components/customer/FormControls'
import { useCustomerFlow } from '../../context/CustomerFlowContext'
import { screens } from '../../data/customerData'

const timeSlots = [
  { start: '09:00', end: '12:00' },
  { start: '12:00', end: '15:00' },
  { start: '15:00', end: '18:00' },
  { start: '18:00', end: '21:00' },
]

const mockEstimates = [
  {
    estimate_id: 1,
    repair_task_name: '거실 몰딩 시공',
    min_price: 600000,
    max_price: 670000,
    estimate_status: 'COMPLETED',
    created_at: '2026-06-16',
  },
  {
    estimate_id: 2,
    repair_task_name: '거실 도배 시공',
    min_price: 220000,
    max_price: 260000,
    estimate_status: 'COMPLETED',
    created_at: '2026-02-16',
  },
]

const mockAddresses = [
  {
    address_id: 1,
    region_code_id: 11010,
    address: '서울특별시 강남구 테헤란로 123, 101동 202호',
    icon: 'house',
  },
  {
    address_id: 2,
    region_code_id: 41135,
    address: '경기도 성남시 분당구 판교로 45, 3층',
    icon: 'building',
  },
  {
    address_id: 3,
    region_code_id: 11110,
    address: '서울특별시 종로구 인사동길 12, 5층',
    icon: 'house',
  },
]

const mockPartners = [
  {
    quote_id: 101,
    contractor: {
      contractor_id: 11,
      business_name: '홍길동 파트너',
      rating_avg: 4.5,
      review_count: 27,
      profile_image_url: '',
      phone: '0507-125-5484',
      business_address: '서울시 역삼동 123번지',
    },
    specialty: '목공/문틀',
    career: '13년',
    total_amount: 620000,
    work_scope: '몰딩 철거 및 신규 몰딩 시공',
    estimated_minutes: 180,
    available_date: '2026-06-23',
    arrival_time: '16:00',
    additional_note: '현장 확인 후 몰딩 안쪽 들뜸이 있으면 보강 작업을 함께 진행합니다.',
    reviews: [
      '시간 맞춰 와주시고 마감이 깔끔했어요.',
      'AI 견적보다 저렴하게 진행해주셨어요.',
      '설명이 친절해서 믿고 맡겼습니다.',
      '작업 속도가 빠르고 정리가 좋았습니다.',
      '다음에도 다시 요청하고 싶어요.',
      '추가 비용 안내가 투명했습니다.',
    ],
    avatar: 'light',
  },
  {
    quote_id: 102,
    contractor: {
      contractor_id: 12,
      business_name: '김철수 파트너',
      rating_avg: 4,
      review_count: 18,
      profile_image_url: '',
      phone: '0507-222-7788',
      business_address: '서울시 서초구 반포대로 44',
    },
    specialty: '인테리어 마감',
    career: '8년',
    total_amount: 720000,
    work_scope: '몰딩 자재 포함 전체 교체',
    estimated_minutes: 210,
    available_date: '2026-06-23',
    arrival_time: '15:00',
    additional_note: '자재 수급 상황에 따라 색상 선택지를 현장에서 안내드립니다.',
    reviews: ['꼼꼼하게 봐주셨어요.', '가격 설명이 명확했습니다.', '마감은 좋았고 시간이 조금 걸렸어요.'],
    avatar: 'blue',
  },
  {
    quote_id: 103,
    contractor: {
      contractor_id: 13,
      business_name: '김영희 파트너',
      rating_avg: 4,
      review_count: 11,
      profile_image_url: '',
      phone: '0507-333-9182',
      business_address: '서울시 강남구 논현로 88',
    },
    specialty: '목공 보수',
    career: '6년',
    total_amount: 600000,
    work_scope: '기존 몰딩 보수 및 부분 교체',
    estimated_minutes: 160,
    available_date: '2026-06-24',
    arrival_time: '10:00',
    additional_note: '가성비 위주로 필요한 부분만 시공하는 제안입니다.',
    reviews: ['필요한 부분만 추천해줘서 좋았어요.', '비용이 합리적이었습니다.'],
    avatar: 'plain',
    highlight: '가장 저렴!',
  },
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
  return estimate?.repair_task_name || estimate?.title || '거실 몰딩 시공'
}

function estimateCost(estimate) {
  if (estimate?.min_price && estimate?.max_price) return `${formatWon(estimate.min_price)} ~ ${formatWon(estimate.max_price)}`
  if (estimate?.max_price) return formatWon(estimate.max_price)
  if (estimate?.min_price) return formatWon(estimate.min_price)
  return '600,000원'
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

function AddressEditor({ mode, onCancel, onSave }) {
  const [value, setValue] = useState(mode === 'edit' ? '서울특별시 강남구 테헤란로 123, 101동 202호' : '')

  return (
    <div className="matching-inline-editor">
      <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="전체 주소를 입력해주세요" />
      <div className="button-row">
        <button className="mini-orange" type="button" onClick={onCancel}>취소</button>
        <button className="mini-primary" type="button" onClick={() => onSave(value)}>저장</button>
      </div>
    </div>
  )
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

function ProfileModal({ partner, onClose }) {
  const [visibleCount, setVisibleCount] = useState(5)
  if (!partner) return null

  const visibleReviews = partner.reviews.slice(0, visibleCount)

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
          {visibleReviews.map((review, index) => (
            <div className="partner-mini-review" key={`${partner.quote_id}-${index}`}>
              작성자 : 고객 {index + 1} ★★★★★ 5/5<br />
              {review}
            </div>
          ))}
        </div>
        {partner.reviews.length > visibleCount ? (
          <button className="mini-primary review-more-button" type="button" onClick={() => setVisibleCount((count) => count + 5)}>더보기</button>
        ) : null}
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

  const selectEstimate = (estimate) => {
    flow.updateMatchingFlow({ selectedEstimate: estimate })
    go(screens.matchingAddressList)
  }

  return (
    <section className="selection-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.matchingHome)}>‹</button>
      <h2>AI 견적서를 선택해주세요</h2>
      <div className="list-stack">
        {/* API 연동 지점: GET /api/v1/users/me/ai-estimates */}
        {mockEstimates.map((estimate) => (
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
  const selectedAddress = flow.matchingFlow.selectedAddress
  const [editorMode, setEditorMode] = useState('')

  const saveAddress = (address) => {
    if (!address.trim()) return
    flow.updateMatchingFlow({
      selectedAddress: {
        address_id: Date.now(),
        region_code_id: 11010,
        address,
        label: address,
      },
    })
    setEditorMode('')
  }

  return (
    <section className="selection-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.matchingEstimateSelect)}>‹</button>
      <p className="small-copy">시공 지역을 알려주세요 !</p>
      <h1>내 주소목록</h1>
      <div className="address-list matching-address-list">
        {/* API 연동 지점: 주소 API가 명세에 추가되면 로그인 사용자 주소 목록으로 교체 */}
        {mockAddresses.map((row) => {
          const selected = selectedAddress?.address_id === row.address_id || selectedAddress?.address === row.address
          return (
            <article className={`address-row matching-address-card ${selected ? 'selected' : ''}`} key={row.address_id}>
              <button type="button" className="address-main-button" onClick={() => flow.updateMatchingFlow({ selectedAddress: { ...row, label: row.address } })}>
                <div className={`address-icon ${row.icon}`} />
                <span>{row.address}</span>
                {selected ? <strong>선택됨 ✓</strong> : null}
              </button>
              <button className="address-edit-button" type="button" onClick={() => setEditorMode('edit')}>수정</button>
            </article>
          )
        })}
      </div>
      {editorMode ? <AddressEditor mode={editorMode} onCancel={() => setEditorMode('')} onSave={saveAddress} /> : null}
      <button className="add-address" type="button" onClick={() => setEditorMode('add')}>⊕ 주소 추가하기</button>
      <PrimaryButton narrow onClick={() => go(screens.matchingSchedule)}>다음</PrimaryButton>
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

  const canContinue = Boolean(selectedDate && selectedSlot)

  const startMatching = () => {
    if (!canContinue) return
    flow.updateMatchingFlow({
      isEmergency: false,
      matchingStatus: '매칭 진행중',
      schedule: {
        preferred_date: selectedDate,
        preferred_time_start: selectedSlot.start,
        preferred_time_end: selectedSlot.end,
      },
      matchingRequestId: `mock-${Date.now()}`,
    })
    // API 연동 지점: POST /api/v1/matching-requests
    go(screens.matchingProgress)
  }

  const startEmergency = () => {
    flow.updateMatchingFlow({
      isEmergency: true,
      matchingStatus: '매칭 진행중',
      schedule: {
        preferred_date: todayString(),
        preferred_time_start: null,
        preferred_time_end: null,
      },
      matchingRequestId: `mock-emergency-${Date.now()}`,
    })
    // API 연동 지점: POST /api/v1/matching-requests, is_emergency:true
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
      <div className="button-row bottom-actions">
        <PrimaryButton orange onClick={() => go(screens.matchingAddressList)}>취소</PrimaryButton>
        <PrimaryButton onClick={startMatching}>{canContinue ? '매칭 시작하기' : '시간 선택 필요'}</PrimaryButton>
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
  const [isSelecting, setIsSelecting] = useState(false)
  const title = estimateTitle(flow.matchingFlow.selectedEstimate || mockEstimates[0])

  const selectPartner = (partner) => {
    setIsSelecting(true)
    window.setTimeout(() => {
      flow.updateMatchingFlow({
        selectedQuoteId: partner.quote_id,
        selectedQuote: partner,
        selectedPartner: partner,
        workOrderId: `mock-work-${partner.quote_id}`,
        matchingStatus: '파트너 선택 완료',
        hasCompletedMatching: true,
      })
      // API 연동 지점: POST /api/v1/matching-requests/{matching_request_id}/select-quote
      setIsSelecting(false)
      setProposalPartner(null)
      go(screens.matchingDone)
    }, 500)
  }

  return (
    <section className="selection-screen auction-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.matchingProgress)}>‹</button>
      <h1>{title}</h1>
      <div className="list-stack">
        {/* API 연동 지점: GET /api/v1/matching-requests/{matching_request_id}/quotes */}
        {mockPartners.map((partner) => (
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
        <span>견적 도착 : {mockPartners.length}명</span>
      </div>
      <p className="muted center">파트너 카드를 눌러 상세 제안을 확인하세요</p>
      <ProposalModal partner={proposalPartner} onClose={() => setProposalPartner(null)} onSelect={selectPartner} isSelecting={isSelecting} />
      <ProfileModal partner={profilePartner} onClose={() => setProfilePartner(null)} />
    </section>
  )
}

export function MatchingPartnerPage({ go }) {
  const flow = useCustomerFlow()
  const partner = flow.matchingFlow.selectedPartner || mockPartners[0]

  return (
    <section className="document-screen">
      <button className="inline-back-arrow" onClick={() => go(screens.matchingAuction)}>‹</button>
      <ProposalModal partner={partner} onClose={() => go(screens.matchingAuction)} onSelect={() => go(screens.matchingDone)} />
    </section>
  )
}

export function MatchingPartnerInfoPage({ go }) {
  const flow = useCustomerFlow()
  const partner = flow.matchingFlow.selectedPartner || mockPartners[0]

  return (
    <section className="document-screen">
      <button className="inline-back-arrow" onClick={() => go(screens.matchingAuction)}>‹</button>
      <ProfileModal partner={partner} onClose={() => go(screens.matchingAuction)} />
    </section>
  )
}

export function MatchingDonePage({ go }) {
  const flow = useCustomerFlow()
  const selectedPartner = flow.matchingFlow.selectedPartner
  const estimate = flow.matchingFlow.selectedEstimate || mockEstimates[0]
  const address = flow.matchingFlow.selectedAddress
  const schedule = flow.matchingFlow.schedule

  if (!selectedPartner) {
    return (
      <section className="subpage-screen current-matching-screen">
        <CustomerTopBar go={go} />
        <button className="inline-back-arrow" onClick={() => go(screens.home)}>‹</button>
        <h1 className="matching-history-title">현재 매칭</h1>
        <article className="current-matching-panel">
          <MatchingStatusBadge status={flow.matchingFlow.matchingStatus || '진행중인 매칭 없음'} />
          <h2>진행중인 매칭이 없어요</h2>
          <p>AI 견적서를 선택하고 근처 파트너에게 매칭을 요청해보세요.</p>
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
            <Avatar tone={selectedPartner.avatar} />
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
          <PrimaryButton onClick={() => go(screens.chatRoom)}>1:1 채팅 상담</PrimaryButton>
        </div>
      </article>
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
    <div className="modal-overlay">
      <div className="modal-card">
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

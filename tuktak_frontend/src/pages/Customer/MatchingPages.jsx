import { api } from '../../api/apiClient'
import { useEffect, useState, useRef } from 'react'
import { searchJusoAddresses } from '../../api/jusoApi'
import { CustomerPage } from './CustomerPageShared'
import { Avatar, PrimaryButton } from '../../components/customer/FormControls'
import { useCustomerFlow } from '../../context/CustomerFlowContext'
import { screens } from '../../data/customerData'
import { buildMatchingRequestBody, estimateTitle } from '../../utils/matchingRequest'
import { figmaAssets } from '../../components/customer/figmaAssets'
import preview9 from '../../assets/figma/preview9.webp';
import preview10 from '../../assets/figma/preview10.webp';
import preview11 from '../../assets/figma/preview11.webp';
import preview12 from '../../assets/figma/preview12.webp';
import loadingCarbonSvg from '../../assets/figma/loading-carbon.svg?raw';
import errorSvg from "../../assets/figma/error.svg?raw"
import urgentAlertSvg from '../../assets/figma/urgent-alert.svg?raw'
import { FaMapMarkerAlt, FaChevronDown, FaRegCalendarAlt, FaRegClock, FaExclamationTriangle, FaTimes } from 'react-icons/fa'

const previewImages = [preview9, preview10, preview11, preview12];

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

function estimateCost(estimate) {
  if (estimate?.min_price && estimate?.max_price) return `${formatWon(estimate.min_price)} ~ ${formatWon(estimate.max_price)}`
  if (estimate?.max_price) return formatWon(estimate.max_price)
  if (estimate?.min_price) return formatWon(estimate.min_price)
  return '비용 정보 없음'
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
    <article className="matching-auction-card">
      <button className="matching-auction-card-avatar" type="button" onClick={() => onOpenProfile(partner)} aria-label="파트너 프로필 보기">
        <Avatar tone={partner.avatar} />
      </button>
      <button className="matching-auction-card-body" type="button" onClick={() => onOpenProposal(partner)}>
        <div className="matching-auction-card-head">
          <strong>{partner.contractor.business_name}</strong>
          <PartnerStars rating={partner.contractor.rating_avg} />
        </div>
        <p>{partner.specialty} / 경력 {partner.career}</p>
        <p>제안 시공 금액 : <strong>{formatWon(partner.total_amount)}</strong></p>
        <p>예상 소요 시간 : {estimateMinutesLabel(partner.estimated_minutes)}</p>
        <small>방문 가능 시간 : {partner.available_date} {partner.arrival_time}</small>
      </button>
      {partner.highlight ? <span className="matching-auction-card-highlight">{partner.highlight}</span> : null}
    </article>
  )
}

function ProposalModal({ partner, onClose, onSelect, isSelecting, inline }) {
  if (!partner) return null

  const content = (
    <div className={`estimate-result-modal ${inline ? 'is-inline' : ''}`}>
      <div className="partner-modal-head">
        <div className="partner-modal-profile">
          <Avatar tone={partner.avatar} />
          <div>
            <strong>{partner.contractor.business_name}</strong>
            <PartnerStars rating={partner.contractor.rating_avg} />
            <p>{partner.specialty} / 경력 {partner.career}</p>
            <p>{partner.contractor.phone}</p>
          </div>
        </div>
        <button className="partner-modal-close" type="button" onClick={onClose} aria-label="닫기">
          <FaTimes />
        </button>
      </div>
      <p className="partner-modal-price">제안 시공 금액 : {formatWon(partner.total_amount)}</p>
      <div className="partner-modal-detail-list">
        <p>예상 소요 시간 : {estimateMinutesLabel(partner.estimated_minutes)}</p>
        <p>확정 방문 시간 : {partner.arrival_time}</p>
        <p>확정 시공일 : {partner.available_date}</p>
        <p>{partner.additional_note}</p>
      </div>
      <div className="estimate-result-actions single">
        <PrimaryButton disabled={isSelecting} onClick={() => onSelect(partner)}>{isSelecting ? '선택중...' : '파트너 선택하기'}</PrimaryButton>
      </div>
    </div>
  )

  if (inline) return content

  return <div className="estimate-result-overlay">{content}</div>
}

function ProfileModal({ partner, onClose, inline }) {
  const [visibleCount, setVisibleCount] = useState(5)
  if (!partner) return null

  const reviews = partner.reviews || []
  const visibleReviews = reviews.slice(0, visibleCount)

  const content = (
    <div className={`estimate-result-modal ${inline ? 'is-inline' : ''}`}>
      <div className="partner-modal-head">
        <div className="partner-modal-info">
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
        <button className="partner-modal-close" type="button" onClick={onClose} aria-label="닫기">
          <FaTimes />
        </button>
      </div>
      <div className="partner-modal-reviews">
        <small className="partner-modal-reviews-label">최근리뷰</small>
        {visibleReviews.length ? visibleReviews.map((review, index) => (
          <div className="partner-modal-review-item" key={`${partner.quote_id}-${index}`}>
            작성자 : 고객 {index + 1} ★★★★★ 5/5<br />
            {review}
          </div>
        )) : <div className="partner-modal-review-item">아직 표시할 리뷰가 없습니다.</div>}
        {reviews.length > visibleCount ? (
          <button className="mini-primary" type="button" onClick={() => setVisibleCount((count) => count + 5)}>더보기</button>
        ) : null}
      </div>
    </div>
  )

  if (inline) return content

  return <div className="estimate-result-overlay">{content}</div>
}

function ServiceHero({ onClick, buttonLabel, go }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % previewImages.length;
      
      if (scrollRef.current) {
        const cardWidth = scrollRef.current.offsetWidth * 0.5;
        scrollRef.current.scrollTo({
          left: nextIndex * cardWidth,
          behavior: 'smooth'
        });
        setActiveIndex(nextIndex);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const goToIndex = (index) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth * 0.5;
      scrollRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
      setActiveIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth * 0.5;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(index);
    }
  };

  return (
    <CustomerPage go={go} className="cds--white">
      <div className="estimate-hero">
      <div className="estimate-hero-body">
        <div className="estimate-hero-head">
          <span className="estimate-hero-eyebrow">매칭 서비스</span>
          <h1 className="estimate-hero-title">
            근처 최고의 시공 업자와<br />매칭해보세요
          </h1>
          <p className="estimate-hero-desc">
            AI 견적서, 지역 기반으로 근처 최고의<br />시공 업자와 매칭해드립니다
          </p>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="estimate-hero-carousel"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {previewImages.map((img, index) => (
            <div
              key={index}
              className={`estimate-hero-slide ${activeIndex === index ? 'is-active' : ''}`}
            >
              <div className="estimate-hero-frame">
                <img
                  src={img}
                  alt={`미리보기 ${index + 1}`}
                  className="estimate-hero-frame-img"
                  draggable="false"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 도트 */}
        <div className="estimate-hero-dots">
          {previewImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goToIndex(i)}
              aria-label={`${i + 1}번째 미리보기`}
              className={`estimate-hero-dot ${activeIndex === i ? 'is-active' : ''}`}
            />
          ))}
        </div>

        <div className="estimate-hero-actions">
          <PrimaryButton onClick={onClick}>{buttonLabel}</PrimaryButton>
        </div>
      </div>
      </div>
    </CustomerPage>
  )
}

export function MatchingHomePage({ go }) {
  const flow = useCustomerFlow()
  const [matchingRequest, setMatchingRequest] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [loadStatus, setLoadStatus] = useState('loading')
  const [cancelStatus, setCancelStatus] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)

  const loadCurrentMatching = async () => {
    setLoadStatus('loading')
    try {
      const data = await api.get('/api/v1/matching-requests?page=1&size=20')

      const activeRequest = (data.items || []).find((item) => (
        ['REQUESTED', 'RECEIVING_QUOTES'].includes(item.matching_status)
      ))

      if (!activeRequest) {
        setMatchingRequest(null)
        setQuotes([])
        setLoadStatus('empty')
        return
      }

      setMatchingRequest(activeRequest)
      flow.updateMatchingFlow({
        matchingRequestId: activeRequest.matching_request_id,
        matchingStatus: activeRequest.matching_status,
      })

      try {
        const quoteData = await api.get(`/api/v1/matching-requests/${activeRequest.matching_request_id}/quotes`)
        setQuotes(quoteData.quotes || [])
      } catch {
        setQuotes([])
      }

      setLoadStatus('loaded')
    } catch {
      setMatchingRequest(null)
      setQuotes([])
      setLoadStatus('error')
    }
  }

  useEffect(() => {
    let ignore = false

    async function run() {
      await loadCurrentMatching()
    }

    if (!ignore) run()

    return () => {
      ignore = true
    }
    // Intentionally run once on mount only: loadCurrentMatching is recreated every
    // render (and closes over `flow`, whose context value is also unmemoized), so
    // adding it here would refetch on every render instead of once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cancelMatching = async () => {
    if (!matchingRequest?.matching_request_id) return
    setCancelStatus('submitting')

    try {
      await api.patch(`/api/v1/matching-requests/${matchingRequest.matching_request_id}/cancel`, {
        cancel_reason: 'CUSTOMER_CANCELLED',
      })
      setShowCancelModal(false)
      setCancelStatus('')
      setMatchingRequest(null)
      setQuotes([])
      flow.updateMatchingFlow({
        matchingRequestId: null,
        matchingStatus: '매칭 취소됨',
        selectedQuoteId: null,
        selectedQuote: null,
        selectedPartner: null,
      })
      setLoadStatus('empty')
    } catch {
      setCancelStatus('error')
    }
  }

  if (loadStatus === 'loading') {
    return (
      <CustomerPage go={go} className="cds--white">
        <div className="estimate-loading">
          <img src={figmaAssets.logoMark} alt="" className="estimate-status-logo" />
          <div className="estimate-loading-spinner" dangerouslySetInnerHTML={{ __html: loadingCarbonSvg }} />
          <p className="estimate-loading-title">진행중인 매칭을 확인하는 중입니다.</p>
        </div>
      </CustomerPage>
    )
  }

  if (loadStatus === 'error') {
    return (
      <CustomerPage go={go} className="cds--white">
        <div className="matching-current">
          <article className="matching-current-card matching-current-card--error">
            <span className="matching-current-eyebrow">매칭 상태</span>
            <h2 className="matching-current-error-title">매칭 정보를 불러오지 못했습니다</h2>
            <p className="matching-current-error-desc">서버 연결 또는 로그인 상태를 확인해주세요.</p>
            <PrimaryButton onClick={loadCurrentMatching}>다시 불러오기</PrimaryButton>
          </article>
        </div>
      </CustomerPage>
    )
  }

  if (!matchingRequest) {
    return (
      <ServiceHero
        onClick={() => go(screens.matchingEstimateSelect)}
        buttonLabel="매칭 시작하기"
        go={go}
      />
    )
  }

  const quotePartners = quotes.map(quoteToPartner)

  return (
    <CustomerPage go={go} className="cds--white">
      <div className="matching-current">
        <h1 className="matching-current-heading">현재 매칭</h1>

        <article className="matching-current-card">
          <div className="matching-current-card-head">
            <div>
              <span className="matching-current-eyebrow">진행중</span>
              <h2>{matchingRequest.title}</h2>
            </div>
            <MatchingStatusBadge status={matchingRequest.matching_status} />
          </div>

          <div className="matching-current-stats">
            <div className="matching-current-stat">
              <span>도착한 견적</span>
              <strong>{quotes.length}개</strong>
            </div>
            <div className="matching-current-stat">
              <span>매칭 요청일</span>
              <strong>{formatDate(matchingRequest.created_at)}</strong>
            </div>
          </div>

          <div className="matching-current-section">
            <h3>견적서 목록</h3>
            {quotePartners.length > 0 ? (
              <div className="matching-current-quotes">
                {quotePartners.map((partner) => (
                  <article className="matching-current-quote" key={partner.quote_id}>
                    <div>
                      <strong>{partner.contractor.business_name}</strong>
                      <p>{partner.work_scope}</p>
                      <small>{partner.arrival_time} · {partner.available_date ? formatDate(partner.available_date) : '날짜 협의'}</small>
                    </div>
                    <div className="matching-current-quote-price">
                      <b>{formatWon(partner.total_amount)}</b>
                      <button type="button" onClick={() => go(screens.matchingAuction)}>자세히</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="matching-current-empty">아직 견적서를 보낸 파트너가 없습니다.</p>
            )}
          </div>

          <div className="matching-current-actions">
            <button type="button" className="matching-current-ghost" onClick={() => setShowCancelModal(true)}>매칭 취소</button>
            <PrimaryButton onClick={() => go(quotes.length > 0 ? screens.matchingAuction : screens.matchingProgress)}>
              {quotes.length > 0 ? '견적 비교하기' : '매칭 상황 보기'}
            </PrimaryButton>
          </div>
          {cancelStatus === 'error' ? <p className="matching-current-error-msg">매칭 취소에 실패했습니다. 다시 시도해주세요.</p> : null}
        </article>

        {showCancelModal ? (
          <div className="modal-overlay matching-modal-overlay">
            <div className="modal-card matching-current-cancel-modal">
              <h3>매칭을 취소할까요?</h3>
              <p>취소하면 이 요청은 더 이상 파트너에게 노출되지 않고, 시공자 화면에서도 진행 가능한 요청으로 보이지 않습니다.</p>
              <div className="matching-current-cancel-actions">
                <button type="button" className="matching-current-ghost" onClick={() => setShowCancelModal(false)}>계속 진행</button>
                <PrimaryButton onClick={cancelMatching}>
                  {cancelStatus === 'submitting' ? '취소중...' : '매칭 취소'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </CustomerPage>
  )
}

export function MatchingEstimateSelectPage({ go }) {
  const flow = useCustomerFlow()
  const [estimates, setEstimates] = useState([])
  const [loadStatus, setLoadStatus] = useState('loading')

  useEffect(() => {
    let ignore = false

    // 💡 1. 견적서 목록 가져오기 주소 수정 완료! 앞에 /api/v1/ 명시 및 후행 슬래시 추가
    api.get('/api/v1/users/me/ai-estimates/?status=COMPLETED&page=1&size=20')
      .then((data) => {
        if (ignore) return
        if (data?.items?.length) {
          setEstimates(data.items)
          setLoadStatus('loaded')
        } else {
          setLoadStatus('empty')
        }
      })
      .catch(() => {
        if (!ignore) {
          setEstimates([])
          setLoadStatus('error')
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

  if (loadStatus === 'loading') {
    return (
      <CustomerPage go={go} back={() => go(screens.matchingHome)} className="cds--white">
        <div className="estimate-loading">
          <img src={figmaAssets.logoMark} alt="" className="estimate-status-logo" />
          <div className="estimate-loading-spinner" dangerouslySetInnerHTML={{ __html: loadingCarbonSvg }} />
          <p className="estimate-loading-title">AI 견적서 불러오는 중...</p>
        </div>
      </CustomerPage>
    )
  }

  if (loadStatus === 'error' || loadStatus === 'empty') {
    return (
      <CustomerPage go={go} back={() => go(screens.matchingHome)} className="cds--white">
        <div className="matching-select-status">
          <div className="matching-select-status-icon" dangerouslySetInnerHTML={{ __html: loadStatus === 'error' ? errorSvg : urgentAlertSvg }} />
          <h2 className="matching-select-status-title">
            {loadStatus === 'error' ? '견적서를 불러오지 못했습니다' : '생성된 AI 견적서가 없습니다'}
          </h2>
          <p className="matching-select-status-desc">
            {loadStatus === 'error' ? '서버 연결 상태를 다시 확인해주세요.' : 'AI 견적서를 새로 만들어 볼까요?'}
          </p>
          <PrimaryButton narrow onClick={() => go(screens.estimateStart)}>AI 견적서 생성</PrimaryButton>
        </div>
      </CustomerPage>
    )
  }

  return (
    <CustomerPage go={go} back={() => go(screens.matchingHome)} className="cds--white">
      <div className="matching-select">
        <h1 className="matching-select-heading">매칭 시작하기</h1>
        <p className="matching-select-subheading">AI 견적서를 선택해주세요</p>

        <div className="matching-select-list">
          {estimates.map((estimate) => (
            <article key={estimate.estimate_id} className="matching-select-card">
              <div className="matching-select-card-head">
                <span className="matching-select-card-date">{formatDate(estimate.created_at)}</span>
                <MatchingStatusBadge status={estimate.estimate_status === 'COMPLETED' ? '완료' : estimate.estimate_status} />
              </div>
              <h3 className="matching-select-card-title">{estimateTitle(estimate)}</h3>
              <p className="matching-select-card-cost">예상 시공 비용 : {estimateCost(estimate)}</p>
              <button type="button" className="matching-select-card-button" onClick={() => selectEstimate(estimate)}>
                매칭 요청하기
              </button>
            </article>
          ))}
        </div>
      </div>
    </CustomerPage>
  )
}

export function MatchingAddressListPage({ go }) {
  const flow = useCustomerFlow()
  const { updateMatchingFlow } = flow
  const selectedAddress = flow.matchingFlow.selectedAddress
  
  // 🔍 검색 API 연동을 위해 새로 추가된 상태(State) 보관함들
  const [keyword, setKeyword] = useState('')         // 유저가 입력창에 치는 검색어
  const [searchResults, setSearchResults] = useState([]) // 서버에서 받아온 주소 결과 리스트
  const [isSearching, setIsSearching] = useState(false)   // API 호출 로딩 상태
  const [error, setError] = useState('')             // 에러 메시지 저장

  // ==========================================
  // 1. 행안부 서버에 주소 데이터 요청하는 함수
  // ==========================================
  const handleSearch = async (e) => {
    if (e) e.preventDefault() // 엔터 쳤을 때 페이지가 새로고침 되는 현상 방지
    if (!keyword.trim()) return alert('검색어를 입력해주세요!')

    setIsSearching(true)
    setError('')
    setSearchResults([])

    try {
      // 💡 jusoApi.js에 구현되어 있던 검색 API 함수를 직접 호출합니다!
      const data = await searchJusoAddresses({ keyword: keyword.trim() })
      
      if (data && data.items) {
        setSearchResults(data.items)
        if (data.items.length === 0) {
          setError('검색 결과가 없습니다. 건물명이나 도로명을 다시 확인해주세요.')
        }
      }
    } catch (err) {
      console.error('주소 검색 실패:', err)
      setError(err.message || '주소 검색 중 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  // ==========================================
  // 2. 검색된 리스트 중 하나를 클릭했을 때 선택하는 함수
  // ==========================================
  const handleSelectAddress = (jusoItem) => {
    // 백엔드 매칭 요청 스키마 양식에 맞게 찰떡같이 구조를 매핑해 줍니다.
    updateMatchingFlow({
      selectedAddress: {
        address_id: jusoItem.bdMgtSn || jusoItem.roadAddr || jusoItem.zipNo, // 건물관리번호를 고유 ID로 활용
        region_code_id: jusoItem.admCd || null,     // 행정구역코드(법정동코드 등)
        address: jusoItem.roadAddr,                 // 전체 도로명 주소
        road_addr_part1: jusoItem.roadAddrPart1 || '',
        address_detail: '',                         // 검색 API 시점에는 상세주소창이 비어있으므로 초기화
        zip_no: jusoItem.zipNo || '',
        adm_cd: jusoItem.admCd || '',
        label: jusoItem.roadAddr,
      },
    })
    
    // 💡 선택이 완료되면 깔끔하게 입력창과 결과 목록을 비워줍니다.
    setSearchResults([])
    setKeyword('')
  }

  const handleAddressDetailChange = (event) => {
    const addressDetail = event.target.value

    updateMatchingFlow((current) => ({
      selectedAddress: current.selectedAddress
        ? {
          ...current.selectedAddress,
          address_detail: addressDetail,
        }
        : null,
    }))
  }

  const clearAddress = () => {
    updateMatchingFlow({ selectedAddress: null })
  }

  return (
    <CustomerPage go={go} back={() => go(screens.matchingEstimateSelect)} className="cds--white">
      <div className="matching-addr-screen">

        <div className="matching-addr-head">
          <h1 className="matching-addr-heading">시공 지역 선택</h1>
          <p className="matching-addr-subheading">시공을 진행할 도로명 주소 또는 건물명을 검색해 주세요!</p>
        </div>

        <form onSubmit={handleSearch} className="matching-addr-search-form">
          <input
            type="text"
            className="matching-addr-search-input"
            placeholder="도로명주소 또는 건물명"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSearching}
            className="matching-addr-search-button"
          >
            {isSearching ? '검색중..' : '검색'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="matching-addr-results">
            <small className="matching-addr-results-count">검색 결과 총 {searchResults.length}건</small>
            {searchResults.map((juso, idx) => (
              <button
                key={idx}
                type="button"
                className="matching-addr-result-item"
                onClick={() => handleSelectAddress(juso)}
              >
                <span className="matching-addr-result-road">{juso.roadAddr}</span>
                {juso.jibunAddr && <span className="matching-addr-result-jibun">[지번] {juso.jibunAddr}</span>}
                <span className="matching-addr-result-zip">우편번호 : {juso.zipNo}</span>
              </button>
            ))}
          </div>
        )}

        {error && <p className="matching-addr-error">{error}</p>}

        <h2 className="matching-addr-section-title">선택된 시공 주소</h2>
        <div className="matching-addr-selected">
          <article className={`matching-addr-selected-card ${selectedAddress ? 'is-selected' : ''}`}>
            <div className="matching-addr-selected-main">
              <div className="matching-addr-selected-icon">
                <FaMapMarkerAlt />
              </div>
              <span className="matching-addr-selected-text">
                {selectedAddress?.address || (
                  <span className="matching-addr-selected-placeholder">
                    위 검색창에서 주소를 검색하고<br />리스트에서 선택해 주세요.
                  </span>
                )}
              </span>
            </div>
            {selectedAddress && (
              <button
                className="matching-addr-remove-button"
                type="button"
                onClick={clearAddress}
              >
                삭제
              </button>
            )}
          </article>
          {selectedAddress && (
            <label className="matching-addr-detail-field">
              <span>상세 주소</span>
              <input
                type="text"
                placeholder="상세 주소 입력 (ex : 202동 301호)"
                value={selectedAddress.address_detail || ''}
                onChange={handleAddressDetailChange}
              />
            </label>
          )}
        </div>

        <div className="matching-addr-actions">
          <PrimaryButton
            onClick={() => {
              if (!selectedAddress) {
                alert('주소를 검색하여 먼저 선택해 주세요!')
                return
              }
              if (!selectedAddress.address_detail?.trim()) {
                alert('상세 주소를 입력해 주세요!')
                return
              }
              go(screens.matchingSchedule)
            }}
          >
            다음 단계로
          </PrimaryButton>
        </div>
      </div>
    </CustomerPage>
  )
}

export function MatchingAddressSelectPage({ go }) {
  return <MatchingAddressListPage go={go} />
}

export function MatchingSchedulePage({ go, openUrgent }) {
  const flow = useCustomerFlow()
  
  const initialDate = flow.matchingFlow.schedule.preferred_date > todayString() 
    ? flow.matchingFlow.schedule.preferred_date 
    : todayString()

  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [selectedSlot, setSelectedSlot] = useState(() => {
    const slot = flow.matchingFlow.schedule.preferred_time_start ? {
      start: flow.matchingFlow.schedule.preferred_time_start,
      end: flow.matchingFlow.schedule.preferred_time_end,
    } : null;
    return (slot && isSlotSelectable(initialDate, slot)) ? slot : null;
  })
  
  const [submitStatus, setSubmitStatus] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedSlot && !isSlotSelectable(selectedDate, selectedSlot)) {
        setSelectedSlot(null)
        setSubmitStatus('expired')
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedDate, selectedSlot])

  const canContinue = Boolean(selectedDate && selectedSlot && isSlotSelectable(selectedDate, selectedSlot))

  const startMatching = async () => {
    if (!canContinue || submitStatus === 'submitting') return
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

    setSubmitStatus('submitting')

    try {
      const body = buildMatchingRequestBody({ estimate, address, schedule, isEmergency: false })
      const data = await api.post('/api/v1/matching-requests', body)
      
      flow.updateMatchingFlow({
        isEmergency: false,
        matchingStatus: data.matching_status || '매칭 진행중',
        schedule,
        matchingRequestId: data.matching_request_id,
        matchedContractorCount: data.matched_contractor_count,
        matchingExpiresAt: data.expires_at,
      })
    } catch {
      setSubmitStatus('error')
      return
    }
    go(screens.matchingProgress)
  }

  return (
    <CustomerPage go={go} back={() => go(screens.matchingAddressList)} className="cds--white">
      <div className="matching-schedule-screen">
        <div className="matching-schedule-top">
          <h1 className="matching-schedule-heading">
            시공을 예약할 날짜와<br />시간을 선택해주세요
          </h1>

          <div className="matching-schedule-fields">
            <div className="matching-schedule-field">
              <div className="matching-schedule-field-icon">
                <FaRegCalendarAlt />
              </div>
              <input
                className="matching-schedule-input"
                type="date"
                min={todayString()}
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.target.value)
                  setSelectedSlot(null)
                  setSubmitStatus('')
                }}
              />
            </div>

            <div className="matching-schedule-field">
              <div className="matching-schedule-field-icon">
                <FaRegClock />
              </div>
              <div className="matching-schedule-select-wrap">
                <select
                  className={`matching-schedule-select ${!selectedSlot ? 'is-placeholder' : ''}`}
                  value={selectedSlot ? selectedSlot.start : ''}
                  onChange={(e) => {
                    setSubmitStatus('')
                    const val = e.target.value;
                    if (!val) {
                      setSelectedSlot(null);
                      return;
                    }
                    const slot = timeSlots.find(s => s.start === val);
                    setSelectedSlot(slot);
                  }}
                >
                  <option value="" disabled hidden>시간을 선택해주세요</option>
                  {timeSlots.map((slot) => {
                    const disabled = !isSlotSelectable(selectedDate, slot)
                    return (
                      <option key={slot.start} value={slot.start} disabled={disabled}>
                        {slot.start} - {slot.end} {disabled ? '(마감)' : ''}
                      </option>
                    )
                  })}
                </select>
                <FaChevronDown className="matching-schedule-select-caret" />
              </div>
            </div>
          </div>
        </div>

        <div className="matching-schedule-bottom">
          <button
            type="button"
            className="matching-schedule-emergency"
            onClick={openUrgent}
          >
            <FaExclamationTriangle className="matching-schedule-emergency-icon" />
            <span>긴급 수리 요청</span>
          </button>

          {submitStatus === 'expired' && <p className="matching-schedule-status is-error">선택하신 시간이 방금 마감되었습니다. 다른 시간을 골라주세요!</p>}
          {submitStatus === 'submitting' && <p className="matching-schedule-status">매칭 요청을 생성하는 중입니다.</p>}
          {submitStatus === 'missing-estimate' && <p className="matching-schedule-status is-error">AI 견적서를 먼저 선택해주세요.</p>}
          {submitStatus === 'missing-address' && <p className="matching-schedule-status is-error">도로명 주소 검색으로 지역 코드가 포함된 주소를 선택해주세요.</p>}
          {submitStatus === 'error' && <p className="matching-schedule-status is-error">매칭 요청 생성에 실패했습니다.</p>}

          <div className="matching-schedule-actions">
            <button type="button" className="matching-schedule-cancel" onClick={() => go(screens.matchingAddressList)}>
              취소
            </button>
            <button
              type="button"
              className={`matching-schedule-submit ${canContinue ? 'is-active' : ''}`}
              onClick={startMatching}
              disabled={!canContinue || submitStatus === 'submitting'}
            >
              {submitStatus === 'submitting' ? '요청중...' : canContinue ? '매칭 시작하기' : '시간 선택 필요'}
            </button>
          </div>
        </div>
      </div>
    </CustomerPage>
  )
}

export function MatchingProgressPage({ go }) {
  const flow = useCustomerFlow()
  const { updateMatchingFlow } = flow
  const matchingRequestId = flow.matchingFlow.matchingRequestId

useEffect(() => {
    let ignore = false
    let pollTimer

    const checkQuotes = async () => {

      try {
        const data = await api.get(`/api/v1/matching-requests/${matchingRequestId}/quotes`)
        
        if (data?.quotes?.length > 0) {
          if (!ignore) {
            clearInterval(pollTimer) 
            updateMatchingFlow({ matchingStatus: '견적 도착' })
            go(screens.matchingAuction) 
          }
        }
      } catch (e) {
        console.error('견적 확인 중 오류:', e)
      }
    }

    checkQuotes()
    
    pollTimer = setInterval(checkQuotes, 2000)

    return () => {
      ignore = true
      clearInterval(pollTimer)
    }
  }, [go, updateMatchingFlow, matchingRequestId])

  return (
    <section className="estimate-loading">
      <img src={figmaAssets.logoMark} alt="" className="estimate-status-logo" />
      <div className="estimate-loading-spinner" dangerouslySetInnerHTML={{ __html: loadingCarbonSvg }} />
      <h2 className="estimate-loading-title">매칭 진행중 ...</h2>
      <p className="estimate-loading-desc matching-progress-desc">
        <span className="matching-progress-desc-main">조건에 맞는 파트너의 견적을 기다리는 중 ...</span>
        <span className="matching-progress-desc-sub">이 화면을 나가셔도 매칭은 계속 진행돼요</span>
      </p>
    </section>
  )
}

export function MatchingAuctionPage({ go }) {
  const flow = useCustomerFlow()
  const [proposalPartner, setProposalPartner] = useState(null)
  const [profilePartner, setProfilePartner] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [partners, setPartners] = useState([])
  const [loadStatus, setLoadStatus] = useState(isMockId(flow.matchingFlow.matchingRequestId) ? 'missing-request' : 'loading')
  const [selectStatus, setSelectStatus] = useState('')
  const matchingRequestId = flow.matchingFlow.matchingRequestId
  const title = estimateTitle(flow.matchingFlow.selectedEstimate)

  useEffect(() => {
    if (isMockId(matchingRequestId)) return

    let ignore = false

    api.get(`/api/v1/matching-requests/${matchingRequestId}/quotes`)
      .then((data) => {
        if (ignore) return
        if (data?.quotes?.length) {
          setPartners(data.quotes.map(quoteToPartner))
          setLoadStatus('loaded')
        } else {
          setPartners([])
          setLoadStatus('empty')
        }
      })
      .catch(() => {
        if (!ignore) {
          setPartners([])
          setLoadStatus('error')
        }
      })

    return () => {
      ignore = true
    }
  }, [matchingRequestId])

  // 💡 5. 특정 파트너 수락(선택) 주소 앞에도 /api/v1/ 적용
  const selectPartner = async (partner) => {
    if (isSelecting) return
    setIsSelecting(true)

    try {
      const data = await api.post(`/api/v1/matching-requests/${matchingRequestId}/select-quote`, {
        quote_id: partner.quote_id,
      })
      
      flow.updateMatchingFlow({
        selectedQuoteId: data.selected_quote_id || partner.quote_id,
        selectedQuote: partner,
        selectedPartner: partner,
        workOrderId: data.work_order_id,
        matchingStatus: data.matching_status || '파트너 선택 완료',
        hasCompletedMatching: true,
      })
      setProposalPartner(null)
      go(screens.matchingDone)
    } catch {
      setSelectStatus('error')
    } finally {
      setIsSelecting(false)
    }
  }

  return (
    <CustomerPage go={go} back={() => go(screens.matchingHome)} className="cds--white">
      <div className="matching-auction-screen">
        <h1 className="matching-auction-title">{title}</h1>

        {loadStatus === 'loading' ? <p className="matching-auction-status">파트너 견적을 불러오는 중입니다.</p> : null}
        {loadStatus === 'missing-request' ? <p className="matching-auction-status is-error">매칭 요청 ID가 없어 견적 목록을 불러올 수 없습니다.</p> : null}
        {loadStatus === 'error' ? <p className="matching-auction-status is-error">파트너 견적을 불러오지 못했습니다. 서버 연결을 확인해주세요.</p> : null}
        {loadStatus === 'empty' ? <p className="matching-auction-status">도착한 견적이 아직 없어요.</p> : null}
        {selectStatus === 'error' ? <p className="matching-auction-status is-error">파트너 선택에 실패했습니다. 다시 시도해주세요.</p> : null}

        <div className="matching-auction-list">
          {partners.map((partner) => (
            <div key={partner.quote_id} className="matching-auction-card-enter">
              <PartnerCard
                partner={partner}
                onOpenProposal={setProposalPartner}
                onOpenProfile={setProfilePartner}
              />
            </div>
          ))}
          {partners.length > 0 && (
            <div className="matching-auction-summary">
              <div className="matching-auction-summary-row">
                <span>{formatDate(flow.matchingFlow.schedule.preferred_date)}</span>
                <span>대기중인 파트너 : {partners.length}명</span>
              </div>
              <p className="matching-auction-summary-hint">파트너 카드를 눌러 상세 제안을 확인하세요</p>
              <small className="matching-auction-summary-hint">기다리시면 추가 매칭이 진행될 수 있어요</small>
            </div>
          )}
        </div>

        <ProposalModal partner={proposalPartner} onClose={() => setProposalPartner(null)} onSelect={selectPartner} isSelecting={isSelecting} />
        <ProfileModal partner={profilePartner} onClose={() => setProfilePartner(null)} />
      </div>
    </CustomerPage>
  )
}

export function MatchingPartnerPage({ go }) {
  const flow = useCustomerFlow()
  const partner = flow.matchingFlow.selectedPartner

  return (
    <CustomerPage go={go} back={() => go(screens.matchingAuction)} className="cds--white">
      <div className="matching-current">
        {!partner ? (
          <p className="matching-current-empty">선택된 파트너 제안이 없습니다.</p>
        ) : (
          <ProposalModal partner={partner} onClose={() => go(screens.matchingAuction)} onSelect={() => go(screens.matchingDone)} inline />
        )}
      </div>
    </CustomerPage>
  )
}

export function MatchingPartnerInfoPage({ go }) {
  const flow = useCustomerFlow()
  const partner = flow.matchingFlow.selectedPartner

  return (
    <CustomerPage go={go} back={() => go(screens.matchingAuction)} className="cds--white">
      <div className="matching-current">
        {!partner ? (
          <p className="matching-current-empty">선택된 파트너 정보가 없습니다.</p>
        ) : (
          <ProfileModal partner={partner} onClose={() => go(screens.matchingAuction)} inline />
        )}
      </div>
    </CustomerPage>
  )
}

export function MatchingDonePage({ go }) {
  const flow = useCustomerFlow()
  const selectedPartner = flow.matchingFlow.selectedPartner
  const estimate = flow.matchingFlow.selectedEstimate
  const address = flow.matchingFlow.selectedAddress
  const schedule = flow.matchingFlow.schedule

  if (!selectedPartner) {
    return (
      <CustomerPage go={go} back={() => go(screens.home)} className="cds--white">
        <div className="matching-current">
          <h1 className="matching-current-heading">현재 매칭</h1>
          <article className="matching-current-card matching-current-card--error">
            <MatchingStatusBadge status={flow.matchingFlow.matchingStatus || '진행중인 매칭 없음'} />
            <h2 className="matching-current-error-title">진행중인 매칭이 없어요</h2>
            <p className="matching-current-error-desc">AI 견적서를 선택하고 주소 정보를 연결한 뒤 매칭을 요청해보세요.</p>
            <PrimaryButton narrow onClick={() => go(screens.matchingEstimateSelect)}>매칭 시작하기</PrimaryButton>
          </article>
        </div>
      </CustomerPage>
    )
  }

  return (
    <CustomerPage go={go} back={() => go(screens.home)} className="cds--white">
      <div className="matching-current">
        <h1 className="matching-current-heading">현재 매칭</h1>
        <article className="matching-current-card">
          <div className="matching-current-card-head">
            <div>
              <MatchingStatusBadge status="시공 예정" />
              <h2>{estimateTitle(estimate)}</h2>
            </div>
            <span>{selectedPartner.available_date}</span>
          </div>

          <div className="matching-current-stats">
            <div className="matching-current-stat">
              <span>AI 견적</span>
              <strong>{estimateCost(estimate)}</strong>
            </div>
            <div className="matching-current-stat">
              <span>확정 금액</span>
              <strong>{formatWon(selectedPartner.total_amount)}</strong>
            </div>
            <div className="matching-current-stat">
              <span>예약 시간</span>
              <strong>{schedule.preferred_time_start ? `${schedule.preferred_time_start} ~ ${schedule.preferred_time_end}` : '긴급 요청'}</strong>
            </div>
            <div className="matching-current-stat">
              <span>예상 소요</span>
              <strong>{estimateMinutesLabel(selectedPartner.estimated_minutes)}</strong>
            </div>
          </div>

          <div className="matching-current-section">
            <h3>시공 주소</h3>
            <p>{address?.address || address?.label || '서울특별시 강남구 테헤란로 123, 101동 202호'}</p>
          </div>

          <div className="matching-current-section">
            <h3>선택한 파트너</h3>
            <div className="matching-done-partner-row">
              <Avatar tone={selectedPartner.avatar} />
              <div>
                <strong>{selectedPartner.contractor.business_name}</strong>
                <PartnerStars rating={selectedPartner.contractor.rating_avg} />
                <p>{selectedPartner.specialty} / 경력 {selectedPartner.career}</p>
                <p>{selectedPartner.contractor.phone}</p>
              </div>
            </div>
          </div>

          <div className="matching-current-section">
            <h3>파트너 제안 내용</h3>
            <p>{selectedPartner.work_scope}</p>
            <p>{selectedPartner.additional_note}</p>
          </div>

          <div className="matching-current-actions">
            <button type="button" className="matching-current-ghost" onClick={() => go(screens.matchingAuction)}>견적 다시 보기</button>
            <PrimaryButton onClick={() => go(screens.chatRoom)}>1:1 채팅 상담</PrimaryButton>
          </div>
        </article>
      </div>
    </CustomerPage>
  )
}

export function ReviewWritePage({ go }) {
  return (
    <section className="review-write-screen cds--white">
      <h1 className="review-write-title">리뷰 작성</h1>
      <div className="mypage-review-partner">
        <Avatar large tone="light" />
        <div>
          <strong>김도배 파트너님</strong>
          <span>★★★★☆ 4.5/5</span>
        </div>
      </div>
      <p className="mypage-review-question">이분의 시공은 어떠셨나요?</p>
      <div className="mypage-review-stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((score) => (
          <button key={score} type="button" disabled>☆</button>
        ))}
      </div>
      <textarea className="mypage-review-textarea" placeholder="이분의 시공은 어땠는지 자세하게 알려주세요." />
      <div className="estimate-result-actions">
        <PrimaryButton ghost onClick={() => go(screens.matchHistory)}>취소</PrimaryButton>
        <PrimaryButton onClick={() => go(screens.myReviews)}>완료</PrimaryButton>
      </div>
    </section>
  )
}

export function UrgentModal({ close, confirm }) {
  return (
    <div className="urgent-modal-overlay">
      <div className="urgent-modal-card">
        <div className="urgent-modal-icon" dangerouslySetInnerHTML={{ __html: urgentAlertSvg }} />
        <h3 className="urgent-modal-title">긴급 수리 요청 선택 시</h3>
        <p className="urgent-modal-desc">최대한 빠르게 시공을 받아볼 수 있으며, <br />추가 비용이 발생할 수 있어요.</p>
        <p className="urgent-modal-confirm-text">진행하시겠습니까?</p>
        <div className="urgent-modal-actions">
          <button type="button" className="urgent-modal-cancel" onClick={close}>취소</button>
          <button type="button" className="urgent-modal-confirm" onClick={confirm}>확인</button>
        </div>
      </div>
    </div>
  )
}

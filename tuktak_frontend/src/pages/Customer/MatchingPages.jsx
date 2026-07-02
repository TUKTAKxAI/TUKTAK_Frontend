import { api } from '../../api/apiClient'
import { useEffect, useState, useRef } from 'react'
import { getJusoPopupUrl, hasJusoConfirmKey, searchJusoAddresses } from '../../api/jusoApi'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { Avatar, PrimaryButton } from '../../components/customer/FormControls'
import { useCustomerFlow } from '../../context/CustomerFlowContext'
import { screens } from '../../data/customerData'
import { figmaAssets } from '../../components/customer/figmaAssets'
import preview9 from '../../assets/figma/preview9.webp';
import preview10 from '../../assets/figma/preview10.webp';
import preview11 from '../../assets/figma/preview11.webp';
import preview12 from '../../assets/figma/preview12.webp';
import loadingSvg from '../../assets/figma/loading.svg?raw';
import errorSvg from "../../assets/figma/error.svg?raw"

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

// 이전에 작성했던 location 방어 코드 로직을 매칭쪽 타이틀 함수에도 안전하게 적용해둡니다.
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
        {/* 💡 X버튼 정중앙 배치 정석 스타일을 여기 모달에도 깔끔하게 적용했습니다 */}
        <button 
          className="modal-close-button flex items-center justify-center" 
          type="button" 
          onClick={onClose}
          style={{ paddingBottom: '2px' }}
        >
          ✕
        </button>
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

  const reviews = partner.reviews || []
  const visibleReviews = reviews.slice(0, visibleCount)

  return (
    <div className="modal-overlay matching-modal-overlay">
      <div className="modal-card profile-modal-card">
        <button className="modal-close-button flex items-center justify-center" type="button" onClick={onClose} style={{ paddingBottom: '2px' }}>✕</button>
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
      </div>
    </div>
  )
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
    <section className="service-hero flex flex-col h-full bg-[#F2F3F5]">
      <CustomerTopBar go={go} />

      <div className="flex flex-col items-center flex-1 py-0">
        <h1 className="text-2xl font-bold text-gray-900 mt-0 text-center">매칭 서비스</h1>
        
        <div className="w-full max-w-125 mx-auto text-left -mt-3 ml-2">
          <h2 className="text-base font-semibold text-gray-700 leading-snug">
            근처 최고의 시공 업자와<br />매칭해보세요
          </h2>
          <p className="text-md font-semibold text-gray-700 mt-8 ml-3 leading-relaxed">
            AI 견적서, 지역 기반으로 근처 최고의<br />시공 업자와 매칭해드립니다
          </p>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide py-8 gap-4 px-[25%] cursor-grab active:cursor-grabbing items-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {previewImages.map((img, index) => (
            <div 
              key={index} 
              className={`min-w-[85%] ml-5 transition-all duration-500 snap-center flex justify-center items-center
                ${activeIndex === index ? 'scale-100 opacity-100' : 'scale-70 opacity-40'}
              `}
            >
              <div className="w-full aspect-9/16 bg-white rounded-3xl shadow-lg border border-gray-300 overflow-hidden">
                 <img 
                   src={img} 
                   alt={`미리보기 ${index + 1}`} 
                   className="w-full h-full object-cover" 
                   draggable="false" 
                 />
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 도트 */}
        <div className="flex justify-center space-x-2 mb-6">
          {previewImages.map((_, i) => (
            <button 
              key={i} 
              onClick={() => goToIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'}`} 
            />
          ))}
        </div>

        <div className="w-full px-6 mt-auto pb-6">
          <PrimaryButton onClick={onClick}>{buttonLabel}</PrimaryButton>
        </div>
      </div>
    </section>
  )
}

export function MatchingHomePage({ go }) {
  return (
    <ServiceHero
      onClick={() => go(screens.matchingEstimateSelect)}
      buttonLabel="매칭 시작하기"
      go={go}
    />
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

  return (
    <section className="selection-screen flex flex-col h-full bg-[#F2F3F5]">
      <CustomerTopBar go={go} />
      
      <div className="flex flex-col flex-1 px-6 pt-4">
        
        <div className="flex items-center mb-0">
          <button 
            className="mr-3 flex items-center justify-center transition-transform active:scale-90" 
            onClick={() => go(screens.matchingHome)}
          >
            <img src={figmaAssets.back} alt="뒤로가기" className="w-6 h-6 object-contain" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 relative bottom-0.5">매칭 시작하기</h1>
        </div>

        <div className="overflow-y-auto pb-6">
          
          {loadStatus === 'loading' ? (
            <div className="flex flex-col items-center justify-center mt-16">
              <div className="w-48 h-48 flex justify-center items-center pointer-events-none mb-4 [&>svg]:w-full [&>svg]:h-full"
                   dangerouslySetInnerHTML={{ __html: loadingSvg }} 
              />
              <p className="text-center text-gray-500 font-medium text-[15px]">AI 견적서 불러오는 중 ...</p>
            </div>
          
          ) : loadStatus === 'error' || loadStatus === 'empty' ? (
            <div className="flex flex-col items-center justify-center mt-16">
              <div className="w-48 h-48 flex justify-center items-center pointer-events-none mb-4 [&>svg]:w-full [&>svg]:h-full"
                   dangerouslySetInnerHTML={{ __html: errorSvg }} 
              />
              <p className="text-center font-bold text-[20px] text-gray-900 mt-1">
                {loadStatus === 'error' ? '견적서를 불러오지 못했습니다!' : '생성된 AI 견적서가 없습니다 !'}
              </p>
              <p className="text-center font-medium text-[15px] text-gray-900 mt-5">
                {loadStatus === 'error' ? '서버 연결 상태를 다시 확인해주세요.' : 'AI 견적서를 새로 만들어 볼까요?'}
              </p>
              <button 
                onClick={() => go(screens.estimateStart)}
                className="w-3/5 bg-[#1C54D4] text-white py-2.5 rounded-lg transition-colors hover:bg-blue-700 mt-2"
                style={{ fontSize: '16px', fontWeight: 'bold' }} 
              >
                AI 견적서 생성
              </button>
            </div>

          ) : (
            <>
              <h2 
                className="text-gray-700 text-center mt-4 mb-6 font-bold"
                style={{ fontSize: '20px' }}
              >
                AI 견적서를 선택해주세요
              </h2>
              {estimates.map((estimate) => (
                <article key={estimate.estimate_id} className="bg-white rounded-[14px] p-5 border border-gray-400 shadow-sm flex flex-col mb-4">
                  
                  <div className="flex justify-between items-start mb-4 border-b border-gray-300 pb-3">
                    <span className="text-[13px] text-gray-500">
                      {formatDate(estimate.created_at)}
                    </span>
                    <small className="text-xs text-blue-500 font-semibold bg-blue-50 px-2 py-1 rounded">
                      {estimate.estimate_status === 'COMPLETED' ? '완료' : estimate.estimate_status}
                    </small>
                  </div>
                  
                  <div className="flex flex-col text-left">
                    <h3 className="text-[22px] font-bold text-gray-900 mb-1.5 tracking-tight">
                      {estimateTitle(estimate)}
                    </h3>
                    <p className="text-[13px] font-bold text-gray-500 mb-4.5">
                      예상 시공 비용 : {estimateCost(estimate)}
                    </p>
                    
                    <div className="flex justify-center w-full">
                      <button 
                        onClick={() => selectEstimate(estimate)}
                        className="w-4/5 bg-[#1C54D4] text-white py-2.5 rounded-lg transition-colors hover:bg-blue-700"
                        style={{ fontSize: '16px', fontWeight: 'bold' }} 
                      >
                        매칭 요청하기
                      </button>
                    </div>
                  </div>

                </article>
              ))}
            </>
          )}
        </div>

      </div>
    </section>
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
        address_id: jusoItem.bdMgtSn || Date.now(), // 건물관리번호를 고유 ID로 활용
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

  const clearAddress = () => {
    updateMatchingFlow({ selectedAddress: null })
  }

  return (
    <section className="selection-screen flex flex-col h-full bg-[#F2F3F5] px-6 pt-4 pb-10 overflow-y-auto">
      <CustomerTopBar go={go} />
      
      {/* 상단 헤더 영역 */}
      <div className="flex items-center mb-6">
        <button 
          className="mr-3 flex items-center justify-center transition-transform active:scale-90" 
          onClick={() => go(screens.matchingEstimateSelect)}
        >
          <img src={figmaAssets.back} alt="뒤로가기" className="w-6 h-6 object-contain" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 relative bottom-0.5">시공 지역 선택</h1>
      </div>

      <p className="text-xs font-medium text-center text-gray-700 mt-5 mb-9">시공을 진행할 도로명 주소 또는 건물명을 검색해 주세요!</p>

      {/* 🛠️ 1. 주소 텍스트 입력 폼 (검색창 디자인) */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4 w-full">
        <input 
          type="text" 
          className="flex-1 px-4 py-2.5 border border-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="도로명주소 또는 건물명"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button 
          type="submit"
          disabled={isSearching}
          className="px-5 bg-[#1C54D4] text-white font-bold rounded-xl text-sm transition-colors hover:bg-blue-700 whitespace-nowrap disabled:bg-gray-400"
        >
          {isSearching ? '검색중..' : '검색'}
        </button>
      </form>

      {/* 🛠️ 2. 데이터 수신 성공 시 화면에 뿌려지는 '검색 결과 리스트 박스' */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-300 p-2 max-h-60 overflow-y-auto mb-6 space-y-1 shadow-sm">
          <small className="text-gray-400 px-2 block mb-1 font-medium">검색 결과 총 {searchResults.length}건</small>
          {searchResults.map((juso, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left px-3 py-2.5 hover:bg-blue-50 rounded-lg transition-colors border-b border-gray-100 last:border-0 flex flex-col gap-0.5"
              onClick={() => handleSelectAddress(juso)}
            >
              <span className="text-[14px] font-semibold text-gray-900">{juso.roadAddr}</span>
              {juso.jibunAddr && <span className="text-[11px] text-gray-400">[지번] {juso.jibunAddr}</span>}
              <span className="text-[11px] text-blue-500 font-medium">우편번호 : {juso.zipNo}</span>
            </button>
          ))}
        </div>
      )}

      {/* 안내 및 에러 메시지 창 */}
      {error && <p className="text-center text-sm font-medium text-red-500 mb-6">{error}</p>}

      {/* 🛠️ 3. 최종 선택 완료된 주소가 박히는 인라인 카드 */}
      <h2 className="text-base font-bold text-gray-800 mb-3 mt-2">선택된 시공 주소</h2>
      <div className="address-list matching-address-list mb-auto">
        <article className={`bg-white rounded-[14px] p-3 border border-gray-400 shadow-sm flex items-center justify-between transition-all ${selectedAddress ? 'border-blue-500 bg-blue-50/20' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="address-icon house p-3 bg-contain bg-no-repeat" />
            <span className="text-[14px] text-gray-800 font-medium leading-tight">
              {selectedAddress?.address || (
                <>
                  위 검색창에서 주소를 검색하고<br />리스트에서 선택해 주세요.
                </>
              )}
            </span>
          </div>
          {selectedAddress && (
            <button 
              className="text-red-500 font-bold border border-red-200 px-3 py-2 rounded bg-white hover:bg-red-50 transition-colors" 
              type="button" 
              onClick={clearAddress}
              style={{ fontSize:"15px", whiteSpace: 'nowrap' }}
            >
              삭제
            </button>
          )}
        </article>
      </div>

      {/* 다음 단계 이동 액션 하단바 */}
      <div className="pt-6 w-full">
        <PrimaryButton 
          narrow 
          onClick={() => selectedAddress ? go(screens.matchingSchedule) : alert('주소를 검색하여 먼저 선택해 주세요!')}
        >
          다음 단계로
        </PrimaryButton>
      </div>
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

  // 💡 2. 일반 매칭 요청 (POST) -> /api/v1/matching-requests 로 라우터 매핑 수정 완료!
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

  // 💡 3. 긴급 매칭 요청 (POST) -> /api/v1/matching-requests 로 라우터 매핑 수정 완료!
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

    setSubmitStatus('submitting')

    try {
      const body = buildMatchingRequestBody({ estimate, address, schedule, isEmergency: true })
      const data = await api.post('/api/v1/matching-requests', body)
      
      flow.updateMatchingFlow({
        isEmergency: true,
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
    <section className="selection-screen schedule-screen flex flex-col h-full bg-[#F2F3F5] px-6 pt-4 pb-10">
      {/* 1. 상단 뒤로가기 버튼 */}
      <div className="flex items-center mb-10">
        <button 
          className="mr-3 flex items-center justify-center transition-transform active:scale-90" 
          onClick={() => go(screens.matchingAddressList)}
        >
          <img src={figmaAssets.back} alt="뒤로가기" className="w-6 h-6 object-contain" />
        </button>
      </div>

      {/* 2. 메인 타이틀 (가운데 정렬 및 줄바꿈 적용) */}
      <h1 className="text-[30px] font-medium text-gray-900 text-center leading-snug pt-10 pb-14"
        style={{ WebkitTextStroke: '0.5px currentColor' }}>
        시공을 예약할 날짜와<br />시간을 선택해주세요
      </h1>

      <div className="flex flex-col gap-6 px-2 pt-18">
        
        {/* 3. 날짜 선택 영역 */}
        <div className="flex items-center gap-4">
          {/* 달력 아이콘 (시안과 동일한 SVG) */}
          <div className="w-12 h-12 shrink-0 flex items-center justify-center">
            <img src={figmaAssets.calendar} alt="달력 아이콘" className="w-12 h-12 object-contain" />
          </div>
          <input 
            className="flex-1 border border-gray-600 rounded-xl px-4 py-2.5 text-[17px] bg-white focus:outline-none" 
            type="date" 
            min={todayString()} 
            value={selectedDate} 
            onChange={(event) => {
              setSelectedDate(event.target.value)
              setSelectedSlot(null)
            }} 
          />
        </div>

        {/* 4. 시간 선택 영역 (드롭다운 Select 박스로 교체) */}
        <div className="flex items-center gap-4">
          {/* 시계 아이콘 (시안과 동일한 SVG) */}
          <div className="w-12 h-12 shrink-0 flex items-center justify-center">
            <img src={figmaAssets.clock} alt="시계 아이콘" className="w-10 h-10 object-contain" />
          </div>
          <div className="relative flex-1">
            <select 
              className="w-full border border-gray-600 rounded-xl px-4 py-2.5 text-[17px] bg-white focus:outline-none appearance-none"
              value={selectedSlot ? selectedSlot.start : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setSelectedSlot(null);
                  return;
                }
                const slot = timeSlots.find(s => s.start === val);
                setSelectedSlot(slot);
              }}
            >
              <option value="" disabled>시간을 선택해주세요</option>
              {timeSlots.map((slot) => {
                const disabled = !isSlotSelectable(selectedDate, slot)
                return (
                  <option key={slot.start} value={slot.start} disabled={disabled}>
                    {slot.start}-{slot.end} {disabled ? '(마감)' : ''}
                  </option>
                )
              })}
            </select>
            {/* 커스텀 화살표 아이콘 */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black text-sm">
              ▼
            </div>
          </div>
        </div>

      </div>

      {/* 5. 하단 영역 (긴급 배너 & 확인 버튼들) */}
      <div className="mt-35 pt-10 flex flex-col gap-5">
        
        {/* 긴급 수리 요청 배너 */}
        <button 
          className="w-full bg-[#FF8989] text-black font-bold text-[22px] py-4 flex items-center justify-center gap-3 active:bg-[#FF7373] transition-colors"
          onClick={openUrgent || startEmergency}
        >
          <img src={figmaAssets.siren} alt="긴급 수리 아이콘" className="w-8 h-8" /> 
          <span 
          style={{ fontSize:'24px', fontWeight: 'bold' }}>긴급 수리 요청</span>
        </button>

        {/* 상태 메시지 출력 (오류나 로딩 시에만 보임) */}
        {submitStatus === 'submitting' && <p className="text-center text-sm font-medium text-gray-500">매칭 요청을 생성하는 중입니다.</p>}
        {submitStatus === 'missing-estimate' && <p className="text-center text-sm font-medium text-red-500">AI 견적서를 먼저 선택해주세요.</p>}
        {submitStatus === 'missing-address' && <p className="text-center text-sm font-medium text-red-500">도로명 주소 검색으로 지역 코드가 포함된 주소를 선택해주세요.</p>}
        {submitStatus === 'error' && <p className="text-center text-sm font-medium text-red-500">매칭 요청 생성에 실패했습니다.</p>}

        {/* 취소 & 매칭 시작하기 버튼 */}
        <div className="flex gap-3">
          <button 
            className="flex-1 bg-[#EB5E0B] text-white font-bold py-4 rounded-[14px] text-[17px] active:scale-95 transition-transform"
            onClick={() => go(screens.matchingAddressList)}
          >
            취소
          </button>
          <button 
            className={`flex-1 font-bold py-4 rounded-[14px] text-[17px] active:scale-95 transition-transform ${canContinue ? 'bg-[#1C54D4] text-white' : 'bg-gray-400 text-white cursor-not-allowed'}`}
            onClick={startMatching}
            disabled={!canContinue && submitStatus !== 'submitting'}
          >
            {submitStatus === 'submitting' ? '요청중...' : canContinue ? '매칭 시작하기' : '시간 선택 필요'}
          </button>
        </div>
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
  const [partners, setPartners] = useState([])
  const [loadStatus, setLoadStatus] = useState(isMockId(flow.matchingFlow.matchingRequestId) ? 'missing-request' : 'loading')
  const [selectStatus, setSelectStatus] = useState('')
  const matchingRequestId = flow.matchingFlow.matchingRequestId
  const title = estimateTitle(flow.matchingFlow.selectedEstimate)

  // 💡 4. 도착 견적 목록 조회 주소 앞에도 /api/v1/ 적용
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
    setIsSelecting(true)

    try {
      const data = await api.post(`/api/v1/matching-requests/${matchingRequestId}/quotes/${partner.quote_id}/select`)
      
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
    <section className="selection-screen auction-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.matchingProgress)}>‹</button>
      <h1>{title}</h1>
      {loadStatus === 'loading' ? <p className="muted center">파트너 견적을 불러오는 중입니다.</p> : null}
      {loadStatus === 'missing-request' ? <p className="muted center">매칭 요청 ID가 없어 견적 목록을 불러올 수 없습니다.</p> : null}
      {loadStatus === 'error' ? <p className="muted center">파트너 견적을 불러오지 못했습니다. 서버 연결을 확인해주세요.</p> : null}
      {loadStatus === 'empty' ? <p className="muted center">도착한 견적이 아직 없어요.</p> : null}
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
      <ProposalModal partner={proposalPartner} onClose={() => setProposalPartner(null)} onSelect={selectPartner} isSelecting={isSelecting} />
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

export function MatchingDonePage({ go }) {
  const flow = useCustomerFlow()
  const selectedPartner = flow.matchingFlow.selectedPartner
  const estimate = flow.matchingFlow.selectedEstimate
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
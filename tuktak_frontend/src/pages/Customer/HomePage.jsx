import { useEffect, useState } from 'react'
import {
  defaultHomeAddress,
  defaultNearbySummary,
  fetchActiveWorkSummary,
  fetchHomeAddress,
  fetchNearbySummary,
  getDistrictFromAddress,
  saveHomeAddress,
} from '../../api/homeApi'
import { JusoSearchModal } from '../../components/customer/JusoSearchModal'
import { CustomerPage } from './CustomerPageShared'
import { screens } from '../../data/customerData'
import { screenPaths } from '../../routes/customerRoutes'
import { useNavigate } from 'react-router-dom'
import {
  FaCamera,
  FaExclamationTriangle,
  FaHandshake,
  FaMapMarkerAlt,
  FaChevronRight,
  FaChevronDown,
  FaSearch,
  FaHardHat,
  FaTimes,
  FaPen,
} from 'react-icons/fa'

// 최신 리뷰 탭에서 사용할 카테고리 목록
const reviewCategories = ['도어락', '목공', '배관', '보일러', '전기']

// 홈 화면의 '서비스 절차' 카드에 보여줄 고정 안내 데이터
const serviceSteps = [
  ['01', 'photo', '사진 업로드', '수리할 곳을 찍고 설명을 남겨요.'],
  ['02', 'ai', 'AI 견적', '예상 비용과 작업 시간을 확인해요.'],
  ['03', 'risk', '리스크 확인', '추가 비용과 주의사항을 미리 봐요.'],
  ['04', 'match', '파트너 매칭', '조건에 맞는 시공자와 연결돼요.'],
]

// 진행중 시공 API 연결 전 홈 화면 시안 확인용 기본값
const defaultActiveMatching = {
  status: '진행중',
}

const defaultActiveMatchingCount = 1

// 홈 화면 최신 리뷰 임시 데이터
// 카테고리별로 리뷰 목록을 분리해서 탭 클릭 시 해당 리뷰만 보여줌
const homeReviews = {
  도어락: [
    {
      time: '3분 전',
      rating: 5,
      partner: '홍길동 파트너',
      title: '도어락 수리',
      area: '관악구',
      category: '도어락',
      body: '도어락이 갑자기 고장나서 당황스러웠는데, 빠르게 방문해주셔서 바로 해결됐어요.',
    },
    {
      time: '5분 전',
      rating: 5,
      partner: '김어락 파트너',
      title: '현관 도어락 교체',
      area: '동작구',
      category: '도어락',
      body: '설명도 친절했고 마감도 깔끔했습니다. 다음에도 같은 분께 맡기고 싶어요.',
    },
  ],
  목공: [
    {
      time: '12분 전',
      rating: 5,
      partner: '박목수 파트너',
      title: '거실 몰딩 시공',
      area: '관악구',
      category: '목공',
      body: '색상 맞춤까지 꼼꼼하게 확인해주셔서 기존 인테리어랑 자연스럽게 이어졌어요.',
    },
  ],
  배관: [
    {
      time: '18분 전',
      rating: 4,
      partner: '이배관 파트너',
      title: '싱크대 누수 점검',
      area: '서초구',
      category: '배관',
      body: '원인을 바로 찾아주셨고 추가 비용 설명도 먼저 해주셔서 믿고 진행했습니다.',
    },
  ],
  보일러: [
    {
      time: '24분 전',
      rating: 5,
      partner: '최난방 파트너',
      title: '보일러 온수 점검',
      area: '관악구',
      category: '보일러',
      body: '점검 후 사용 방법까지 알려주셔서 좋았습니다. 겨울 전에 확인하길 잘했어요.',
    },
  ],
  전기: [
    {
      time: '31분 전',
      rating: 5,
      partner: '정전기 파트너',
      title: '조명 스위치 교체',
      area: '금천구',
      category: '전기',
      body: '짧은 시간 안에 깔끔하게 끝났고 주변 정리까지 해주셔서 만족스러웠습니다.',
    },
  ],
}

// 별점 표시용 컴포넌트
// rating 숫자만큼 ★, 나머지는 ☆로 채워 5개를 항상 보여줌
function StarRating({ rating }) {
  return (
    <span className="home-stars">
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
      <em>{rating}/5</em>
    </span>
  )
}

// 홈 화면 전체 컴포넌트
// go 함수는 다른 화면으로 이동할 때 사용함
export function HomePage({ go }) {
  const navigate = useNavigate()
  // 현재 선택된 최신 리뷰 카테고리
  const [activeCategory, setActiveCategory] = useState(reviewCategories[0])
  // 현재 설정된 사용자 주소
  const [selectedAddress, setSelectedAddress] = useState(defaultHomeAddress)
  // 현재 주소 기준 근처 시공자 요약 정보
  const [nearbySummary, setNearbySummary] = useState(defaultNearbySummary)
  // 주소 관리 모달 열림 여부
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  // 주소 검색 모달(JusoSearchModal) 열림 여부
  const [showAddressSearch, setShowAddressSearch] = useState(false)
  // 주소 검색/저장 과정에서 발생한 에러 메시지
  const [addressError, setAddressError] = useState('')
  // 진행중 시공 요약. undefined는 API 확인 전 상태라서 임의 카드를 보여주지 않음
  const [activeMatching, setActiveMatching] = useState(undefined)
  const [activeMatchingCount, setActiveMatchingCount] = useState(0)
  // 현재 선택된 카테고리에 해당하는 리뷰만 화면에 표시
  const visibleReviews = homeReviews[activeCategory] ?? []
  // 홈 화면 최초 진입 시 저장된 주소와 근처 시공자 정보를 불러옴
  useEffect(() => {
    let ignore = false

    // 주소 조회 후, 해당 주소 기준 근처 시공자 요약 정보를 조회
    async function loadHomeAddress() {
      const address = await fetchHomeAddress()
      if (ignore) return

      setSelectedAddress(address)
      const summary = await fetchNearbySummary(address)
      if (!ignore) setNearbySummary(summary)
    }

    loadHomeAddress()
    // 컴포넌트가 사라진 뒤 비동기 응답이 늦게 도착해도 state 변경을 막기 위한 정리 함수
    return () => {
      ignore = true
    }
  }, [])

  // 진행중 시공 요약 조회. 매칭 히스토리와 같은 work-orders 데이터를 기준으로 계산함
  useEffect(() => {
    let ignore = false

    async function loadActiveMatching() {
      const summary = await fetchActiveWorkSummary()
      if (ignore) return

      if (summary.hasActiveWork) {
        setActiveMatching(defaultActiveMatching)
        setActiveMatchingCount(summary.activeCount || defaultActiveMatchingCount)
      } else {
        setActiveMatching(null)
        setActiveMatchingCount(0)
      }
    }

    loadActiveMatching()
    return () => {
      ignore = true
    }
  }, [])

  // JusoSearchModal에서 주소를 선택했을 때 처리함 (다른 페이지들과 동일한 주소 검색 API 사용)
  const handleAddressSelect = async (item) => {
    // 검색 결과 항목을 홈 화면에서 쓰는 주소 객체 형태로 변환
    const nextAddress = {
      district: getDistrictFromAddress(item.roadAddr),
      title: item.roadAddrPart1 || item.roadAddr,
      detail: item.roadAddr,
      zipNo: item.zipNo || '',
      regionCodeId: item.admCd || null,
    }

    // 선택된 주소를 화면에 반영하고 모달을 닫음
    setSelectedAddress(nextAddress)
    setAddressError('')
    setShowAddressSearch(false)
    setIsAddressModalOpen(false)

    // 선택한 주소를 저장한 뒤, 새 주소 기준으로 근처 시공자 정보를 다시 조회
    const savedAddress = await saveHomeAddress(nextAddress)
    const summary = await fetchNearbySummary(savedAddress)
    setNearbySummary(summary)
  }

  return (
    <CustomerPage go={go} className="cds--white">

      {activeMatching === undefined ? (
        <div className="home-hero-skeleton" aria-hidden="true" />
      ) : activeMatching ? (
        // 진행중 시공 카드: 매칭 히스토리로 이동하면서 진행중 필터를 자동 선택
        <button
          className="home-hero home-hero-progress"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            navigate(screenPaths[screens.matchHistory], {
              state: { statusFilter: '진행중' },
            })
          }}
        >
          <div className="home-hero-body">
            <span className="home-hero-eyebrow">{activeMatching.status}</span>
            <h2 className="home-hero-title">진행중인 시공이 있어요</h2>
            <p className="home-hero-desc">현재 시공은 매칭 히스토리에서 확인하고, 새 견적도 바로 받을 수 있어요.</p>
            <span className="home-hero-cta">진행중인 시공 보기 <FaChevronRight aria-hidden="true" /></span>
          </div>
          <div
            className="home-hero-stat"
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation()
              navigate(screenPaths[screens.matchHistory], {
                state: { statusFilter: '진행중' },
              })
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.stopPropagation()
                navigate(screenPaths[screens.matchHistory], {
                  state: { statusFilter: '진행중' },
                })
              }
            }}
          >
            <strong>진행중</strong>
            <small>{activeMatchingCount}건</small>
          </div>
        </button>
      ) : (
        // 메인 CTA 카드: AI 견적 시작 화면으로 이동
        <button className="home-hero" type="button" onClick={() => go(screens.estimateHome)}>
          <div className="home-hero-body">
            <span className="home-hero-eyebrow">AI 견적 시작</span>
            <h2 className="home-hero-title">수리가 필요하다면?</h2>
            <p className="home-hero-desc">사진과 설명을 올리면 예상 비용과 시간을 확인할 수 있어요.</p>
            <span className="home-hero-cta">무료 AI 견적 받기 <FaChevronRight aria-hidden="true" /></span>
          </div>
          <div className="home-hero-stat">
            <strong>AI</strong>
            <small>무료 AI 견적 3회</small>
          </div>
        </button>
      )}

      {/* 근처 시공자 요약 카드: 매칭 홈으로 이동 */}
      <button className="home-location-tile" type="button" onClick={() => go(screens.matchingHome)}>
        {/* 주소 영역만 클릭하면 카드 이동 대신 주소 관리 모달을 열어야 하므로 이벤트 전파를 막음 */}
        <div
          className="home-location-row"
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation()
            setIsAddressModalOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              event.stopPropagation()
              setIsAddressModalOpen(true)
            }
          }}
        >
          <FaMapMarkerAlt className="home-location-pin" aria-hidden="true" />
          <span>{selectedAddress.district}</span>
          <FaChevronDown className="home-location-caret" aria-hidden="true" />
        </div>
        <div className="home-worker-row">
          <span className="home-worker-icon" aria-hidden="true"><FaHardHat /></span>
          <h2>근처 {nearbySummary.contractorCount}명의 시공자가 작업을 <br />기다리고 있어요</h2>
        </div>
        <p>내 주변 가능한 파트너를 빠르게 확인해보세요.</p>
      </button>

      {/* 서비스 절차 안내 섹션 */}
      <section className="home-steps">
        <div className="home-section-head">
          <h2>서비스 절차</h2>
        </div>
        <div className="home-steps-scroll">
          {/* serviceSteps 배열을 가로 스와이프 타일 UI로 반복 렌더링 */}
          {serviceSteps.map(([step, icon, title, description]) => (
            <article className="home-step-tile" key={step}>
              <span className="home-step-icon" aria-hidden="true">
                {icon === 'photo' ? <FaCamera /> : null}
                {icon === 'ai' ? 'AI' : null}
                {icon === 'risk' ? <FaExclamationTriangle /> : null}
                {icon === 'match' ? <FaHandshake /> : null}
              </span>
              <span className="home-step-index">STEP {step}</span>
              <strong className="home-step-title">{title}</strong>
              <p className="home-step-desc">{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 최신 리뷰 섹션 */}
      <section className="home-reviews">
        <div className="home-section-head">
          <h2>최신 리뷰</h2>
          <button className="home-section-link" type="button" onClick={() => go(screens.myReviews)}>
            내 리뷰 <FaChevronRight aria-hidden="true" />
          </button>
        </div>
        <div className="home-reviews-tabs">
          {/* 리뷰 카테고리 탭 */}
          {reviewCategories.map((category) => (
            <button
              className={activeCategory === category ? 'active' : ''}
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="home-reviews-list">
          {/* 선택된 카테고리의 리뷰 목록 */}
          {visibleReviews.map((review) => (
            <article className="home-review-row" key={`${review.partner}-${review.time}`}>
              <div className="home-review-meta">
                <div>
                  <small>{review.time}</small>
                  <StarRating rating={review.rating} />
                </div>
                <div className="home-review-title">
                  <strong>{review.partner}</strong>
                  <h3>{review.title}</h3>
                </div>
              </div>
              <div className="home-review-tags">
                <span>{review.area}</span>
                <span>{review.category}</span>
              </div>
              <p>{review.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 주소 관리 모달: 주소 검색 및 현재 주소 확인 */}
      {isAddressModalOpen && (
        <div className="home-address-overlay" role="presentation" onClick={() => setIsAddressModalOpen(false)}>
          <section className="home-address-modal" role="dialog" aria-modal="true" aria-labelledby="home-address-title" onClick={(event) => event.stopPropagation()}>
            <div className="home-address-head">
              <h2 id="home-address-title">주소 관리</h2>
              <button type="button" onClick={() => setIsAddressModalOpen(false)} aria-label="닫기">
                <FaTimes />
              </button>
            </div>
            <button className="home-address-search" type="button" onClick={() => setShowAddressSearch(true)}>
              <FaSearch aria-hidden="true" />
              <strong>도로명, 지번 또는 건물명으로 검색</strong>
            </button>
            {addressError ? <p className="home-address-error">{addressError}</p> : null}
            <div className="home-address-divider" />
            <article className="home-current-address">
              <FaMapMarkerAlt className="home-current-address-icon" aria-hidden="true" />
              <div>
                <em>현재 설정된 주소</em>
                <h3>{selectedAddress.title}</h3>
                <p>{selectedAddress.detail}</p>
              </div>
              <button type="button" onClick={() => setShowAddressSearch(true)} aria-label="주소 수정">
                <FaPen />
              </button>
            </article>
          </section>
        </div>
      )}

      {/* 주소 검색 모달: mypage/profile 등 다른 화면과 동일한 주소 검색 API(JusoSearchModal)를 사용함 */}
      {showAddressSearch ? (
        <JusoSearchModal
          onClose={() => setShowAddressSearch(false)}
          onSelect={handleAddressSelect}
        />
      ) : null}

    </CustomerPage>
  )
}

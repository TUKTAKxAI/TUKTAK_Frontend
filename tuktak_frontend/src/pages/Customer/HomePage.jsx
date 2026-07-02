import { useEffect, useState } from 'react'
import {
  defaultHomeAddress,
  defaultNearbySummary,
  fetchHomeAddress,
  fetchNearbySummary,
  mapJusoPayloadToHomeAddress,
  saveHomeAddress,
} from '../../api/homeApi'
import { getJusoPopupUrl, hasJusoConfirmKey } from '../../api/jusoApi'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { HeaderIcon } from '../../components/customer/CustomerTopBar'
import { Logo } from '../../components/customer/FormControls'
import { screens } from '../../data/customerData'
import notificationEmptyBell from '../../assets/figma/notification-empty-bell-gray.svg'

// 최신 리뷰 탭에서 사용할 카테고리 목록
const reviewCategories = ['도어락', '목공', '배관', '보일러', '전기']

// 홈 화면의 '서비스 절차' 카드에 보여줄 고정 안내 데이터
const serviceSteps = [
  ['01', 'photo', '사진 업로드', '수리할 곳을 찍고 설명을 남겨요.'],
  ['02', 'ai', 'AI 견적', '예상 비용과 작업 시간을 확인해요.'],
  ['03', 'risk', '리스크 확인', '추가 비용과 주의사항을 미리 봐요.'],
  ['04', 'match', '파트너 매칭', '조건에 맞는 시공자와 연결돼요.'],
]

// 알림 모달에서 사용할 임시 알림 데이터
// 추후 백엔드 알림 API가 생기면 이 부분을 API 응답으로 대체하면 됨
const initialNotifications = [
  {
    id: 1,
    title: 'AI 견적서가 생성되었습니다.',
    message: '거실 몰딩 시공 견적서를 확인해보세요.',
    time: '방금 전',
    isRead: false,
  },
  {
    id: 2,
    title: '리스크 리포트가 준비되었습니다.',
    message: '추가 비용 가능성과 계약 전 체크리스트를 확인할 수 있어요.',
    time: '12분 전',
    isRead: false,
  },
  {
    id: 3,
    title: '새로운 시공자 견적이 도착했습니다.',
    message: '김도배 파트너님이 견적을 보냈습니다.',
    time: '1시간 전',
    isRead: true,
  },
]

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
// rating 숫자만큼 ★ 문자를 반복해서 보여줌
function StarRating({ rating }) {
  return (
    <span className="home-stars">
      {'★'.repeat(rating)}
      <em>{rating}/5</em>
    </span>
  )
}

// 홈 화면 전체 컴포넌트
// go 함수는 다른 화면으로 이동할 때 사용함
export function HomePage({ go }) {
  // 현재 선택된 최신 리뷰 카테고리
  const [activeCategory, setActiveCategory] = useState(reviewCategories[0])
  // 현재 설정된 사용자 주소
  const [selectedAddress, setSelectedAddress] = useState(defaultHomeAddress)
  // 현재 주소 기준 근처 시공자 요약 정보
  const [nearbySummary, setNearbySummary] = useState(defaultNearbySummary)
  // 주소 관리 모달 열림 여부
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  // 알림 모달 열림 여부
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  // 알림 목록 상태
  const [notifications, setNotifications] = useState(initialNotifications)
  // 주소 검색/저장 과정에서 발생한 에러 메시지
  const [addressError, setAddressError] = useState('')
  // 현재 선택된 카테고리에 해당하는 리뷰만 화면에 표시
  const visibleReviews = homeReviews[activeCategory] ?? []
  // 읽지 않은 알림 개수 계산
  const unreadNotificationCount = notifications.filter((notification) => !notification.isRead).length

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

  // 주소 검색 팝업에서 선택한 주소를 postMessage로 받아 처리함
  useEffect(() => {
    const handleMessage = async (event) => {
      // 같은 출처에서 보낸 메시지만 허용
      if (event.origin !== window.location.origin) return
      // 주소 선택 메시지가 아니면 무시
      if (event.data?.type !== 'TUKTAK_JUSO_SELECTED') return

      // 주소 API payload를 홈 화면에서 쓰는 주소 객체 형태로 변환
      const nextAddress = mapJusoPayloadToHomeAddress(event.data.payload)

      if (!nextAddress) {
        setAddressError('주소 정보를 받아오지 못했습니다. 다시 검색해주세요.')
        return
      }

      // 선택된 주소를 화면에 반영하고 모달을 닫음
      setSelectedAddress(nextAddress)
      setAddressError('')
      setIsAddressModalOpen(false)

      // 선택한 주소를 저장한 뒤, 새 주소 기준으로 근처 시공자 정보를 다시 조회
      const savedAddress = await saveHomeAddress(nextAddress)
      const summary = await fetchNearbySummary(savedAddress)
      setNearbySummary(summary)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // 주소 검색 팝업을 여는 함수
  const openAddressSearch = () => {
    // 도로명주소 API 키가 없으면 팝업을 열지 않고 에러 표시
    if (!hasJusoConfirmKey()) {
      setAddressError('.env에 VITE_JUSO_CONFIRM_KEY를 설정한 뒤 다시 실행해주세요.')
      return
    }

    setAddressError('')
    // 도로명주소 검색 팝업 실행
    window.open(getJusoPopupUrl(), 'jusoSearch', 'width=430,height=760,scrollbars=yes,resizable=yes')
  }

  return (
    <section className="home-layout">
      {/* 상단 헤더 영역: 로고, 알림, 마이페이지 버튼 */}
      <header className="home-topbar">
        <Logo />
        <div className="top-actions">
          <div className="home-notification-trigger">
            <HeaderIcon
              src={unreadNotificationCount > 0 ? figmaAssets.notification : notificationEmptyBell}
              label="알림"
              onClick={() => setIsNotificationModalOpen(true)}
            />
            {unreadNotificationCount > 0 ? <span>{unreadNotificationCount}</span> : null}
          </div>
          <HeaderIcon src={figmaAssets.userProfile} label="마이페이지" onClick={() => go(screens.mypage)} />
        </div>
      </header>

      {/* 메인 CTA 카드: AI 견적 시작 화면으로 이동 */}
      <button className="home-alert-card" type="button" onClick={() => go(screens.estimateHome)}>
        <div className="home-alert-copy">
          <span>AI 견적 시작</span>
          <h2>수리가 필요하다면?</h2>
          <p>사진과 설명을 올리면 예상 비용과 시간을 확인할 수 있어요.</p>
          <strong className="home-alert-cta">무료 AI 견적 받기</strong>
        </div>
        <div className="home-alert-visual">
          <strong>AI</strong>
          <small>무료 AI 견적 3회</small>
        </div>
      </button>

      {/* 근처 시공자 요약 카드: 매칭 홈으로 이동 */}
      <button className="home-near-card" type="button" onClick={() => go(screens.matchingHome)}>
        {/* 주소 영역만 클릭하면 카드 이동 대신 주소 관리 모달을 열어야 하므로 이벤트 전파를 막음 */}
        <div
          className="home-location"
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
          <span>{selectedAddress.district}</span>
          <b aria-hidden="true" />
        </div>
        <div className="home-worker-row">
          <div className="home-worker-icon" />
          <h2>근처 {nearbySummary.contractorCount}명의 시공자가 작업을 기다리고 있어요</h2>
        </div>
        <p>내 주변 가능한 파트너를 빠르게 확인해보세요.</p>
      </button>

      {/* 서비스 절차 안내 섹션 */}
      <section className="home-flow-section">
        <div className="home-section-head">
          <h2>서비스 절차</h2>
        </div>
        <div className="home-flow-grid">
          {/* serviceSteps 배열을 카드 UI로 반복 렌더링 */}
          {serviceSteps.map(([step, icon, title, description]) => (
            <article className="home-flow-card" key={step}>
              <div className={`home-flow-icon ${icon}`} aria-hidden="true" />
              <span>{step}</span>
              <strong>{title}</strong>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 최신 리뷰 섹션 */}
      <section className="home-review-section">
        <div className="home-section-head">
          <h2>최신 리뷰</h2>
          <button type="button" onClick={() => go(screens.myReviews)}>내 리뷰</button>
        </div>
        <div className="home-review-panel">
          <div className="home-review-tabs">
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
          {/* 선택된 카테고리의 리뷰 목록 */}
          {visibleReviews.map((review) => (
            <article className="home-review-item" key={`${review.partner}-${review.time}`}>
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
                ×
              </button>
            </div>
            <button className="home-address-search" type="button" onClick={openAddressSearch}>
              <span aria-hidden="true" />
              <strong>도로명, 지번 또는 건물명으로 검색</strong>
            </button>
            {addressError ? <p className="home-address-error">{addressError}</p> : null}
            <div className="home-address-divider" />
            <article className="home-current-address">
              <i aria-hidden="true" />
              <div>
                <em>현재 설정된 주소</em>
                <h3>{selectedAddress.title}</h3>
                <p>{selectedAddress.detail}</p>
              </div>
              <button type="button" onClick={openAddressSearch} aria-label="주소 수정">
                ✎
              </button>
            </article>
          </section>
        </div>
      )}

      {/* 알림 모달: 알림 목록 확인 및 읽음 처리 */}
      {isNotificationModalOpen && (
        <div className="home-address-overlay" role="presentation" onClick={() => setIsNotificationModalOpen(false)}>
          <section className="home-notification-modal" role="dialog" aria-modal="true" aria-labelledby="home-notification-title" onClick={(event) => event.stopPropagation()}>
            <div className="home-address-head">
              <h2 id="home-notification-title">알림</h2>
              <button type="button" onClick={() => setIsNotificationModalOpen(false)} aria-label="닫기">
                ×
              </button>
            </div>
            <div className="home-notification-summary">
              <strong>읽지 않은 알림 {unreadNotificationCount}개</strong>
              <button
                type="button"
                onClick={() => {
                  // 모든 알림을 읽음 상태로 변경
                  setNotifications((items) => items.map((item) => ({ ...item, isRead: true })))
                }}
              >
                모두 읽음
              </button>
            </div>
            <div className="home-notification-list">
              {notifications.length === 0 ? (
                <div className="home-notification-empty">
                  <img src={notificationEmptyBell} alt="" />
                  <p>도착한 알림이 없습니다.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    className={`home-notification-item ${notification.isRead ? 'read' : ''}`}
                    key={notification.id}
                    type="button"
                    onClick={() => {
                      // 클릭한 알림만 읽음 상태로 변경
                      setNotifications((items) => (
                        items.map((item) => (
                          item.id === notification.id ? { ...item, isRead: true } : item
                        ))
                      ))
                    }}
                  >
                    <span aria-hidden="true" />
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                      <small>{notification.time}</small>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

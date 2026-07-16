import { useEffect, useState } from 'react'
import {
  FaBell,
  FaBellSlash,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardCheck,
  FaClipboardList,
  FaRegCommentDots,
  FaRegStar,
  FaTools,
} from 'react-icons/fa'
import { PrimaryButton } from '../../components/customer/FormControls'
import { contractorProfile, contractorScreens } from '../../data/contractorData'
import {
  fetchContractorMatchingRequests,
  fetchContractorMe,
  fetchContractorWorkOrders,
  updateContractorAlertSettings,
} from '../../services/contractorService'
import { ContractorPage } from './ContractorPageShared'
import './ContractorPages.css'

const INACTIVE_WORK_ORDER_STATUSES = ['COMPLETED', 'CANCELLED', '완료', '완료됨', '취소']

function findActiveWorkOrder(items) {
  return (items || []).find((item) => !INACTIVE_WORK_ORDER_STATUSES.includes(item.work_order_status))
}

function formatDate(value) {
  return value ? String(value).slice(0, 10).replaceAll('-', '.') : '일정 협의'
}

function formatWon(value) {
  if (value === undefined || value === null || value === '') return '협의'
  return `${Number(value).toLocaleString('ko-KR')}원`
}

function mapActiveWork(item) {
  return {
    title: item.matching_request_title,
    price: formatWon(item.final_amount),
    date: formatDate(item.scheduled_date),
    visitTime: item.scheduled_start_time || '시간 협의',
    address: item.address || '주소 확인 필요',
    duration: '상세에서 확인',
    customer: {
      name: item.customer_name || '고객',
      phone: '연락처는 작업 상세에서 확인',
    },
    status: item.work_order_status,
  }
}

function formatNotificationTime(value) {
  if (!value) return ''
  return String(value).slice(0, 16).replace('T', ' ')
}

function mapMatchingNotification(item) {
  const regionName = item.region_name || (item.region_code_id ? `지역 코드 ${item.region_code_id}` : '지역 미정')
  return {
    id: String(item.matching_target_id || item.matching_request_id),
    title: '내 지역 새 시공 요청',
    body: `${regionName} ${item.title} 요청이 도착했습니다.`,
    time: formatNotificationTime(item.created_at),
    request: {
      id: String(item.matching_request_id),
      matchingRequestId: item.matching_request_id,
      matchingTargetId: item.matching_target_id,
      quoteId: item.quote_id,
      city: regionName,
      region: item.address || regionName,
      regionName,
      title: item.title,
      budget: item.budget_min || item.budget_max ? `${item.budget_min || '협의'} ~ ${item.budget_max || '협의'}` : '협의',
      desiredDate: item.preferred_date ? String(item.preferred_date).slice(0, 10).replaceAll('-', '.') : '일정 협의',
      time: item.preferred_time_start && item.preferred_time_end ? `${item.preferred_time_start} - ${item.preferred_time_end}` : '시간 협의',
      status: item.target_status || item.matching_status,
      aiEstimate: {
        summary: '고객의 AI 견적 기반 매칭 요청입니다.',
        priceRange: item.budget_min || item.budget_max ? `${item.budget_min || '협의'} ~ ${item.budget_max || '협의'}` : '협의',
        expectedTime: '상세 협의',
        note: item.request_message || `매칭 상태: ${item.matching_status}`,
      },
      photos: ['고객 첨부 사진', 'AI 견적 이미지'],
    },
  }
}

export function ContractorHomePage({ go }) {
  const [notificationOn, setNotificationOn] = useState(contractorProfile.notificationEnabled)
  const [activeWork, setActiveWork] = useState(null)

  useEffect(() => {
    let ignore = false

    fetchContractorMe()
      .then((profile) => {
        if (!ignore) setNotificationOn(Boolean(profile.matching_alert_enabled))
      })
      .catch(() => {})

    fetchContractorWorkOrders({ page: 1, size: 50 })
      .then((data) => {
        if (ignore) return
        const activeItem = findActiveWorkOrder(data.items)
        setActiveWork(activeItem ? mapActiveWork(activeItem) : null)
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [])

  const toggleNotification = () => {
    const nextValue = !notificationOn
    setNotificationOn(nextValue)
    updateContractorAlertSettings(nextValue).catch(() => setNotificationOn(!nextValue))
  }

  return (
    <ContractorPage go={go}>
      <div className="contractor-home cds--white">
        <button
          className="contractor-home-alarm"
          type="button"
          aria-pressed={notificationOn}
          onClick={toggleNotification}
        >
          <span className="contractor-home-alarm-icon">
            {notificationOn ? <FaBell /> : <FaBellSlash />}
            {notificationOn ? <span className="contractor-home-alarm-live" aria-hidden="true"></span> : null}
          </span>
          <span className="contractor-home-alarm-text">
            <span className="contractor-home-alarm-status">
              {notificationOn ? '매칭 알림 받는 중' : '매칭 알림 꺼짐'}
            </span>
            <span className="contractor-home-alarm-desc">
              {notificationOn ? '내 지역 새 시공 요청을 실시간으로 받고 있어요' : '탭하여 새 시공 요청 알림을 켜세요'}
            </span>
          </span>
          <span className="contractor-home-alarm-switch" aria-hidden="true"></span>
        </button>

        {activeWork ? (
          <button
            className="contractor-home-active"
            type="button"
            onClick={() => go(contractorScreens.activeWork)}
          >
            <span className="contractor-home-active-icon">
              <FaTools />
            </span>
            <span className="contractor-home-active-body">
              <span className="contractor-home-active-eyebrow">진행중인 시공</span>
              <h2>{activeWork.title}</h2>
              <p>{activeWork.date} {activeWork.visitTime}</p>
              <p>{activeWork.address}</p>
              <span className="contractor-home-active-hint">
                자세히 보기 <FaChevronRight />
              </span>
            </span>
          </button>
        ) : (
          <div className="contractor-home-active contractor-home-active-empty">
            <span className="contractor-home-active-icon">
              <FaTools />
            </span>
            <span className="contractor-home-active-body">
              <span className="contractor-home-active-eyebrow">진행중인 시공</span>
              <p>진행중인 시공이 없습니다.</p>
            </span>
          </div>
        )}

        <div className="contractor-home-menu">
          <button className="contractor-home-tile" type="button" onClick={() => go(contractorScreens.requests)}>
            <span className="contractor-home-tile-icon">
              <FaClipboardList />
            </span>
            <strong>시공 요청 보기</strong>
          </button>

          <button className="contractor-home-tile" type="button" onClick={() => go(contractorScreens.records)}>
            <span className="contractor-home-tile-icon">
              <FaClipboardCheck />
            </span>
            <strong>시공 기록 보기</strong>
          </button>

          <button className="contractor-home-tile" type="button" onClick={() => go(contractorScreens.chats)}>
            <span className="contractor-home-tile-icon">
              <FaRegCommentDots />
            </span>
            <strong>채팅 기록 보기</strong>
          </button>

          <button className="contractor-home-tile" type="button" onClick={() => go(contractorScreens.reviews)}>
            <span className="contractor-home-tile-icon">
              <FaRegStar />
            </span>
            <strong>리뷰 보기</strong>
          </button>
        </div>
      </div>
    </ContractorPage>
  )
}

export function ContractorNotificationsPage({ go }) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let ignore = false

    fetchContractorMatchingRequests({ target_status: 'NOTIFIED', page: 1, size: 50 })
      .then((data) => {
        if (ignore) return
        setItems((data.items || []).map(mapMatchingNotification))
        setStatus('loaded')
      })
      .catch(() => {
        if (!ignore) {
          setItems([])
          setStatus('error')
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  return (
    <ContractorPage title="알림 목록" go={go} back={() => go(contractorScreens.home)}>
      {status === 'loading' ? <p className="muted center">알림을 불러오는 중입니다.</p> : null}
      {status === 'error' ? <p className="muted center">알림을 불러오지 못했습니다.</p> : null}
      {status === 'loaded' && items.length === 0 ? <p className="muted center">새 매칭 알림이 없습니다.</p> : null}
      <div className="contractor-list">
        {items.map((item) => (
          <button
            className="contractor-line-card clickable"
            type="button"
            key={item.id}
            onClick={() => go(contractorScreens.requestDetail, { request: item.request, matchingRequestId: item.request.matchingRequestId })}
          >
            <FaBell />
            <div>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
              <small>{item.time}</small>
            </div>
          </button>
        ))}
      </div>
    </ContractorPage>
  )
}

export function ContractorActiveWorkPage({ go }) {
  const [work, setWork] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let ignore = false

    fetchContractorWorkOrders({ page: 1, size: 50 })
      .then((data) => {
        if (ignore) return
        const activeItem = findActiveWorkOrder(data.items)
        setWork(activeItem ? mapActiveWork(activeItem) : null)
        setLoaded(true)
      })
      .catch(() => {
        if (!ignore) setLoaded(true)
      })

    return () => {
      ignore = true
    }
  }, [])

  return (
    <ContractorPage go={go}>
      <div className="contractor-active cds--white">
        <header className="contractor-active-header">
          <button
            type="button"
            className="contractor-active-back"
            onClick={() => go(contractorScreens.home)}
            aria-label="뒤로가기"
          >
            <FaChevronLeft aria-hidden="true" />
          </button>
          <div className="contractor-active-header-title">
            <p className="contractor-active-eyebrow">진행중인 시공</p>
            <h1>{work?.title || '진행중인 시공'}</h1>
          </div>
          <span className="contractor-active-header-spacer" aria-hidden="true" />
        </header>

        {work ? (
          <>
            <article className="contractor-active-card">
              <dl className="contractor-active-info">
                <div><dt>시공 가격</dt><dd>{work.price}</dd></div>
                <div><dt>날짜</dt><dd>{work.date}</dd></div>
                <div><dt>방문 예정시간</dt><dd>{work.visitTime}</dd></div>
                <div><dt>정확한 주소</dt><dd>{work.address}</dd></div>
                <div><dt>예상 소요시간</dt><dd>{work.duration}</dd></div>
                <div><dt>고객정보</dt><dd>{work.customer.name} · {work.customer.phone}</dd></div>
              </dl>
            </article>

            <div className="contractor-active-actions">
              <PrimaryButton onClick={() => go(contractorScreens.chats)}>1:1 채팅 연결</PrimaryButton>
            </div>
          </>
        ) : (
          loaded && <p className="muted center">진행중인 시공이 없습니다.</p>
        )}
      </div>
    </ContractorPage>
  )
}

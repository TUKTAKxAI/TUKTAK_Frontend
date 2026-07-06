import { useEffect, useState } from 'react'
import { FaBell, FaBriefcase, FaClipboardList, FaComments, FaStar, FaTools } from 'react-icons/fa'
import { PrimaryButton } from '../../components/customer/FormControls'
import { contractorNotifications, contractorProfile, contractorScreens } from '../../data/contractorData'
import {
  fetchContractorMe,
  fetchContractorWorkOrders,
  updateContractorAlertSettings,
} from '../../services/contractorService'
import { ContractorPage, InfoModal, MenuTile, StatusBadge } from './ContractorPageShared'
import './ContractorPages.css'

function formatDate(value) {
  return value ? String(value).slice(0, 10).replaceAll('-', '.') : '일정 협의'
}

function formatWon(value) {
  if (value === undefined || value === null || value === '') return '협의'
  return `${Number(value).toLocaleString('ko-KR')}원`
}

function statusLabel(status) {
  const labels = {
    REQUESTED: '매칭대기중',
    RECEIVING_QUOTES: '매칭대기중',
    NOTIFIED: '매칭대기중',
    VIEWED: '매칭대기중',
    QUOTED: '매칭대기중',
    SELECTED: '매칭완료',
    CREATED: '시공 시작 대기중',
    SCHEDULED: '시공 시작 대기중',
    IN_PROGRESS: '시공 진행중',
    PAYMENT_REQUESTED: '결제요청완료',
    COMPLETED: '완료됨',
    CANCELLED: '취소됨',
    진행중: '시공 시작 대기중',
    완료: '완료됨',
    완료됨: '완료됨',
  }
  return labels[status] || status
}

function mapWorkOrder(item) {
  const rawStatus = item.work_order_status || item.rawStatus || item.status

  return {
    id: String(item.work_order_id || item.workOrderId || item.id),
    workOrderId: item.work_order_id || item.workOrderId,
    title: item.matching_request_title || item.title,
    region: item.region || (item.contractor_name ? `담당 ${item.contractor_name}` : '시공 주소 확인 필요'),
    date: formatDate(item.scheduled_date || item.date),
    time: item.scheduled_start_time || item.time || '시간 협의',
    status: statusLabel(rawStatus),
    rawStatus,
    amount: item.amount || formatWon(item.final_amount),
    customerName: item.customer_name,
  }
}

function findCurrentWork(items) {
  return items.find((item) => item.status !== '완료됨' && item.status !== '취소됨') || null
}

function mapActiveWork(item) {
  if (!item) return null

  return {
    ...item,
    price: item.amount,
    visitTime: item.time || '시간 협의',
    address: item.region,
    workOrder: item,
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
        const current = findCurrentWork(data.items?.map(mapWorkOrder) ?? [])
        setActiveWork(mapActiveWork(current))
      })
      .catch(() => {
        if (!ignore) setActiveWork(null)
      })

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
      <button
        className="contractor-active-card"
        type="button"
        onClick={() => {
          if (activeWork?.workOrder) {
            go(contractorScreens.recordDetail, { workOrder: activeWork.workOrder, workOrderId: activeWork.workOrder.workOrderId })
            return
          }
          go(contractorScreens.records)
        }}
      >
        <FaBriefcase />
        <div>
          <div className="contractor-active-meta">
            <small>진행중인 시공</small>
            {activeWork ? <StatusBadge tone={activeWork.status === '완료됨' ? 'gray' : 'blue'}>{activeWork.status}</StatusBadge> : null}
          </div>
          {activeWork ? (
            <>
              <h1>{activeWork.title}</h1>
              <p>{activeWork.date} · {activeWork.visitTime}</p>
              <p>{activeWork.address}</p>
              <span>시공 상세작업으로 이동</span>
            </>
          ) : (
            <>
              <h1>현재 진행중인 시공이 없습니다</h1>
              <p>시공 기록에서 완료 전 작업을 확인할 수 있습니다.</p>
              <span>시공 기록으로 이동</span>
            </>
          )}
        </div>
      </button>

      <div className="contractor-menu-grid">
        <MenuTile icon={<FaClipboardList />} label="시공 요청 보기" onClick={() => go(contractorScreens.requests)} />
        <MenuTile icon={<FaTools />} label="시공 기록 보기" onClick={() => go(contractorScreens.records)} />
        <MenuTile icon={<FaComments />} label="채팅 목록 보기" onClick={() => go(contractorScreens.chats)} />
        <MenuTile icon={<FaStar />} label="리뷰 보기" onClick={() => go(contractorScreens.reviews)} />
      </div>

      <button
        className={`contractor-alarm ${notificationOn ? 'on' : 'off'}`}
        type="button"
        aria-pressed={notificationOn}
        onClick={toggleNotification}
      >
        <FaBell />
        <strong>{notificationOn ? '알림 받는 중' : '알림 꺼짐'}</strong>
      </button>
    </ContractorPage>
  )
}

export function ContractorNotificationsPage({ go }) {
  return (
    <ContractorPage title="알림 목록" go={go} back={() => go(contractorScreens.home)}>
      <div className="contractor-list">
        {contractorNotifications.map((item) => (
          <button className="contractor-line-card clickable" type="button" key={item.id} onClick={() => go(item.targetScreen)}>
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
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let ignore = false

    fetchContractorWorkOrders({ page: 1, size: 1 })
      .then((data) => {
        if (ignore) return
        if (data.items?.[0]) {
          setWork(mapActiveWork(mapWorkOrder(data.items[0])))
          setStatus('loaded')
          return
        }
        setWork(null)
        setStatus('empty')
      })
      .catch(() => {
        if (!ignore) {
          setWork(null)
          setStatus('error')
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  if (!work) {
    return (
      <ContractorPage title="진행중인 시공" go={go} back={() => go(contractorScreens.home)}>
        {status === 'loading' ? <p className="muted center">진행중인 시공을 불러오는 중입니다.</p> : null}
        {status === 'empty' ? (
          <InfoModal
            title="진행중인 시공이 없습니다"
            message="고객이 견적을 선택하면 진행중인 시공이 표시됩니다."
            onConfirm={() => go(contractorScreens.home)}
          />
        ) : null}
        {status === 'error' ? (
          <InfoModal
            title="진행중인 시공을 불러오지 못했습니다"
            message="서버 연결 또는 로그인 상태를 확인한 뒤 다시 시도해주세요."
            onConfirm={() => go(contractorScreens.home)}
          />
        ) : null}
      </ContractorPage>
    )
  }

  return (
    <ContractorPage title={work.title} go={go} back={() => go(contractorScreens.home)}>
      <article className="contractor-detail-card">
        <dl>
          <div><dt>시공 가격</dt><dd>{work.price}</dd></div>
          <div><dt>날짜</dt><dd>{work.date}</dd></div>
          <div><dt>방문 예정시간</dt><dd>{work.visitTime}</dd></div>
          <div><dt>정확한 주소</dt><dd>{work.address}</dd></div>
          <div><dt>예상 소요시간</dt><dd>{work.duration}</dd></div>
          <div><dt>고객정보</dt><dd>{work.customer.name} · {work.customer.phone}</dd></div>
        </dl>
        <PrimaryButton onClick={() => go(contractorScreens.chats)}>1:1 채팅 연결</PrimaryButton>
      </article>
    </ContractorPage>
  )
}

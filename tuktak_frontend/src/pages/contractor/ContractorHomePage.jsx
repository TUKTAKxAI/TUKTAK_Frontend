import { useEffect, useState } from 'react'
import { FaBell, FaBriefcase, FaClipboardList, FaComments, FaStar, FaTools } from 'react-icons/fa'
import { PrimaryButton } from '../../components/customer/FormControls'
import { contractorActiveWork, contractorNotifications, contractorProfile, contractorScreens } from '../../data/contractorData'
import {
  fetchContractorMe,
  fetchContractorWorkOrders,
  updateContractorAlertSettings,
} from '../../services/contractorService'
import { ContractorPage, MenuTile } from './ContractorPageShared'
import './ContractorPages.css'

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
    address: item.contractor_name ? `담당 ${item.contractor_name}` : '주소 확인 필요',
    duration: '상세에서 확인',
    customer: {
      name: item.customer_name || '고객',
      phone: '연락처는 작업 상세에서 확인',
    },
    status: item.work_order_status,
  }
}

export function ContractorHomePage({ go }) {
  const [notificationOn, setNotificationOn] = useState(contractorProfile.notificationEnabled)
  const [activeWork, setActiveWork] = useState(contractorActiveWork)

  useEffect(() => {
    let ignore = false

    fetchContractorMe()
      .then((profile) => {
        if (!ignore) setNotificationOn(Boolean(profile.matching_alert_enabled))
      })
      .catch(() => {})

    fetchContractorWorkOrders({ page: 1, size: 1 })
      .then((data) => {
        if (!ignore && data.items?.[0]) setActiveWork(mapActiveWork(data.items[0]))
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
      <button className="contractor-active-card" type="button" onClick={() => go(contractorScreens.activeWork)}>
        <FaBriefcase />
        <div>
          <small>진행중인 시공</small>
          <h1>{activeWork.title}</h1>
          <p>{activeWork.date} · {activeWork.visitTime}</p>
          <p>{activeWork.address}</p>
          <span>자세한 정보를 클릭해서 보기</span>
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
  const [work, setWork] = useState(contractorActiveWork)

  useEffect(() => {
    let ignore = false

    fetchContractorWorkOrders({ page: 1, size: 1 })
      .then((data) => {
        if (!ignore && data.items?.[0]) setWork(mapActiveWork(data.items[0]))
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [])

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

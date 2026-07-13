import { useEffect, useState } from 'react'
import { FaBell } from 'react-icons/fa'
import { figmaAssets } from '../../components/contractor/figmaAssets'
import { PrimaryButton } from '../../components/customer/FormControls'
import { contractorActiveWork, contractorProfile, contractorScreens } from '../../data/contractorData'
import {
  fetchContractorMatchingRequests,
  fetchContractorMe,
  fetchContractorWorkOrders,
  updateContractorAlertSettings,
} from '../../services/contractorService'
import { ContractorPage } from './ContractorPageShared'
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
      <div className="px-5 mt-2 shrink-0">
        <button
          className="w-full bg-white border border-gray-400 rounded-[28px] p-5 flex items-start shadow-sm active:scale-95 transition-transform text-left"
          type="button"
          onClick={() => go(contractorScreens.activeWork)}
        >
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mr-4 shrink-0 mt-1">
            <img src={figmaAssets.nowMatching} alt="진행중" className="w-10 h-10 object-contain" />
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 text-[12px] font-bold mb-0.5">진행중인 시공</span>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">{activeWork.title}</h2>
            <p className="text-[14px] font-bold text-gray-900 leading-snug">{activeWork.date} {activeWork.visitTime}</p>
            <p className="text-[14px] font-bold text-gray-900 leading-snug">{activeWork.address}</p>
            <span className="text-[12px] text-gray-400 font-medium mt-1.5">자세한 정보는 클릭해서 보기</span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-y-10 px-4 mt-10 shrink-0">
        <button className="flex flex-col items-center active:scale-95 transition-transform" type="button" onClick={() => go(contractorScreens.requests)}>
          <img src={figmaAssets.contractorMatchingRequest} alt="시공 요청" className="w-24 h-24 object-contain mb-3" />
          <span className="font-bold text-[18px] text-gray-900">시공 요청 보기</span>
        </button>

        <button className="flex flex-col items-center active:scale-95 transition-transform" type="button" onClick={() => go(contractorScreens.records)}>
          <img src={figmaAssets.contractorMatchingHistory} alt="시공 기록" className="w-24 h-24 object-contain mb-3" />
          <span className="font-bold text-[18px] text-gray-900">시공 기록 보기</span>
        </button>

        <button className="flex flex-col items-center active:scale-95 transition-transform" type="button" onClick={() => go(contractorScreens.chats)}>
          <img src={figmaAssets.contractorChatting} alt="채팅 기록" className="w-24 h-24 object-contain mb-3" />
          <span className="font-bold text-[18px] text-gray-900">채팅 기록 보기</span>
        </button>

        <button className="flex flex-col items-center active:scale-95 transition-transform" type="button" onClick={() => go(contractorScreens.reviews)}>
          <img src={figmaAssets.contractorReview} alt="리뷰 보기" className="w-24 h-24 object-contain mb-3" />
          <span className="font-bold text-[18px] text-gray-900">리뷰 보기</span>
        </button>
      </div>

      <div className="mt-14 mb-8 flex justify-center w-full shrink-0">
        <button
          className={`w-64 h-64 rounded-full flex flex-col items-center justify-center transition-colors shadow-sm active:scale-95 shrink-0 ${
            notificationOn ? 'bg-[#D6E2F6] border-[6px] border-[#C3D5F2]' : 'bg-gray-200 border-[6px] border-gray-300'
          }`}
          type="button"
          aria-pressed={notificationOn}
          onClick={toggleNotification}
        >
          <img
            src={notificationOn ? figmaAssets.contractorAlarmOn : figmaAssets.contractorAlarmOff}
            alt="알림 상태"
            className="w-32 h-32 object-contain mb-3"
          />
          <span className={`font-extrabold text-[22px] ${notificationOn ? 'text-[#1C54D4]' : 'text-gray-500'}`}>
            {notificationOn ? '알림 받는 중' : '알림 꺼짐'}
          </span>
        </button>
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
    <ContractorPage title={work.title} back={() => go(contractorScreens.home)} go={go}>
      <div className="px-6 py-4 flex flex-col flex-1 shrink-0">
        <article className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-200 flex flex-col flex-1">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex justify-between items-center"><span className="text-gray-500 text-[15px]">시공 가격</span><span className="font-bold text-gray-900 text-[15px]">{work.price}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-500 text-[15px]">날짜</span><span className="font-bold text-gray-900 text-[15px]">{work.date}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-500 text-[15px]">방문 예정시간</span><span className="font-bold text-gray-900 text-[15px]">{work.visitTime}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-500 text-[15px]">정확한 주소</span><span className="font-bold text-gray-900 text-[15px]">{work.address}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-500 text-[15px]">예상 소요시간</span><span className="font-bold text-gray-900 text-[15px]">{work.duration}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-500 text-[15px]">고객정보</span><span className="font-bold text-gray-900 text-[15px]">{work.customer.name} · {work.customer.phone}</span></div>
          </div>

          <div className="mt-auto pt-6">
            <PrimaryButton onClick={() => go(contractorScreens.chats)}>1:1 채팅 연결</PrimaryButton>
          </div>
        </article>
      </div>
    </ContractorPage>
  )
}

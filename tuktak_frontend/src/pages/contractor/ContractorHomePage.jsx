import { useEffect, useState } from 'react'
import { contractorActiveWork,  contractorProfile,  contractorScreens } from '../../data/contractorData'
import { fetchContractorMe, fetchContractorWorkOrders, updateContractorAlertSettings } from '../../services/contractorService'
import { ContractorPage } from './ContractorPageShared'
import { figmaAssets } from '../../components/contractor/figmaAssets'
import { PrimaryButton } from '../../components/customer/FormControls'

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
      
      <div className="px-5 mt-2 shrink-0">
        <button 
          className="w-full bg-white border border-gray-400 rounded-[28px] p-5 flex items-start shadow-sm active:scale-95 transition-transform text-left"
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
        <button className="flex flex-col items-center active:scale-95 transition-transform" onClick={() => go(contractorScreens.requests)}>
          <img src={figmaAssets.contractorMatchingRequest} alt="시공 요청" className="w-24 h-24 object-contain mb-3" />
          <span className="font-bold text-[18px] text-gray-900">시공 요청 보기</span>
        </button>

        <button className="flex flex-col items-center active:scale-95 transition-transform" onClick={() => go(contractorScreens.records)}>
          <img src={figmaAssets.contractorMatchingHistory} alt="시공 기록" className="w-24 h-24 object-contain mb-3" />
          <span className="font-bold text-[18px] text-gray-900">시공 기록 보기</span>
        </button>

        <button className="flex flex-col items-center active:scale-95 transition-transform" onClick={() => go(contractorScreens.chats)}>
          <img src={figmaAssets.contractorChatting} alt="채팅 기록" className="w-24 h-24 object-contain mb-3" />
          <span className="font-bold text-[18px] text-gray-900">채팅 기록 보기</span>
        </button>

        <button className="flex flex-col items-center active:scale-95 transition-transform" onClick={() => go(contractorScreens.reviews)}>
          <img src={figmaAssets.contractorReview} alt="리뷰 보기" className="w-24 h-24 object-contain mb-3" />
          <span className="font-bold text-[18px] text-gray-900">리뷰 보기</span>
        </button>
      </div>

      <div className="mt-14 mb-8 flex justify-center w-full shrink-0">
        <button
          onClick={toggleNotification}
          className={`w-64 h-64 rounded-full flex flex-col items-center justify-center transition-colors shadow-sm active:scale-95 shrink-0 ${
            notificationOn ? 'bg-[#D6E2F6] border-[6px] border-[#C3D5F2]' : 'bg-gray-200 border-[6px] border-gray-300'
          }`}
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
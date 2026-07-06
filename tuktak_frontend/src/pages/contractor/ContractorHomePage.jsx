import { useState } from 'react'
import { FaBell, FaBriefcase, FaClipboardList, FaComments, FaStar, FaTools } from 'react-icons/fa'
import { PrimaryButton } from '../../components/customer/FormControls'
import { contractorActiveWork, contractorNotifications, contractorProfile, contractorScreens } from '../../data/contractorData'
import { ContractorPage, MenuTile } from './ContractorPageShared'
import './ContractorPages.css'

export function ContractorHomePage({ go }) {
  const [notificationOn, setNotificationOn] = useState(contractorProfile.notificationEnabled)

  return (
    <ContractorPage go={go}>
      <button className="contractor-active-card" type="button" onClick={() => go(contractorScreens.activeWork)}>
        <FaBriefcase />
        <div>
          <small>진행중인 시공</small>
          <h1>{contractorActiveWork.title}</h1>
          <p>{contractorActiveWork.date} · {contractorActiveWork.visitTime}</p>
          <p>{contractorActiveWork.address}</p>
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
        onClick={() => setNotificationOn((current) => !current)}
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
  const work = contractorActiveWork

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

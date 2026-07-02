import { FaBell, FaBriefcase, FaClipboardList, FaComments, FaStar, FaTools } from 'react-icons/fa'
import { PrimaryButton } from '../../components/customer/FormControls'
import { contractorActiveWork, contractorNotifications, contractorProfile, contractorScreens } from '../../data/contractorData'
import { ContractorPage, MenuTile } from './ContractorPageShared'
import './ContractorPages.css'

export function ContractorHomePage({ go }) {
  const notificationOn = contractorProfile.notificationEnabled

  return (
    <ContractorPage
      title="TUKTAK PARTNERS"
      action={<button className="contractor-icon-button" type="button" onClick={() => go(contractorScreens.notifications)}><FaBell /></button>}
    >
      <button className="contractor-active-card" type="button" onClick={() => go(contractorScreens.activeWork)}>
        <FaBriefcase />
        <div>
          <small>진행중인 시공</small>
          <h1>{contractorActiveWork.title}</h1>
          <p>{contractorActiveWork.date}</p>
          <p>{contractorActiveWork.region}</p>
          <span>자세한 정보는 클릭해서 보기</span>
        </div>
      </button>

      <div className="contractor-menu-grid">
        <MenuTile icon={<FaClipboardList />} label="시공 요청 보기" onClick={() => go(contractorScreens.requests)} />
        <MenuTile icon={<FaTools />} label="시공 기록 보기" onClick={() => go(contractorScreens.records)} />
        <MenuTile icon={<FaComments />} label="채팅 기록 보기" onClick={() => go(contractorScreens.chats)} />
        <MenuTile icon={<FaStar />} label="리뷰 보기" onClick={() => go(contractorScreens.reviews)} />
      </div>

      <button className={`contractor-alarm ${notificationOn ? 'on' : 'off'}`} type="button" onClick={() => go(contractorScreens.notifications)}>
        <FaBell />
        <strong>{notificationOn ? '알림 받는 중' : '알림 꺼짐'}</strong>
      </button>
    </ContractorPage>
  )
}

export function ContractorNotificationsPage({ go }) {
  return (
    <ContractorPage title="알림 목록" back={() => go(contractorScreens.home)}>
      <div className="contractor-list">
        {contractorNotifications.map((item) => (
          <article className="contractor-line-card" key={item.id}>
            <FaBell />
            <div>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
              <small>{item.time}</small>
            </div>
          </article>
        ))}
      </div>
    </ContractorPage>
  )
}

export function ContractorActiveWorkPage({ go }) {
  return (
    <ContractorPage title="진행중인 시공" back={() => go(contractorScreens.home)}>
      <article className="contractor-detail-card">
        <h1>{contractorActiveWork.title}</h1>
        <p>{contractorActiveWork.region}</p>
        <p>{contractorActiveWork.date}</p>
        <PrimaryButton onClick={() => go(contractorScreens.chats)}>고객과 채팅하기</PrimaryButton>
      </article>
    </ContractorPage>
  )
}

import { FaComments } from 'react-icons/fa'
import { contractorChats, contractorScreens } from '../../data/contractorData'
import { ContractorPage, StatusBadge } from './ContractorPageShared'

export function ContractorChatsPage({ go }) {
  return (
    <ContractorPage title="채팅 목록" go={go} back={() => go(contractorScreens.home)}>
      <div className="contractor-list">
        {contractorChats.map((chat) => (
          <button className="contractor-line-card clickable" type="button" key={chat.id} onClick={() => go(contractorScreens.chatRoom)}>
            <FaComments />
            <div>
              <strong>{chat.name}</strong>
              <p>{chat.preview}</p>
              <small>{chat.time}</small>
            </div>
            {chat.unread ? <StatusBadge>{chat.unread}</StatusBadge> : null}
          </button>
        ))}
      </div>
    </ContractorPage>
  )
}

export function ContractorChatRoomPage({ go }) {
  return (
    <ContractorPage title="김고객님" go={go} back={() => go(contractorScreens.chats)}>
      <div className="contractor-chat-room">
        <p className="from-customer">내일 오후 3시에 방문 가능하실까요?</p>
        <p className="from-me">네, 가능합니다. 방문 전에 연락드리겠습니다.</p>
      </div>
    </ContractorPage>
  )
}

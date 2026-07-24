import { ChatListPage, ChatRoomPage } from '../Customer/ChatPage'
import { contractorScreens } from '../../data/contractorData'

export function ContractorChatsPage({ go }) {
  return (
    <ChatListPage
      goToRoom={(id, room) =>
        go(contractorScreens.chatRoom, {
          chatRoomId: id,
          partnerName: room?.partner_name,
          room,
        })
      }
      go={go}
      back={() => go?.(contractorScreens.home)}
    />
  )
}

export function ContractorChatRoomPage({ go, routeState = {} }) {
  return (
    <ChatRoomPage
      chatRoomId={routeState.chatRoomId}
      partnerName={routeState.partnerName || '고객'}
      initialRoom={routeState.room}
      back={() => go(contractorScreens.chats)}
    />
  )
}

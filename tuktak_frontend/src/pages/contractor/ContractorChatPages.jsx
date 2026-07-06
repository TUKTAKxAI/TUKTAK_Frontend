import { useMemo, useState } from 'react'
import { FaComments, FaPaperPlane, FaSearch } from 'react-icons/fa'
import { contractorChats, contractorScreens } from '../../data/contractorData'
import { ContractorPage, StatusBadge } from './ContractorPageShared'

const initialMessagesByChat = {
  'chat-1': [
    { id: 'chat-1-1', from: 'customer', text: '내일 오후 3시에 방문 가능하실까요?' },
    { id: 'chat-1-2', from: 'me', text: '네, 가능합니다. 방문 전에 연락드리겠습니다.' },
  ],
  'chat-2': [
    { id: 'chat-2-1', from: 'customer', text: '견적 확인했습니다.' },
    { id: 'chat-2-2', from: 'me', text: '확인 감사합니다. 일정 확정되면 다시 안내드리겠습니다.' },
  ],
}

function getLastMessage(messages = []) {
  return messages[messages.length - 1]?.text || '아직 대화가 없습니다.'
}

export function ContractorChatsPage({ go }) {
  const [query, setQuery] = useState('')
  const [threads, setThreads] = useState(contractorChats)
  const filteredThreads = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return threads

    return threads.filter((chat) => (
      `${chat.name} ${chat.preview}`.toLowerCase().includes(keyword)
    ))
  }, [query, threads])

  const openChat = (chat) => {
    setThreads((items) => items.map((item) => (
      item.id === chat.id ? { ...item, unread: 0 } : item
    )))
    go(contractorScreens.chatRoom, { chat })
  }

  return (
    <ContractorPage title="채팅 목록" go={go} back={() => go(contractorScreens.home)}>
      <label className="contractor-search-bar">
        <FaSearch />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="고객명 또는 대화 내용 검색"
        />
      </label>
      <div className="contractor-list">
        {filteredThreads.map((chat) => (
          <button className={`contractor-line-card clickable ${chat.unread ? 'unread' : ''}`} type="button" key={chat.id} onClick={() => openChat(chat)}>
            <FaComments />
            <div>
              <strong>{chat.name}</strong>
              <p>{chat.preview}</p>
              <small>{chat.time}</small>
            </div>
            {chat.unread ? <StatusBadge>{chat.unread}</StatusBadge> : null}
          </button>
        ))}
        {filteredThreads.length === 0 ? <p className="contractor-empty-message">검색 결과가 없습니다.</p> : null}
      </div>
    </ContractorPage>
  )
}

export function ContractorChatRoomPage({ go, routeState = {} }) {
  const chat = routeState.chat || contractorChats[0]
  const [messages, setMessages] = useState(() => {
    const initialMessages = initialMessagesByChat[chat.id] || []
    if (!routeState.autoMessage) return initialMessages

    return [
      ...initialMessages,
      { id: `${chat.id}-auto-${Date.now()}`, from: 'me', text: routeState.autoMessage },
    ]
  })
  const [text, setText] = useState('')
  const lastMessage = getLastMessage(messages)

  const sendMessage = () => {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages((items) => [
      ...items,
      { id: `${chat.id}-${Date.now()}`, from: 'me', text: trimmed },
    ])
    setText('')
  }

  return (
    <ContractorPage title={chat.name} go={go} back={() => go(contractorScreens.chats)}>
      <div className="contractor-chat-summary">
        <strong>최근 대화</strong>
        <p>{lastMessage}</p>
      </div>
      <div className="contractor-chat-room">
        {messages.map((message) => (
          <p className={message.from === 'me' ? 'from-me' : 'from-customer'} key={message.id}>
            {message.text}
          </p>
        ))}
      </div>
      <div className="contractor-chat-compose">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') sendMessage()
          }}
          placeholder="메시지를 입력하세요"
        />
        <button type="button" onClick={sendMessage} disabled={!text.trim()} aria-label="메시지 보내기">
          <FaPaperPlane />
        </button>
      </div>
    </ContractorPage>
  )
}

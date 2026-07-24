import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar } from '../../components/customer/FormControls'
import { CustomerPage } from './CustomerPageShared'
import { createChatSocket, fetchChatMessages, fetchChatRooms, markChatRoomRead } from '../../api/chatApi'
import {
  FaChevronLeft,
  FaPaperPlane,
  FaSearch,
  FaTimes,
  FaWifi,
} from 'react-icons/fa'

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'unread', label: '안 읽음' },
  { key: 'open', label: '진행 중' },
]

function formatMessageTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function formatRoomTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  const sameDay = date.toDateString() === today.toDateString()
  return sameDay
    ? date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function normalizeMessage(message) {
  return {
    id: message.message_id,
    clientId: message.client_message_id,
    from: message.is_mine ? 'me' : 'partner',
    senderId: message.sender_id,
    text: message.content,
    createdAt: message.created_at,
    pending: false,
  }
}

function createClientMessageId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function ChatListPage({ goToRoom, go, clearUnread, back }) {
  const [filter, setFilter] = useState('all')
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    setLoading(true)
    fetchChatRooms()
      .then((data) => {
        if (!ignore) {
          setRooms(data.items || [])
          setError('')
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message || '채팅방을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const filteredRooms = useMemo(() => {
    if (filter === 'unread') return rooms.filter((room) => room.unread_count > 0)
    if (filter === 'open') return rooms.filter((room) => room.room_status === 'OPEN')
    return rooms
  }, [rooms, filter])

  return (
    <CustomerPage go={go} className="cds--white">
      <div className="chat-inbox">
        {back ? (
          <div className="chat-inbox-heading-row">
            <button type="button" className="chat-inbox-back" onClick={back} aria-label="뒤로가기">
              <FaChevronLeft />
            </button>
            <h1 className="chat-inbox-heading">채팅</h1>
          </div>
        ) : (
          <h1 className="chat-inbox-heading">채팅</h1>
        )}

        <div className="chat-inbox-filters">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`chat-inbox-filter ${filter === item.key ? 'is-active' : ''}`}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="chat-inbox-list">
          {loading ? (
            <div className="chat-inbox-empty">채팅방을 불러오는 중입니다.</div>
          ) : error ? (
            <div className="chat-inbox-empty">{error}</div>
          ) : filteredRooms.length === 0 ? (
            <div className="chat-inbox-empty">매칭이 완료되면 1:1 채팅방이 열립니다.</div>
          ) : (
            filteredRooms.map((room) => {
              const preview = room.last_message?.content || room.matching_request_title
              const time = room.last_message?.created_at || room.updated_at
              return (
                <button
                  key={room.chat_room_id}
                  type="button"
                  className={`chat-inbox-item ${room.unread_count > 0 ? 'is-unread' : ''}`}
                  onClick={() => {
                    clearUnread?.(room.chat_room_id)
                    goToRoom?.(room.chat_room_id, room)
                  }}
                >
                  <Avatar tone="blue" />

                  <div className="chat-inbox-item-body">
                    <div className="chat-inbox-item-head">
                      <span className="chat-inbox-item-name">{room.partner_name}</span>
                      <time className="chat-inbox-item-time">{formatRoomTime(time)}</time>
                    </div>
                    <span className="chat-inbox-item-title">{room.matching_request_title}</span>
                    <span className="chat-inbox-item-preview">{preview}</span>
                  </div>

                  {!!room.unread_count && (
                    <span className="chat-inbox-item-badge">{room.unread_count}</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </CustomerPage>
  )
}

export function ChatRoomPage({ chatRoomId, partnerName, back }) {
  const [messages, setMessages] = useState([])
  const [chatText, setChatText] = useState('')
  const [loading, setLoading] = useState(Boolean(chatRoomId))
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('연결 준비')
  const [showSearch, setShowSearch] = useState(false)
  const [searchText, setSearchText] = useState('')
  const socketRef = useRef(null)
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!chatRoomId) return undefined

    let ignore = false
    setLoading(true)
    fetchChatMessages(chatRoomId)
      .then((data) => {
        if (!ignore) {
          const nextMessages = (data.items || []).map(normalizeMessage)
          setMessages(nextMessages)
          const lastMessage = nextMessages[nextMessages.length - 1]
          if (lastMessage?.id) markChatRoomRead(chatRoomId, lastMessage.id).catch(() => {})
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message || '메시지를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [chatRoomId])

  useEffect(() => {
    if (!chatRoomId) return undefined

    const socket = createChatSocket(chatRoomId)
    socketRef.current = socket
    let pingTimer = null

    socket.onopen = () => {
      setConnectionStatus('연결됨')
      pingTimer = window.setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }))
        }
      }, 25000)
    }

    socket.onclose = () => {
      setConnectionStatus('연결 끊김')
      if (pingTimer) window.clearInterval(pingTimer)
    }

    socket.onerror = () => {
      setConnectionStatus('연결 오류')
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type !== 'message.created' || !data.message) return

      const nextMessage = normalizeMessage(data.message)
      setMessages((current) => {
        const withoutPending = current.filter(
          (message) => !nextMessage.clientId || message.clientId !== nextMessage.clientId,
        )
        if (withoutPending.some((message) => message.id === nextMessage.id)) return withoutPending
        return [...withoutPending, nextMessage]
      })
      markChatRoomRead(chatRoomId, data.message.message_id).catch(() => {})
    }

    return () => {
      if (pingTimer) window.clearInterval(pingTimer)
      socket.close()
    }
  }, [chatRoomId])

  const visibleMessages = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    if (!keyword) return messages
    return messages.filter((message) => message.text.toLowerCase().includes(keyword))
  }, [messages, searchText])

  const sendMessage = () => {
    const text = chatText.trim()
    const socket = socketRef.current
    if (!text || !socket || socket.readyState !== WebSocket.OPEN) return

    const clientId = createClientMessageId()
    setMessages((current) => [
      ...current,
      { id: `pending-${clientId}`, clientId, from: 'me', text, createdAt: new Date().toISOString(), pending: true },
    ])
    socket.send(JSON.stringify({ type: 'message.send', client_message_id: clientId, content: text }))
    setChatText('')
  }

  if (!chatRoomId) {
    return (
      <section className="chat-thread-view">
        <header className="chat-thread-view-header">
          <button type="button" className="chat-thread-view-back" onClick={back} aria-label="뒤로가기">
            <FaChevronLeft />
          </button>
          <div className="chat-thread-view-title">
            <h1>채팅</h1>
            <span>채팅방을 먼저 선택해주세요.</span>
          </div>
        </header>
      </section>
    )
  }

  return (
    <section className="chat-thread-view">
      <header className="chat-thread-view-header">
        <button type="button" className="chat-thread-view-back" onClick={back} aria-label="뒤로가기">
          <FaChevronLeft />
        </button>

        <div className="chat-thread-view-title">
          <h1>{partnerName || '1:1 채팅'}</h1>
          <span className={`chat-connection ${connectionStatus === '연결됨' ? 'is-online' : ''}`}>
            <FaWifi aria-hidden="true" />
            {connectionStatus}
          </span>
        </div>

        <button
          type="button"
          className="chat-thread-view-icon-button"
          onClick={() => setShowSearch((value) => !value)}
          aria-label="채팅 검색"
        >
          {showSearch ? <FaTimes /> : <FaSearch />}
        </button>
      </header>

      {showSearch && (
        <div className="chat-thread-search">
          <input
            className="chat-thread-search-input"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="대화 내용 검색"
          />
        </div>
      )}

      <div className="chat-thread-messages" ref={messagesContainerRef}>
        {loading ? (
          <div className="chat-thread-empty">메시지를 불러오는 중입니다.</div>
        ) : error ? (
          <div className="chat-thread-empty">{error}</div>
        ) : visibleMessages.length === 0 ? (
          <div className="chat-thread-empty">아직 메시지가 없습니다.</div>
        ) : (
          visibleMessages.map((message) => (
            <div key={message.id} className={`chat-message-row ${message.from === 'me' ? 'is-mine' : ''}`}>
              <div className={`chat-thread-message ${message.from === 'me' ? 'is-mine' : ''} ${message.pending ? 'is-pending' : ''}`}>
                <span>{message.text}</span>
                <time>{formatMessageTime(message.createdAt)}</time>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-thread-compose">
        <input
          className="chat-thread-compose-input"
          value={chatText}
          placeholder="메시지를 입력하세요"
          onChange={(event) => setChatText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) sendMessage()
          }}
        />

        <button
          type="button"
          className="chat-thread-compose-send"
          onClick={sendMessage}
          disabled={!chatText.trim() || connectionStatus !== '연결됨'}
          aria-label="전송"
        >
          <FaPaperPlane />
        </button>
      </div>
    </section>
  )
}

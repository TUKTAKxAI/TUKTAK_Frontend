import { Avatar } from '../../components/customer/FormControls'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'

export function ChatListPage({ threads, goToRoom, go }) {
  return (
    <section className="chat-list-screen">
      <CustomerTopBar title="채팅" go={go} compact />
      <div className="chip-row">
        <button className="active">전체</button>
        <button>안읽음</button>
        <button>예약 시공</button>
        <button>시공 완료</button>
      </div>
      <div className="list-stack">
        {threads.map((thread) => (
          <button className="chat-thread flat" key={thread.id} onClick={() => goToRoom(thread.id)}>
            <Avatar tone="blue" />
            <div className="chat-thread-copy">
              <div className="chat-thread-head">
                <strong>{thread.name}</strong>
                <time>{thread.time}</time>
              </div>
              <span>{thread.preview}</span>
            </div>
            {thread.unread ? <em>{thread.unread}</em> : null}
          </button>
        ))}
      </div>
    </section>
  )
}

export function ChatRoomPage({ partnerName, messages, chatText, setChatText, sendMessage, back }) {
  return (
    <section className="chat-room-screen">
      <div className="chat-room-head">
        <button className="inline-back-arrow" onClick={back}>‹</button>
        <h1>{partnerName}</h1>
        <div className="chat-room-actions">
          <span>⌕</span>
          <span>☰</span>
        </div>
      </div>
      <div className="message-list roomy">
        {messages.map((message, index) => (
          <div className={`message ${message.from === 'me' ? 'mine' : ''}`} key={`${message.text}-${index}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="chat-compose">
        <input value={chatText} onChange={(event) => setChatText(event.target.value)} />
        <button onClick={sendMessage}>➤</button>
      </div>
    </section>
  )
}

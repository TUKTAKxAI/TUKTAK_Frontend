import { Avatar } from '../../components/customer/FormControls'

export function ChatListPage({ threads, goToRoom }) {
  return (
    <section>
      <div className="search-box">검색</div>
      <div className="list-stack">
        {threads.map((thread) => (
          <button className="chat-thread" key={thread.id} onClick={() => goToRoom(thread.id)}>
            <Avatar />
            <div className="chat-thread-copy">
              <div className="chat-thread-head">
                <strong>{thread.name}</strong>
                <time>{thread.time}</time>
              </div>
              <p>{thread.specialty}</p>
              <span>{thread.preview}</span>
            </div>
            {thread.unread > 0 ? <em>{thread.unread}</em> : null}
          </button>
        ))}
      </div>
    </section>
  )
}

export function ChatRoomPage({ partnerName, messages, chatText, setChatText, sendMessage }) {
  return (
    <section className="chat-screen">
      <div className="chat-partner">
        <Avatar />
        <span>{partnerName}</span>
      </div>
      <div className="message-list">
        {messages.map((message, index) => (
          <div className={`message ${message.from === 'me' ? 'mine' : ''}`} key={`${message.text}-${index}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={chatText}
          onChange={(event) => setChatText(event.target.value)}
          placeholder="메시지 입력"
          onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </section>
  )
}

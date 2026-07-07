import { useState, useEffect } from 'react'
import { ChatListPage, ChatRoomPage } from '../Customer/ChatPage' 
import { chatThreads, initialMessages, contractorScreens } from '../../data/contractorData'
import { screens as customerScreens } from '../../data/customerData'

if (!globalThis.partnerChatThreads) {
  globalThis.partnerChatThreads = JSON.parse(JSON.stringify(chatThreads));
}
if (!globalThis.partnerInitialMessages) {
  globalThis.partnerInitialMessages = JSON.parse(JSON.stringify(initialMessages));
}
if (!globalThis.currentActiveThreadId) {
  globalThis.currentActiveThreadId = 'hong'; 
}

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
  const [threads, setFilterThreads] = useState(globalThis.partnerChatThreads)

  const clearUnread = (threadId) => {
    globalThis.partnerChatThreads = globalThis.partnerChatThreads.map(thread => 
      thread.id === threadId ? { ...thread, unread: 0 } : thread
    )
    setFilterThreads(globalThis.partnerChatThreads)
  }
  const handleGo = (screen) => {
    if (screen === customerScreens.mypage) {
      go?.(contractorScreens.mypage)
    } else {
      go?.(screen)
    }
  }

  return (
    <ChatListPage
      threads={threads}
      messagesByThread={globalThis.partnerInitialMessages}
      goToRoom={(id) => {
        globalThis.currentActiveThreadId = id; 
        
        clearUnread(id); 
        
        go(contractorScreens.chatRoom);
      }}
      go={handleGo}
      clearUnread={clearUnread}
    />
  )
}

export function ContractorChatRoomPage({ go }) {
  const threadId = globalThis.currentActiveThreadId; 
  
  const [chatText, setChatText] = useState('')
  const [messages, setMessages] = useState(globalThis.partnerInitialMessages[threadId] || [])

  const currentThread = globalThis.partnerChatThreads.find(t => t.id === threadId);
  const realPartnerName = currentThread ? currentThread.name : '고객님';

  const sendMessage = () => {
    if (!chatText.trim()) return
    
    const newMessage = { from: 'me', text: chatText }
    
    if (!globalThis.partnerInitialMessages[threadId]) {
      globalThis.partnerInitialMessages[threadId] = [];
    }
    globalThis.partnerInitialMessages[threadId].push(newMessage);
    
    globalThis.partnerChatThreads = globalThis.partnerChatThreads.map(t => 
      t.id === threadId ? { ...t, preview: chatText } : t
    );

    setMessages([...globalThis.partnerInitialMessages[threadId]])
    setChatText('')
  }

  return (
    <ChatRoomPage
      partnerName={realPartnerName} 
      messages={messages}
      chatText={chatText}
      setChatText={setChatText}
      sendMessage={sendMessage}
      back={() => go(contractorScreens.chats)} 
    />
  )
}
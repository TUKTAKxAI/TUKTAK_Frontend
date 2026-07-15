import { useState } from 'react'
import { ChatListPage, ChatRoomPage } from '../Customer/ChatPage'
import { chatThreads, contractorScreens, initialMessages } from '../../data/contractorData'
import { screens as customerScreens } from '../../data/customerData'

if (!globalThis.partnerChatThreads) {
  globalThis.partnerChatThreads = JSON.parse(JSON.stringify(chatThreads))
}

if (!globalThis.partnerInitialMessages) {
  globalThis.partnerInitialMessages = JSON.parse(JSON.stringify(initialMessages))
}

if (!globalThis.currentActiveThreadId) {
  globalThis.currentActiveThreadId = chatThreads[0]?.id ?? ''
}

export function ContractorChatsPage({ go }) {
  const [threads, setThreads] = useState(globalThis.partnerChatThreads)

  const clearUnread = (threadId) => {
    globalThis.partnerChatThreads = globalThis.partnerChatThreads.map((thread) =>
      thread.id === threadId ? { ...thread, unread: 0 } : thread
    )
    setThreads(globalThis.partnerChatThreads)
  }

  const handleGo = (screen) => {
    if (screen === customerScreens.mypage) {
      go?.(contractorScreens.mypage)
      return
    }

    go?.(screen)
  }

  return (
    <ChatListPage
      threads={threads}
      messagesByThread={globalThis.partnerInitialMessages}
      goToRoom={(id) => {
        globalThis.currentActiveThreadId = id
        clearUnread(id)
        go(contractorScreens.chatRoom)
      }}
      go={handleGo}
      clearUnread={clearUnread}
      back={() => go?.(contractorScreens.home)}
    />
  )
}

export function ContractorChatRoomPage({ go }) {
  const threadId = globalThis.currentActiveThreadId
  const [chatText, setChatText] = useState('')
  const [messages, setMessages] = useState(globalThis.partnerInitialMessages[threadId] || [])

  const currentThread = globalThis.partnerChatThreads.find((thread) => thread.id === threadId)
  const partnerName = currentThread ? currentThread.name : '고객님'

  const sendMessage = () => {
    if (!chatText.trim()) return

    const newMessage = { from: 'me', text: chatText }

    if (!globalThis.partnerInitialMessages[threadId]) {
      globalThis.partnerInitialMessages[threadId] = []
    }

    globalThis.partnerInitialMessages[threadId].push(newMessage)
    globalThis.partnerChatThreads = globalThis.partnerChatThreads.map((thread) =>
      thread.id === threadId ? { ...thread, preview: chatText } : thread
    )

    setMessages([...globalThis.partnerInitialMessages[threadId]])
    setChatText('')
  }

  return (
    <ChatRoomPage
      partnerName={partnerName}
      messages={messages}
      chatText={chatText}
      setChatText={setChatText}
      sendMessage={sendMessage}
      back={() => go(contractorScreens.chats)}
    />
  )
}

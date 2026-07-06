import { createContext, useContext, useMemo, useState } from 'react'
import { chatThreads, initialMessages, screens } from '../data/customerData'
import { screenPaths } from '../routes/customerRoutes'

const CustomerFlowContext = createContext(null)

export function CustomerFlowProvider({ children }) {
  const [userType, setUserType] = useState('customer')
  const [terms, setTerms] = useState([true, true, true, true, false])
  const [activeThread, setActiveThread] = useState(chatThreads[0].id)
  const [chatText, setChatText] = useState('')
  const [messagesByThread, setMessagesByThread] = useState(initialMessages)
  const [showUrgentModal, setShowUrgentModal] = useState(false)

  const activeMessages = messagesByThread[activeThread] || []
  const activePartner = useMemo(
    () => chatThreads.find((thread) => thread.id === activeThread)?.name || '홍길동 파트너님',
    [activeThread],
  )

  const sendMessage = () => {
    const trimmed = chatText.trim()
    if (!trimmed) return
    setMessagesByThread((items) => ({
      ...items,
      [activeThread]: [...(items[activeThread] || []), { from: 'me', text: trimmed }],
    }))
    setChatText('')
  }

  const openThread = (threadId, navigate) => {
    setActiveThread(threadId)
    navigate(screenPaths[screens.chatRoom])
  }

  const value = {
    userType,
    setUserType,
    terms,
    setTerms,
    activeThread,
    setActiveThread,
    chatText,
    setChatText,
    messagesByThread,
    setMessagesByThread,
    activeMessages,
    activePartner,
    sendMessage,
    openThread,
    showUrgentModal,
    setShowUrgentModal,
  }

  return <CustomerFlowContext.Provider value={value}>{children}</CustomerFlowContext.Provider>
}

export function useCustomerFlow() {
  const context = useContext(CustomerFlowContext)
  if (!context) {
    throw new Error('useCustomerFlow must be used inside CustomerFlowProvider')
  }
  return context
}

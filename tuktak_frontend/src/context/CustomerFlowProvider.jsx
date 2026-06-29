import { useMemo, useState } from 'react'
import { createMatchingRequest } from '../api/matchingApi'
import { CustomerFlowContext } from './CustomerFlowContext'
import { chatThreads, initialMessages, screens } from '../data/customerData'
import { screenPaths } from '../routes/customerRoutes'

function getEstimateTitle(estimate) {
  return estimate?.repair_task_name || estimate?.object_label || estimate?.main_category || estimate?.title || '거실 몰딩 시공'
}

export function CustomerFlowProvider({ children }) {
  const [userType, setUserType] = useState('customer')
  const [terms, setTerms] = useState([true, true, true, true, false])
  const [activeThread, setActiveThread] = useState(chatThreads[0].id)
  const [chatText, setChatText] = useState('')
  const [messagesByThread, setMessagesByThread] = useState(initialMessages)
  const [showUrgentModal, setShowUrgentModal] = useState(false)
  const [matchingFlow, setMatchingFlow] = useState({
    selectedEstimate: null,
    selectedAddress: {
      region_code_id: 1,
      address: '서울시 종로구 인사동길',
      label: '서울시 종로구 인사동길 ....',
    },
    schedule: {
      preferred_date: '2026-06-23',
      preferred_time_start: '15:00',
      preferred_time_end: '18:00',
    },
    isEmergency: false,
    matchingRequestId: null,
    selectedQuoteId: null,
    selectedQuote: null,
    workOrderId: null,
  })

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

  const updateMatchingFlow = (nextValue) => {
    setMatchingFlow((current) => ({
      ...current,
      ...(typeof nextValue === 'function' ? nextValue(current) : nextValue),
    }))
  }

  const submitMatchingRequest = async (isEmergency = false) => {
    const estimate = matchingFlow.selectedEstimate || {
      estimate_id: 1,
      repair_task_name: '거실 몰딩 시공',
      min_price: 600000,
      max_price: 670000,
    }
    const address = matchingFlow.selectedAddress
    const schedule = matchingFlow.schedule
    const data = await createMatchingRequest({
      estimate_id: estimate.estimate_id,
      title: getEstimateTitle(estimate),
      region_code_id: address.region_code_id,
      address: address.address,
      preferred_date: schedule.preferred_date,
      preferred_time_start: schedule.preferred_time_start,
      preferred_time_end: schedule.preferred_time_end,
      budget_min: estimate.min_price,
      budget_max: estimate.max_price,
      request_message: '',
      privacy_settings: {},
      is_emergency: isEmergency,
    })

    updateMatchingFlow({
      isEmergency,
      matchingRequestId: data.matching_request_id,
    })

    return data
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
    matchingFlow,
    setMatchingFlow,
    updateMatchingFlow,
    submitMatchingRequest,
  }

  return <CustomerFlowContext.Provider value={value}>{children}</CustomerFlowContext.Provider>
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createMatchingRequest } from '../api/matchingApi'
import { CustomerFlowContext } from './CustomerFlowContext'
import { initialMessages, screens } from '../data/customerData'
import { mockMatchingRequest, useMatchingMocks } from '../data/matchingMockData'
import { screenPaths } from '../routes/customerRoutes'
import { buildMatchingRequestBody } from '../utils/matchingRequest'

export function CustomerFlowProvider({ children }) {
  const [userType, setUserType] = useState('customer')
  const [terms, setTerms] = useState([true, true, true, true, false])
  const [activeThread, setActiveThread] = useState('')
  const [chatText, setChatText] = useState('')
  const [messagesByThread, setMessagesByThread] = useState(initialMessages)
  const [showUrgentModal, setShowUrgentModal] = useState(false)
  const [matchingFlow, setMatchingFlow] = useState({
    selectedEstimate: null,
    selectedAddress: null,
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
    currentMatchingId: null,
    matchingHistory: [],
  })

  const activeMessages = useMemo(
    () => messagesByThread[activeThread] || [],
    [messagesByThread, activeThread],
  )
  const activePartner = useMemo(
    () => '1:1 채팅',
    [],
  )

  // 아래 두 ref는 sendMessage/submitMatchingRequest가 매 렌더 새로 만들어지지 않도록
  // (context value 전체가 매 렌더 바뀌면 이 값을 구독하는 모든 화면이 불필요하게
  // 리렌더/effect 재실행됨) 최신 state를 클로저 없이 참조하기 위한 용도.
  const chatTextRef = useRef(chatText)
  useEffect(() => {
    chatTextRef.current = chatText
  }, [chatText])

  const activeThreadRef = useRef(activeThread)
  useEffect(() => {
    activeThreadRef.current = activeThread
  }, [activeThread])

  const matchingFlowRef = useRef(matchingFlow)
  useEffect(() => {
    matchingFlowRef.current = matchingFlow
  }, [matchingFlow])

  const sendMessage = useCallback(() => {
    const trimmed = chatTextRef.current.trim()
    if (!trimmed) return
    const thread = activeThreadRef.current
    setMessagesByThread((items) => ({
      ...items,
      [thread]: [...(items[thread] || []), { from: 'me', text: trimmed }],
    }))
    setChatText('')
  }, [])

  const openThread = useCallback((threadId, navigate) => {
    setActiveThread(threadId)
    navigate(screenPaths[screens.chatRoom])
  }, [])

  const updateMatchingFlow = useCallback((nextValue) => {
    setMatchingFlow((current) => ({
      ...current,
      ...(typeof nextValue === 'function' ? nextValue(current) : nextValue),
    }))
  }, [])

  const submitMatchingRequest = useCallback(async (isEmergency = false) => {
    const { selectedEstimate: estimate, selectedAddress: address, schedule: currentSchedule } = matchingFlowRef.current
    if (!estimate?.estimate_id) throw new Error('AI 견적서를 먼저 선택해주세요.')
    if (!address?.region_code_id || !address?.address) throw new Error('매칭 요청에 사용할 주소 정보가 필요합니다.')
    if (!address?.address_detail?.trim()) throw new Error('상세 주소를 입력해주세요.')

    const schedule = isEmergency ? {
      preferred_date: new Date().toISOString().slice(0, 10),
      preferred_time_start: null,
      preferred_time_end: null,
    } : currentSchedule

    let data
    try {
      data = await createMatchingRequest(buildMatchingRequestBody({ estimate, address, schedule, isEmergency }))
    } catch (error) {
      if (!useMatchingMocks) throw error
      data = mockMatchingRequest
    }

    updateMatchingFlow({
      isEmergency,
      schedule,
      matchingRequestId: data.matching_request_id,
      matchingStatus: data.matching_status,
      matchedContractorCount: data.matched_contractor_count,
      matchingExpiresAt: data.expires_at,
    })

    return data
  }, [updateMatchingFlow])

  const value = useMemo(() => ({
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
  }), [
    userType,
    terms,
    activeThread,
    chatText,
    messagesByThread,
    activeMessages,
    activePartner,
    sendMessage,
    openThread,
    showUrgentModal,
    matchingFlow,
    updateMatchingFlow,
    submitMatchingRequest,
  ])

  return <CustomerFlowContext.Provider value={value}>{children}</CustomerFlowContext.Provider>
}

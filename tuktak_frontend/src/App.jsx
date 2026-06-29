import { useMemo, useState } from 'react'
import { AppHeader } from './components/customer/AppHeader'
import { BottomNav } from './components/customer/BottomNav'
import { chatThreads, initialMessages, publicScreens, screenTitles, screens } from './data/customerData'
import { AuthPages } from './pages/Customer/AuthPages'
import { ChatListPage, ChatRoomPage } from './pages/Customer/ChatPage'
import { EstimateFormPage, EstimateHomePage, EstimateListPage } from './pages/Customer/EstimatePages'
import { HomePage } from './pages/Customer/HomePage'
import { MatchHistoryPage, MatchingPage, PartnerDetailPage, ReviewWritePage } from './pages/Customer/MatchingPages'
import { MyPage, MyReviewsPage, ProfilePage } from './pages/Customer/MyPages'
import { RiskDetailPage, RiskListPage } from './pages/Customer/RiskPages'
import './App.css'

function App() {
  const [screen, setScreen] = useState(screens.login)
  const [history, setHistory] = useState([])
  const [userType, setUserType] = useState('customer')
  const [terms, setTerms] = useState([true, true, true, true, false])
  const [activeThread, setActiveThread] = useState(chatThreads[0].id)
  const [chatText, setChatText] = useState('')
  const [messagesByThread, setMessagesByThread] = useState(initialMessages)

  const go = (next) => {
    setHistory((items) => [...items, screen])
    setScreen(next)
  }

  const back = () => {
    setHistory((items) => {
      const next = [...items]
      setScreen(next.pop() || screens.login)
      return next
    })
  }

  const openThread = (threadId) => {
    setActiveThread(threadId)
    go(screens.chatRoom)
  }

  const sendMessage = () => {
    const trimmed = chatText.trim()
    if (!trimmed) return
    setMessagesByThread((items) => ({
      ...items,
      [activeThread]: [...(items[activeThread] || []), { from: 'me', text: trimmed }],
    }))
    setChatText('')
  }

  const title = useMemo(() => screenTitles[screen], [screen])
  const isPublicScreen = publicScreens.includes(screen)
  const activeMessages = messagesByThread[activeThread] || []
  const activePartner = chatThreads.find((thread) => thread.id === activeThread)?.name || '파트너'

  return (
    <div className="app-shell">
      <main className="phone" data-screen={screen}>
        {isPublicScreen ? (
          <AuthPages
            screen={screen}
            setScreen={setScreen}
            go={go}
            back={back}
            userType={userType}
            setUserType={setUserType}
            terms={terms}
            setTerms={setTerms}
          />
        ) : (
          <>
            <AppHeader title={title} back={back} onSearch={() => go(screens.estimateList)} />
            <div className="scroll-area">
              {screen === screens.home && <HomePage go={go} />}
              {screen === screens.estimate && <EstimateHomePage go={go} />}
              {screen === screens.estimateForm && <EstimateFormPage go={go} />}
              {screen === screens.estimateList && <EstimateListPage go={go} />}
              {screen === screens.matching && <MatchingPage go={go} />}
              {screen === screens.partner && <PartnerDetailPage go={go} />}
              {screen === screens.matchHistory && <MatchHistoryPage go={go} />}
              {screen === screens.reviewWrite && <ReviewWritePage go={go} />}
              {screen === screens.risk && <RiskListPage go={go} />}
              {screen === screens.riskDetail && <RiskDetailPage />}
              {screen === screens.chatList && <ChatListPage threads={chatThreads} goToRoom={openThread} />}
              {screen === screens.chatRoom && (
                <ChatRoomPage
                  partnerName={activePartner}
                  messages={activeMessages}
                  chatText={chatText}
                  setChatText={setChatText}
                  sendMessage={sendMessage}
                />
              )}
              {screen === screens.mypage && <MyPage go={go} />}
              {screen === screens.myReviews && <MyReviewsPage />}
              {screen === screens.profile && <ProfilePage />}
            </div>
            <BottomNav current={screen} go={go} />
          </>
        )}
      </main>
    </div>
  )
}

export default App

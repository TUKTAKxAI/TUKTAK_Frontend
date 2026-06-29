import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { BottomNav } from './components/customer/BottomNav'
import { useCustomerFlow } from './context/CustomerFlowProvider'
import { chatThreads, publicScreens, screens } from './data/customerData'
import { AuthPages } from './pages/Customer/AuthPages'
import { ChatListPage, ChatRoomPage } from './pages/Customer/ChatPage'
import {
  EstimateDonePage,
  EstimateHomePage,
  EstimateLoadingPage,
  EstimateOutputPage,
  EstimateStartPage,
  MyEstimateListPage,
} from './pages/Customer/EstimatePages'
import { HomePage } from './pages/Customer/HomePage'
import {
  MatchingAddressListPage,
  MatchingAddressSelectPage,
  MatchingAuctionPage,
  MatchingDonePage,
  MatchingEstimateSelectPage,
  MatchingHomePage,
  MatchingPartnerInfoPage,
  MatchingPartnerPage,
  MatchingProgressPage,
  MatchingSchedulePage,
  ReviewWritePage,
  UrgentModal,
} from './pages/Customer/MatchingPages'
import { MatchHistoryPage, MyPage, MyReviewsPage, ProfilePage } from './pages/Customer/MyPages'
import { MyRiskListPage, RiskDonePage, RiskHomePage, RiskLoadingPage, RiskOutputPage, RiskSelectPage } from './pages/Customer/RiskPages'
import { routeScreens, screenPaths } from './routes/customerRoutes'
import './App.css'

function useScreenNavigator() {
  const navigate = useNavigate()
  const go = (screen) => navigate(screenPaths[screen] || screenPaths[screens.home])
  const back = () => navigate(-1)
  const setScreen = go

  return { navigate, go, back, setScreen }
}

function PublicRoute({ screen }) {
  const flow = useCustomerFlow()
  const { go, back, setScreen } = useScreenNavigator()

  return (
    <AuthPages
      screen={screen}
      setScreen={setScreen}
      go={go}
      back={back}
      userType={flow.userType}
      setUserType={flow.setUserType}
      terms={flow.terms}
      setTerms={flow.setTerms}
    />
  )
}

function CustomerLayout({ screen, children }) {
  const { go } = useScreenNavigator()

  return (
    <>
      <div className="scroll-area app-flow">{children}</div>
      <BottomNav current={screen} go={go} />
      <UrgentDialog />
    </>
  )
}

function UrgentDialog() {
  const flow = useCustomerFlow()
  const { go } = useScreenNavigator()

  if (!flow.showUrgentModal) return null

  return (
    <UrgentModal
      close={() => flow.setShowUrgentModal(false)}
      confirm={() => {
        flow.setShowUrgentModal(false)
        go(screens.matchingProgress)
      }}
    />
  )
}

function CustomerRoute({ screen }) {
  const flow = useCustomerFlow()
  const { navigate, go, back } = useScreenNavigator()

  const pages = {
    [screens.home]: <HomePage go={go} />,
    [screens.estimateHome]: <EstimateHomePage go={go} />,
    [screens.estimateStart]: <EstimateStartPage go={go} />,
    [screens.estimateLoading]: <EstimateLoadingPage go={go} />,
    [screens.estimateDone]: <EstimateDonePage go={go} />,
    [screens.estimateOutput]: <EstimateOutputPage go={go} />,
    [screens.myEstimateList]: <MyEstimateListPage go={go} />,
    [screens.matchingHome]: <MatchingHomePage go={go} />,
    [screens.matchingEstimateSelect]: <MatchingEstimateSelectPage go={go} />,
    [screens.matchingAddressList]: <MatchingAddressListPage go={go} />,
    [screens.matchingAddressSelect]: <MatchingAddressSelectPage go={go} />,
    [screens.matchingSchedule]: <MatchingSchedulePage go={go} openUrgent={() => flow.setShowUrgentModal(true)} />,
    [screens.matchingProgress]: <MatchingProgressPage go={go} />,
    [screens.matchingAuction]: <MatchingAuctionPage go={go} />,
    [screens.matchingPartner]: <MatchingPartnerPage go={go} />,
    [screens.matchingPartnerInfo]: <MatchingPartnerInfoPage go={go} />,
    [screens.matchingDone]: <MatchingDonePage go={go} />,
    [screens.riskHome]: <RiskHomePage go={go} />,
    [screens.riskSelect]: <RiskSelectPage go={go} />,
    [screens.riskLoading]: <RiskLoadingPage go={go} />,
    [screens.riskDone]: <RiskDonePage go={go} />,
    [screens.riskOutput]: <RiskOutputPage go={go} />,
    [screens.myRiskList]: <MyRiskListPage go={go} />,
    [screens.chatList]: (
      <ChatListPage
        threads={chatThreads}
        go={go}
        goToRoom={(threadId) => flow.openThread(threadId, navigate)}
      />
    ),
    [screens.chatRoom]: (
      <ChatRoomPage
        partnerName={flow.activePartner}
        messages={flow.activeMessages}
        chatText={flow.chatText}
        setChatText={flow.setChatText}
        sendMessage={flow.sendMessage}
        back={back}
      />
    ),
    [screens.mypage]: <MyPage go={go} />,
    [screens.myReviews]: <MyReviewsPage go={go} />,
    [screens.profile]: <ProfilePage go={go} />,
    [screens.matchHistory]: <MatchHistoryPage go={go} />,
    [screens.reviewWrite]: <ReviewWritePage go={go} />,
  }

  return <CustomerLayout screen={screen}>{pages[screen] || <Navigate to={screenPaths.home} replace />}</CustomerLayout>
}

function App() {
  return (
    <div className="app-shell">
      <main className="phone">
        <Routes>
          <Route path="/" element={<Navigate to={screenPaths[screens.login]} replace />} />
          {routeScreens.map(({ screen, path }) => (
            <Route
              key={screen}
              path={path}
              element={publicScreens.includes(screen) ? <PublicRoute screen={screen} /> : <CustomerRoute screen={screen} />}
            />
          ))}
          <Route path="*" element={<Navigate to={screenPaths[screens.login]} replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

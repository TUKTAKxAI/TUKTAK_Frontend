import { useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { BottomNav } from './components/customer/BottomNav'
import { useAuth } from './context/authContext'
import { useCustomerFlow } from './context/CustomerFlowContext'
import { CustomerNotificationProvider } from './context/CustomerNotificationProvider'
import { chatThreads, publicScreens, screens } from './data/customerData'
import { contractorScreens } from './data/contractorData'
import {
  ContractorActiveWorkPage,
  ContractorAiEstimatePage,
  ContractorChatRoomPage,
  ContractorChatsPage,
  ContractorHomePage,
  ContractorMyInfoPage,
  ContractorMyRegionsPage,
  ContractorMyServicesPage,
  ContractorMypagePage,
  ContractorNotificationsPage,
  ContractorQuoteDonePage,
  ContractorQuoteFormPage,
  ContractorQuotesPage,
  ContractorRecordDetailPage,
  ContractorRecordsPage,
  ContractorRequestDetailPage,
  ContractorRequestsPage,
  ContractorReviewsPage,
} from './pages/contractor'
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
import { contractorRouteScreens, contractorScreenPaths } from './routes/contractorRoutes'
import { routeScreens, screenPaths } from './routes/customerRoutes'
import './App.css'

const PREFERRED_ROLE_KEY = 'tuktak_preferred_role'

function getPreferredRole() {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(PREFERRED_ROLE_KEY) || ''
}

function useScreenNavigator() {
  const navigate = useNavigate()
  const go = (screen) => {
    if (typeof screen === 'string' && screen.startsWith('/')) {
      navigate(screen)
      return
    }
    navigate(screenPaths[screen] || screenPaths[screens.home])
  }
  const back = () => navigate(-1)
  const setScreen = go

  return { navigate, go, back, setScreen }
}

function PublicRoute({ screen }) {
  const flow = useCustomerFlow()
  const { isLogin, loading, user } = useAuth()
  const location = useLocation()
  const { go, back, setScreen } = useScreenNavigator()
  const forceLogin = Boolean(location.state?.forceLogin)

  if (loading) return null

  if (isLogin && screen !== screens.welcome && !forceLogin) {
    return <Navigate to={getHomePathForUser(user, getPreferredRole())} replace />
  }

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
      initialSelectedRole={location.state?.role}
    />
  )
}

function CustomerLayout({ screen, children }) {
  const { go } = useScreenNavigator()
  const fixedListScreens = [screens.matchHistory, screens.myEstimateList, screens.myRiskList, screens.myReviews]

  return (
    <>
      <div className={`scroll-area app-flow ${fixedListScreens.includes(screen) ? 'history-layout-scroll' : ''}`}>{children}</div>
      <BottomNav current={screen} go={go} />
      <UrgentDialog />
    </>
  )
}

function useContractorNavigator() {
  const navigate = useNavigate()
  const go = (screen, state) => navigate(contractorScreenPaths[screen] || contractorScreenPaths[contractorScreens.home], { state })

  return { go }
}

function ContractorLayout({ children }) {
  return (
    <>
      <div className="scroll-area app-flow">{children}</div>
    </>
  )
}

function ContractorRoute({ screen }) {
  const { go } = useContractorNavigator()
  const { isLogin, loading, user } = useAuth()
  const location = useLocation()
  const routeState = location.state || {}
  const loginRedirect = (
    <Navigate
      to={screenPaths[screens.login]}
      replace
      state={{ forceLogin: true, role: 'partner', from: location.pathname }}
    />
  )

  if (loading) return null
  if (!isLogin || !hasContractorAccess(user)) return loginRedirect

  const pages = {
    [contractorScreens.home]: <ContractorHomePage go={go} />,
    [contractorScreens.notifications]: <ContractorNotificationsPage go={go} />,
    [contractorScreens.activeWork]: <ContractorActiveWorkPage go={go} />,
    [contractorScreens.requests]: <ContractorRequestsPage go={go} />,
    [contractorScreens.requestDetail]: <ContractorRequestDetailPage go={go} routeState={routeState} />,
    [contractorScreens.aiEstimate]: <ContractorAiEstimatePage go={go} routeState={routeState} />,
    [contractorScreens.quoteForm]: <ContractorQuoteFormPage go={go} routeState={routeState} />,
    [contractorScreens.quoteDone]: <ContractorQuoteDonePage go={go} />,
    [contractorScreens.quotes]: <ContractorQuotesPage go={go} />,
    [contractorScreens.records]: <ContractorRecordsPage go={go} />,
    [contractorScreens.recordDetail]: <ContractorRecordDetailPage go={go} routeState={routeState} />,
    [contractorScreens.chats]: <ContractorChatsPage go={go} />,
    [contractorScreens.chatRoom]: <ContractorChatRoomPage go={go} />,
    [contractorScreens.reviews]: <ContractorReviewsPage go={go} />,
    [contractorScreens.mypage]: <ContractorMypagePage go={go} />,
    [contractorScreens.myInfo]: <ContractorMyInfoPage go={go} />,
    [contractorScreens.myServices]: <ContractorMyServicesPage go={go} />,
    [contractorScreens.myRegions]: <ContractorMyRegionsPage go={go} />,
  }

  return <ContractorLayout>{pages[screen] || <Navigate to={contractorScreenPaths[contractorScreens.home]} replace />}</ContractorLayout>
}

function hasContractorAccess(user) {
  const role = getUserRole(user)
  if (role === 'CONTRACTOR' || role === 'BOTH' || role === 'PARTNER') return true

  const currentUser = user?.data?.user ?? user?.data ?? user
  const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : []
  return roles.some((item) => {
    const normalized = String(item?.role || item?.name || item).toUpperCase()
    return normalized === 'CONTRACTOR' || normalized === 'BOTH' || normalized === 'PARTNER'
  })
}

function getUserRole(user) {
  const currentUser = user?.data?.user ?? user?.data ?? user?.user ?? user
  return String(currentUser?.user_type || currentUser?.userType || currentUser?.role || currentUser?.type || '').toUpperCase()
}

function getHomePathForUser(user, preferredRole = '') {
  if (preferredRole === 'customer' && hasCustomerAccess(user)) {
    return screenPaths[screens.home]
  }

  if (preferredRole === 'partner' && hasContractorAccess(user)) {
    return contractorScreenPaths[contractorScreens.home]
  }

  return hasContractorAccess(user)
    ? contractorScreenPaths[contractorScreens.home]
    : screenPaths[screens.home]
}

function hasCustomerAccess(user) {
  const role = getUserRole(user)
  if (!role || role === 'CUSTOMER' || role === 'BOTH' || role === 'USER') return true

  const currentUser = user?.data?.user ?? user?.data ?? user?.user ?? user
  const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : []
  return roles.some((item) => {
    const normalized = String(item?.role || item?.name || item).toUpperCase()
    return normalized === 'CUSTOMER' || normalized === 'BOTH' || normalized === 'USER'
  })
}

function UrgentDialog() {
  const flow = useCustomerFlow()
  const { go } = useScreenNavigator()

  if (!flow.showUrgentModal) return null

  return (
    <UrgentModal
      close={() => flow.setShowUrgentModal(false)}
      confirm={async () => {
        try {
          await flow.submitMatchingRequest(true)
          flow.setShowUrgentModal(false)
          go(screens.matchingProgress)
        } catch {
          flow.updateMatchingFlow({
            matchingStatus: '매칭 요청 실패',
            matchingError: '긴급 매칭 요청에 실패했습니다. AI 견적서와 주소 정보를 확인해주세요.',
          })
          flow.setShowUrgentModal(false)
        }
      }}
    />
  )
}

/* 수정 */
function CustomerRoute({ screen }) {
  const flow = useCustomerFlow()
  const { isLogin, loading } = useAuth()
  const { navigate, go, back } = useScreenNavigator()

  const [threadList, setThreadList] = useState(chatThreads)

  if (loading) return null
  if (!isLogin) return <Navigate to={screenPaths[screens.login]} replace />

  const clearUnread = (threadId) => {
    setThreadList((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
            ...thread,
            unread: 0,
          }
          : thread
      )
    )
  }

  const pages = {
    [screens.home]: <HomePage go={go} />,
    [screens.estimateHome]: <EstimateHomePage go={go} />,
    [screens.estimateStart]: <EstimateStartPage go={go} />,
    [screens.estimateLoading]: <EstimateLoadingPage go={go} />,
    [screens.estimateDone]: <EstimateDonePage go={go} />,
    [screens.estimateOutput]: <EstimateOutputPage go={go} />,
    [screens.myEstimateList]: <MyEstimateListPage go={go} back={back} />,
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
    [screens.myRiskList]: <MyRiskListPage go={go} back={back} />,
    /* 수정 */
    [screens.chatList]: (
      <ChatListPage
        threads={threadList}
        messagesByThread={flow.messagesByThread}
        go={go}
        clearUnread={clearUnread}
        goToRoom={(threadId) =>
          flow.openThread(threadId, navigate)
        }
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
    [screens.mypage]: <MyPage go={go} back={back} />,
    [screens.myReviews]: <MyReviewsPage go={go} back={back} />,
    [screens.profile]: <ProfilePage go={go} back={back} />,
    [screens.matchHistory]: <MatchHistoryPage go={go} back={back} />,
    [screens.reviewWrite]: <ReviewWritePage go={go} />,
  }

  return <CustomerLayout screen={screen}>{pages[screen] || <Navigate to={screenPaths.home} replace />}</CustomerLayout>
}

function App() {
  const { isLogin, loading, user } = useAuth()
  const initialPath = loading || !isLogin ? screenPaths[screens.login] : getHomePathForUser(user)

  return (
    <div className="app-shell">
      <main className="phone">
        <CustomerNotificationProvider>
          <Routes>
            <Route path="/" element={<Navigate to={initialPath} replace />} />
            {routeScreens.map(({ screen, path }) => (
              <Route
                key={screen}
                path={path}
                element={publicScreens.includes(screen) ? <PublicRoute screen={screen} /> : <CustomerRoute screen={screen} />}
              />
            ))}
            {contractorRouteScreens.map(({ screen, path }) => (
              <Route
                key={screen}
                path={path}
                element={<ContractorRoute screen={screen} />}
              />
            ))}
            <Route path="*" element={<Navigate to={initialPath} replace />} />
          </Routes>
        </CustomerNotificationProvider>
      </main>
    </div>
  )
}

export default App

import { contractorScreens } from '../data/contractorData'

export const contractorScreenPaths = {
  [contractorScreens.home]: '/contractor/home',
  [contractorScreens.notifications]: '/contractor/notifications',
  [contractorScreens.activeWork]: '/contractor/active-work',
  [contractorScreens.requests]: '/contractor/requests',
  [contractorScreens.requestDetail]: '/contractor/requests/detail',
  [contractorScreens.aiEstimate]: '/contractor/requests/ai-estimate',
  [contractorScreens.quoteForm]: '/contractor/requests/quote',
  [contractorScreens.quoteDone]: '/contractor/requests/quote/done',
  [contractorScreens.quotes]: '/contractor/quotes',
  [contractorScreens.records]: '/contractor/records',
  [contractorScreens.recordDetail]: '/contractor/records/detail',
  [contractorScreens.chats]: '/contractor/chats',
  [contractorScreens.chatRoom]: '/contractor/chats/room',
  [contractorScreens.reviews]: '/contractor/reviews',
  [contractorScreens.mypage]: '/contractor/mypage',
  [contractorScreens.myInfo]: '/contractor/mypage/info',
  [contractorScreens.myServices]: '/contractor/mypage/services',
  [contractorScreens.myRegions]: '/contractor/mypage/regions',
}

export const contractorRouteScreens = Object.entries(contractorScreenPaths).map(([screen, path]) => ({
  screen,
  path,
}))

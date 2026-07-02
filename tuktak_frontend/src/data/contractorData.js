export const contractorScreens = {
  home: 'contractorHome',
  notifications: 'contractorNotifications',
  activeWork: 'contractorActiveWork',
  requests: 'contractorRequests',
  requestDetail: 'contractorRequestDetail',
  aiEstimate: 'contractorAiEstimate',
  quoteForm: 'contractorQuoteForm',
  quoteDone: 'contractorQuoteDone',
  quotes: 'contractorQuotes',
  records: 'contractorRecords',
  recordDetail: 'contractorRecordDetail',
  chats: 'contractorChats',
  chatRoom: 'contractorChatRoom',
  reviews: 'contractorReviews',
  mypage: 'contractorMypage',
  myInfo: 'contractorMyInfo',
  myServices: 'contractorMyServices',
  myRegions: 'contractorMyRegions',
}

export const contractorNavItems = [
  { key: contractorScreens.home, label: '홈' },
  { key: contractorScreens.requests, label: '요청' },
  { key: contractorScreens.records, label: '작업' },
  { key: contractorScreens.chats, label: '채팅' },
  { key: contractorScreens.mypage, label: '마이' },
]

export const contractorProfile = {
  name: '홍길동',
  email: 'hongroadest@abc.com',
  businessName: '홍길동 파트너스',
  notificationEnabled: true,
  services: ['도어락 수리', '창틀 수리', '에어컨 수리', '문 수리'],
  regions: ['경기도 김포시', '경기도 고양시'],
}

export const contractorActiveWork = {
  title: '거실 도배 시공',
  date: '7/3 오후 3:00',
  region: '경기도 고양시 일산동구',
  status: '진행중',
}

export const contractorRequests = [
  { id: 'req-1', region: '경기도 김포시', title: '도어락 수리', budget: '100,000원', desiredDate: '2026.07.12', time: '15:00 - 18:00', status: '신규' },
  { id: 'req-2', region: '경기도 김포시', title: '창틀 수리', budget: '180,000원', desiredDate: '2026.07.13', time: '09:00 - 18:00', status: '신규' },
  { id: 'req-3', region: '경기도 김포시', title: '에어컨 수리', budget: '120,000원', desiredDate: '2026.07.13', time: '12:00 - 18:00', status: '검토중' },
  { id: 'req-4', region: '경기도 고양시', title: '문 수리', budget: '90,000원', desiredDate: '2026.07.14', time: '09:00 - 17:00', status: '신규' },
]

export const contractorQuotes = [
  { id: 'quote-1', requestTitle: '도어락 수리', amount: '100,000원', status: '전송완료', validUntil: '2026.07.20' },
  { id: 'quote-2', requestTitle: '창틀 수리', amount: '180,000원', status: '선택대기', validUntil: '2026.07.21' },
]

export const contractorWorkOrders = [
  { id: 'work-1', title: '거실 도배 시공', region: '경기도 고양시', date: '2026.07.03', time: '15:00', status: '진행중', amount: '620,000원' },
  { id: 'work-2', title: '창틀 수리', region: '경기도 김포시', date: '2026.06.28', time: '11:00', status: '완료', amount: '180,000원' },
]

export const contractorChats = [
  { id: 'chat-1', name: '김고객님', preview: '내일 오후 3시에 방문 가능하실까요?', time: '오후 3:30', unread: 1 },
  { id: 'chat-2', name: '박고객님', preview: '견적 확인했습니다.', time: '어제', unread: 0 },
]

export const contractorReviews = [
  { id: 'review-1', customer: '김고객', title: '도어락 수리', rating: 5, body: '시간 맞춰 오시고 깔끔하게 수리해주셨어요.' },
  { id: 'review-2', customer: '박고객', title: '창틀 수리', rating: 4, body: '설명이 친절했고 마감도 좋았습니다.' },
]

export const contractorNotifications = [
  { id: 'noti-1', title: '새 시공 요청이 도착했습니다.', body: '경기도 김포시 도어락 수리 요청', time: '방금 전' },
  { id: 'noti-2', title: '견적서가 선택 대기중입니다.', body: '창틀 수리 견적을 고객이 확인했습니다.', time: '1시간 전' },
]

export const contractorServiceOptions = [
  '가전 전체',
  '에어컨',
  '배관 / 누수',
  '세탁기',
  '욕실',
  '냉장고',
  '전기 / 조명',
  '도배 / 벽면',
  '창호 / 문',
  '타일 / 바닥',
]

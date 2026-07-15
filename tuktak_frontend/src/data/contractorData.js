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

// 파트너 회원가입 약관 (파트너 데이터이므로 contractorData.js 에 유지)
export const partnerSignupTerms = [
  '(필수) 파트너 서비스 이용약관 동의',
  '(필수) 개인정보 수집 및 이용 동의',
  '(필수) 시공 표준(시방서) 준수 및 하자보수(AS) 정책 동의',
  '(필수) 고객 매칭을 위한 프로필 정보 공개 동의',
  '(선택) 플랫폼 파트너 혜택 및 마케팅 정보 수신 동의',
]

export const contractorProfile = {
  name: '홍길동',
  email: 'hongroadest@abc.com',
  phone: '010-1234-5678',
  businessName: '홍길동 파트너스',
  notificationEnabled: true,
  services: ['도어락 수리', '창호 수리', '에어컨 수리', '문 수리'],
  regions: ['경기도 김포시', '경기도 고양시'],
}

export const contractorActiveWork = {
  title: '거실 도배 시공',
  price: '620,000원',
  date: '2026.07.03',
  visitTime: '오후 3:00',
  address: '경기도 고양시 일산동구 중앙로 123, 101동 1204호',
  duration: '약 4시간',
  customer: {
    name: '김고객',
    phone: '010-9876-5432',
  },
  status: '진행중',
}

export const contractorQuotes = [
  { id: 'quote-1', requestTitle: '도어락 수리', amount: '100,000원', status: '전송완료', validUntil: '2026.07.20' },
  { id: 'quote-2', requestTitle: '창호 수리', amount: '180,000원', status: '선택대기', validUntil: '2026.07.21' },
]

export const contractorWorkOrders = [
  { id: 'work-1', title: '거실 도배 시공', region: '경기도 고양시', date: '2026.07.03', time: '15:00', status: '진행중', amount: '620,000원' },
  { id: 'work-2', title: '창호 수리', region: '경기도 김포시', date: '2026.06.28', time: '11:00', status: '완료', amount: '180,000원' },
]

export const contractorChats = [
  { id: 'chat-1', name: '김고객님', preview: '내일 오후 3시에 방문 가능하실까요?', time: '오후 3:30', unread: 1 },
  { id: 'chat-2', name: '박고객님', preview: '견적 확인했습니다.', time: '어제', unread: 0 },
]

export const contractorReviews = [
  {
    id: 'review-1',
    customer: '김고객',
    serviceName: '도어락 수리',
    rating: 5,
    amount: '100,000원',
    body: '시간 맞춰 오시고 고장 원인도 쉽게 설명해주셨어요. 마감도 깔끔해서 만족합니다.',
    date: '2026.07.01',
  },
  {
    id: 'review-2',
    customer: '박고객',
    serviceName: '창호 수리',
    rating: 4,
    amount: '180,000원',
    body: '설명이 친절했고 마감도 좋았습니다. 다음에도 요청하고 싶어요.',
    date: '2026.06.28',
  },
]

export const contractorServiceTree = [
  { category: '가전', options: ['에어컨 수리', '세탁기 설치', '냉장고 수리'] },
  { category: '인테리어', options: ['도배', '장판', '타일', '페인트'] },
  { category: '설비', options: ['배관 수리', '누수 탐지', '보일러 점검'] },
  { category: '문 / 창호', options: ['문 수리', '창호 수리', '도어락 수리'] },
]

export const contractorRegionTree = [
  { category: '서울특별시', options: ['강남구', '마포구', '송파구', '영등포구'] },
  { category: '경기도', options: ['김포시', '고양시', '부천시', '수원시'] },
  { category: '인천광역시', options: ['서구', '남동구', '연수구', '부평구'] },
]

export const chatThreads = [
  { id: 'hong', name: '홍길동 파트너님', preview: '내일 그럼 오후 4시에 방문하도록 하 ...', time: '오후 3:30', unread: 1 },
  { id: 'kim', name: '김도배 파트너님', preview: '시공 감사합니다 ~', time: '2개월 전', unread: 0 },
]

export const initialMessages = {
  hong: [
    { from: 'me', text: '안녕하세요. 도어락 수리 견적서 넣은 홍길동입니다. 매칭 잡아주셔서 채팅 드립니다.' },
    { from: 'partner', text: '아 네! 안녕하세요 ㅎㅎ 잘부탁드립니다!' },
    { from: 'me', text: '거두절미하고 말씀드리겠습니다. 내일 오후 3시부터 7시까지 가능하다고 하셨는데, 4시 가능하신지요.' },
    { from: 'partner', text: '아 네 그때 가능합니다!' },
    { from: 'me', text: '내일 그럼 오후 4시에 방문하도록 하겠습니다.' },
    { from: 'partner', text: '네 그때 뵙겠습니다 ~' },
  ],
  kim: [{ from: 'partner', text: '시공 감사합니다 ~' }],
}

export const screens = {
  login: 'login',
  signup: 'signup',
  userType: 'userType',
  terms: 'terms',
  phone: 'phone',
  address: 'address',
  welcome: 'welcome',
  home: 'home',
  estimateHome: 'estimateHome',
  estimateStart: 'estimateStart',
  estimateLoading: 'estimateLoading',
  estimateDone: 'estimateDone',
  estimateOutput: 'estimateOutput',
  myEstimateList: 'myEstimateList',
  matchingHome: 'matchingHome',
  matchingEstimateSelect: 'matchingEstimateSelect',
  matchingAddressList: 'matchingAddressList',
  matchingAddressSelect: 'matchingAddressSelect',
  matchingSchedule: 'matchingSchedule',
  matchingProgress: 'matchingProgress',
  matchingAuction: 'matchingAuction',
  matchingPartner: 'matchingPartner',
  matchingPartnerInfo: 'matchingPartnerInfo',
  matchingDone: 'matchingDone',
  riskHome: 'riskHome',
  riskSelect: 'riskSelect',
  riskLoading: 'riskLoading',
  riskDone: 'riskDone',
  riskOutput: 'riskOutput',
  myRiskList: 'myRiskList',
  chatList: 'chatList',
  chatRoom: 'chatRoom',
  mypage: 'mypage',
  myReviews: 'myReviews',
  profile: 'profile',
  matchHistory: 'matchHistory',
  reviewWrite: 'reviewWrite',
}

export const publicScreens = [
  screens.login,
  screens.signup,
  screens.userType,
  screens.terms,
  screens.phone,
  screens.address,
  screens.welcome,
]

export const navRoots = {
  ai: [screens.estimateHome, screens.estimateStart, screens.estimateLoading, screens.estimateDone, screens.estimateOutput, screens.myEstimateList],
  match: [
    screens.matchingHome,
    screens.matchingEstimateSelect,
    screens.matchingAddressList,
    screens.matchingAddressSelect,
    screens.matchingSchedule,
    screens.matchingProgress,
    screens.matchingAuction,
    screens.matchingPartner,
    screens.matchingPartnerInfo,
    screens.matchingDone,
    screens.matchHistory,
    screens.reviewWrite,
  ],
  home: [screens.home, screens.mypage, screens.profile, screens.myReviews, screens.myRiskList],
  risk: [screens.riskHome, screens.riskSelect, screens.riskLoading, screens.riskDone, screens.riskOutput],
  chat: [screens.chatList, screens.chatRoom],
}

export const signupTerms = [
  '(필수) 서비스 이용 약관 동의',
  '(필수) 개인정보 수집 및 이용 동의',
  '(필수) AI 품질 검사를 위한 이미지 데이터 처리 동의',
  '(필수) 시공 매칭을 위한 제3자(시공자) 정보 제공 동의',
  '(선택) 할인 혜택 및 마케팅 정보 수신 동의',
]

export const homeReviews = [
  {
    category: '도어락',
    time: '3분 전',
    rating: 5,
    partner: '홍길동 파트너',
    title: '도어락 수리',
    body: '도어락이 갑자기 고장나서 당황스러웠는데, 정말 빠르게 와주셔서 해결해주셨습니다. 고치기도 빠르게 고쳐주시고 정말 친절하게 해주셔서 마음 편하게 시공 받았습니다.',
  },
  {
    category: '도어락',
    time: '5분 전',
    rating: 5,
    partner: '김어락 파트너',
    title: '도어락 수리',
    body: '빠른 시공 좋았어요. 다음에 또 고장나면 이분한테 고쳐달라고 할 것 같아요. 어플 덕분에 이렇게 좋은 분도 알아가고 참 좋습니다.',
  },
]

export const estimateCards = [
  { id: 'molding', date: '2026-06-16', status: '방금', title: '몰딩 시공 견적서', subtitle: '예상 비용 : 670,000' },
  { id: 'wallpaper', date: '2026-02-16', status: '20:21', title: '벽지 도배시공 견적서', subtitle: '예상 비용 : 260,000' },
]

export const reviewCards = [
  {
    id: 'review-1',
    partner: '홍길동 파트너',
    specialty: '목공 전문/경력 13년',
    rating: 5,
    title: '거실 몰딩 시공',
    price: '진행된 시공 비용 : 620,000',
    body: 'ai로 진행한 견적보다 저렴하게 진행해주셨습니다! 시공하시면서 몰딩 안쪽이 들떠서 발생한 추가 비용도 할인해주셨습니다.',
    date: '2026-06-24 작성됨',
  },
  {
    id: 'review-2',
    partner: '김도배 파트너',
    specialty: '도배장판 전문/경력 6년',
    rating: 1,
    title: '거실 도배 시공',
    price: '진행된 시공 비용 : 240,000',
    body: '진짜 개별로였어요. 시공 시간은 예상보다 길고 벽지가 잔뜩 울었는데 괜찮다고만 하시고...',
    date: '2026-02-17 작성됨',
  },
]

export const riskCards = [
  { id: 'risk-1', date: '2026-06-16', expire: '30일 뒤 만료', title: '거실 몰딩 시공', action: '리스크 리포트 확인하기', disabled: false },
  { id: 'risk-2', date: '2026-02-14', expire: '', title: '거실 도배 시공', action: '만료됨', disabled: true },
]

export const historyCards = [
  {
    id: 'history-1',
    date: '2026-06-16',
    status: '진행중',
    title: '거실 몰딩 시공',
    cost: '확정 시공 비용 : 620,000',
    partner: '담당 파트너 : 홍길동',
    schedule: '시공 예정일 : 2026-06-23',
    reviewable: false,
  },
  {
    id: 'history-2',
    date: '2026-06-16',
    status: '완료됨',
    title: '거실 도배 시공',
    cost: '확정 시공 비용 : 240,000',
    partner: '담당 파트너 : 김도배',
    schedule: '시공 예정일 : 2026-02-13',
    reviewable: true,
  },
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

export const addressRows = [
  { icon: 'house', text: '서울시 종로구 인사동길 ....', selected: true },
  { icon: 'house', text: '경기도 수원시 권선구 ....', selected: false },
  { icon: 'building', text: '인천광역시 ....', selected: false },
]

export const partnerBids = [
  { id: 'p1', name: '홍길동 파트너', price: '620,000원', rating: 4.5, avatar: 'light', highlight: '' },
  { id: 'p2', name: '김철수 파트너', price: '720,000원', rating: 4, avatar: 'blue', highlight: '' },
  { id: 'p3', name: '김영희 파트너', price: '600,000원', rating: 4, avatar: 'plain', highlight: '가장 저렴!' },
]

export const profileRows = [
  ['닉네임', '강대근'],
  ['이름', '강대근'],
  ['이메일', 'abcd123@gmail.com'],
  ['휴대폰 번호 변경', ''],
  ['연동된 소셜 계정', ''],
  ['주소 관리', ''],
  ['결제 수단 관리', ''],
]

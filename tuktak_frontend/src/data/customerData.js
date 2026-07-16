export const screens = {
  login: 'login',
  signup: 'signup',
  userType: 'userType',
  terms: 'terms',
  category: 'category',       // 추가: 파트너 전문 분야 선택
  bizReg: 'bizReg',           // 추가: 파트너 사업자등록증 업로드
  companyInfo: 'companyInfo', // 추가: 파트너 업체 정보 입력
  phone: 'phone',
  address: 'address',
  region: 'region',           // 추가: 파트너 작업 지역 선택
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

// 로그인 없이 접근 가능한 화면 목록 (기존 partnerSignup 대신 파트너 가입 세부 화면들을 등록)
export const publicScreens = [
  screens.login,
  screens.signup,
  screens.userType,
  screens.terms,
  screens.category,
  screens.bizReg,
  screens.companyInfo,
  screens.phone,
  screens.address,
  screens.region,
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

// 고객 회원가입 약관 (고객 데이터이므로 customerData.js 에 유지)
export const signupTerms = [
  '(필수) 서비스 이용 약관 동의',
  '(필수) 개인정보 수집 및 이용 동의',
  '(필수) AI 품질 검사를 위한 이미지 데이터 처리 동의',
  '(필수) 시공 매칭을 위한 제3자(시공자) 정보 제공 동의',
  '(선택) 할인 혜택 및 마케팅 정보 수신 동의',
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
    createdAt: '2026-06-24',
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
    createdAt: '2026-02-17',
    date: '2026-02-17 작성됨',
  },
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
    details: {
      request: [
        ['요청 위치', '거실'],
        ['요청 내용', '몰딩 들뜸 및 일부 파손 보수'],
        ['기준 견적서', '몰딩 시공 견적서'],
      ],
      work: [
        ['매칭 상태', '진행중'],
        ['결제 상태', '예약금 결제 완료'],
        ['방문 예정', '2026-06-23 14:00'],
      ],
      partnerInfo: [
        ['전문 분야', '목공/몰딩'],
        ['파트너 평점', '4.5/5'],
        ['리뷰 상태', '시공 완료 후 작성 가능'],
      ],
    },
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
    details: {
      request: [
        ['요청 위치', '거실'],
        ['요청 내용', '도배지 들뜸 및 오염 구간 재시공'],
        ['기준 견적서', '벽지 도배시공 견적서'],
      ],
      work: [
        ['매칭 상태', '완료됨'],
        ['결제 상태', '최종 결제 완료'],
        ['시공 완료', '2026-02-13 16:30'],
      ],
      partnerInfo: [
        ['전문 분야', '도배/장판'],
        ['파트너 평점', '4.5/5'],
        ['리뷰 상태', '리뷰 작성 가능'],
      ],
    },
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

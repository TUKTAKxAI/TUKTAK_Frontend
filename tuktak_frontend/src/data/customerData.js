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
  {
    id: 'molding',
    date: '2026-06-16',
    status: '방금',
    title: '몰딩 시공 견적서',
    subtitle: '예상 비용 : 670,000',
    price: 670000,
    details: {
      location: '거실',
      request: '몰딩 들뜸 및 일부 파손 보수',
      estimatedTime: '약 3시간',
      summary: '거실 몰딩의 들뜬 구간을 점검하고 손상된 부자재를 교체한 뒤 재고정하는 견적입니다.',
    },
  },
  {
    id: 'wallpaper',
    date: '2026-02-16',
    status: '20:21',
    title: '벽지 도배시공 견적서',
    subtitle: '예상 비용 : 260,000',
    price: 260000,
    details: {
      location: '거실',
      request: '벽지 들뜸 및 오염 구간 재시공',
      estimatedTime: '약 4시간',
      summary: '기존 벽지 상태를 확인한 뒤 들뜬 면을 정리하고 부분 도배를 진행하는 견적입니다.',
    },
  },
  {
    id: 'sink',
    date: '2026-01-28',
    status: '18:04',
    title: '싱크대 배수 수리 견적서',
    subtitle: '예상 비용 : 180,000',
    price: 180000,
    details: {
      location: '주방',
      request: '싱크대 하부 배수관 누수 점검',
      estimatedTime: '약 2시간',
      summary: '배수관 연결부 누수 여부를 확인하고 필요한 경우 패킹 또는 배수관을 교체하는 견적입니다.',
    },
  },
  {
    id: 'light',
    date: '2025-12-20',
    status: '11:32',
    title: '조명 교체 견적서',
    subtitle: '예상 비용 : 95,000',
    price: 95000,
    details: {
      location: '방',
      request: '천장 조명 깜빡임 및 교체',
      estimatedTime: '약 1시간',
      summary: '기존 조명 상태와 배선을 확인한 뒤 안전하게 조명 기구를 교체하는 견적입니다.',
    },
  },
  {
    id: 'door',
    date: '2025-11-08',
    status: '09:15',
    title: '방문 수리 견적서',
    subtitle: '예상 비용 : 140,000',
    price: 140000,
    details: {
      location: '방',
      request: '방문 경첩 처짐 및 닫힘 불량',
      estimatedTime: '약 2시간',
      summary: '문 처짐 원인을 확인하고 경첩 조정 또는 부품 교체를 통해 닫힘 불량을 개선하는 견적입니다.',
    },
  },
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

export const riskCards = [
  {
    id: 'risk-1',
    date: '2026-06-16',
    title: '거실 몰딩 시공',
    estimatePrice: '예상 비용 : 670,000',
    riskScore: 72,
    riskLevel: '주의',
    summary: '몰딩 내부 들뜸과 추가 손상 범위에 따라 시공 비용이 변동될 수 있습니다.',
    items: ['몰딩 안쪽 부자재 손상 가능성', '기존 벽면 상태에 따른 추가 보수 가능성', '자재 색상 차이 발생 가능성'],
    checklist: ['현장 방문 전 손상 구간 사진 추가 확인', '추가 비용 발생 기준 사전 합의', '동일 색상 자재 재고 확인'],
  },
  {
    id: 'risk-2',
    date: '2026-02-14',
    title: '거실 도배 시공',
    estimatePrice: '예상 비용 : 260,000',
    riskScore: 84,
    riskLevel: '높음',
    summary: '벽지 들뜸 원인이 습기일 경우 단순 도배 외 추가 보수가 필요할 수 있습니다.',
    items: ['곰팡이 또는 습기 재발 가능성', '기존 벽지 제거 후 벽면 보수 가능성', '작업 시간이 길어질 가능성'],
    checklist: ['습기 원인 확인', '벽면 보수 포함 여부 확인', '시공 후 하자 보증 기간 확인'],
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

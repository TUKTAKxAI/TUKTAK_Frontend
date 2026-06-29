export const screens = {
  login: 'login',
  signup: 'signup',
  userType: 'userType',
  terms: 'terms',
  phone: 'phone',
  address: 'address',
  welcome: 'welcome',
  home: 'home',
  estimate: 'estimate',
  estimateForm: 'estimateForm',
  estimateList: 'estimateList',
  matching: 'matching',
  partner: 'partner',
  matchHistory: 'matchHistory',
  reviewWrite: 'reviewWrite',
  risk: 'risk',
  riskDetail: 'riskDetail',
  chatList: 'chatList',
  chatRoom: 'chatRoom',
  mypage: 'mypage',
  myReviews: 'myReviews',
  profile: 'profile',
}

export const screenTitles = {
  [screens.home]: '홈',
  [screens.estimate]: 'AI 견적',
  [screens.estimateForm]: 'AI 견적',
  [screens.estimateList]: 'AI 견적서 목록',
  [screens.matching]: '매칭',
  [screens.partner]: '파트너 정보',
  [screens.matchHistory]: '매칭 히스토리',
  [screens.reviewWrite]: '리뷰 작성',
  [screens.risk]: '내 리스크리포트',
  [screens.riskDetail]: '리스크 리포트',
  [screens.chatList]: '채팅',
  [screens.chatRoom]: '채팅',
  [screens.mypage]: '마이페이지',
  [screens.myReviews]: '내가 쓴 리뷰',
  [screens.profile]: '내 정보',
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

export const terms = [
  '서비스 이용 약관 동의',
  '개인정보 수집 및 이용 동의',
  'AI 품질 검사를 위한 이미지 데이터 처리 동의',
  '시공 매칭을 위한 제3자 정보 제공 동의',
  '할인 혜택 및 마케팅 정보 수신 동의',
]

export const estimates = [
  { title: '거실 몰딩 시공', date: '2026-06-16', price: '620,000원', status: '매칭 가능' },
  { title: '주방 타일 보수', date: '2026-06-10', price: '180,000원', status: '견적 완료' },
  { title: '방충망 교체 수리', date: '2026-05-28', price: '90,000원', status: '리포트 생성' },
]

export const partners = [
  {
    name: '홍길동 파트너',
    specialty: '목공 전문 / 경력 13년',
    rating: '5.0',
    price: '620,000원',
    note: 'AI 견적보다 저렴하게 진행 가능',
  },
  {
    name: '김도배 파트너',
    specialty: '도배·장판 전문 / 경력 6년',
    rating: '4.3',
    price: '240,000원',
    note: '내일 오후 방문 가능',
  },
]

export const risks = [
  { title: '거실 몰딩 시공', date: '2026-06-16', expire: '30일 뒤 만료', level: '주의' },
  { title: '거실 도배 시공', date: '2026-05-28', expire: '12일 뒤 만료', level: '안전' },
]

export const reviews = [
  {
    partner: '홍길동 파트너',
    title: '거실 몰딩 시공',
    rating: 5,
    date: '2026-06-24 작성됨',
    body: 'AI로 진행한 견적보다 저렴하게 진행해주셨습니다. 시공 중 발생한 추가 비용도 잘 설명해 주셔서 만족했습니다.',
  },
  {
    partner: '김도배 파트너',
    title: '거실 도배 시공',
    rating: 1,
    date: '2026-02-17 작성됨',
    body: '시공 시간이 예상보다 길었고 마감이 아쉬웠습니다. 다음에는 사전 설명이 더 자세했으면 좋겠습니다.',
  },
]

export const profileRows = [
  ['닉네임', '강대근'],
  ['이름', '강대근'],
  ['이메일', 'abc123@gmail.com'],
  ['휴대폰 번호 변경', '010-1234-5678'],
  ['연동된 소셜 계정', '카카오'],
  ['주소 관리', '서울 강남구'],
  ['결제 수단 관리', '등록 전'],
]

export const chatThreads = [
  {
    id: 'hong',
    name: '홍길동 파트너',
    specialty: '목공 전문 / 경력 13년',
    preview: '몰딩 시공 문의 확인했습니다.',
    time: '오후 2:10',
    unread: 2,
  },
  {
    id: 'kim',
    name: '김도배 파트너',
    specialty: '도배·장판 전문 / 경력 6년',
    preview: '내일 방문 일정 가능합니다.',
    time: '어제',
    unread: 0,
  },
]

export const initialMessages = {
  hong: [
    { from: 'partner', text: '안녕하세요. 몰딩 시공 문의 확인했습니다.' },
    { from: 'me', text: '오늘 방문 견적 가능할까요?' },
  ],
  kim: [
    { from: 'partner', text: '사진 확인했습니다. 내일 오후 방문 가능합니다.' },
    { from: 'me', text: '2시 이후로 부탁드려요.' },
  ],
}

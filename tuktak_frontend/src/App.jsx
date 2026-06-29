import { useMemo, useState } from 'react'
import './App.css'

const screens = {
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
  chat: 'chat',
  mypage: 'mypage',
  myReviews: 'myReviews',
  profile: 'profile',
}

const estimates = [
  { title: '거실 몰딩 시공', date: '2026-06-16', price: '620,000원', status: '매칭 가능' },
  { title: '주방 타일 보수', date: '2026-06-10', price: '180,000원', status: '견적 완료' },
]

const partners = [
  {
    name: '홍길동 파트너',
    specialty: '목공 전문 / 경력 13년',
    rating: '5.0',
    price: '620,000원',
    note: 'AI 견적보다 저렴하게 진행 가능',
  },
  {
    name: '김도배 파트너',
    specialty: '도배장판 전문 / 경력 6년',
    rating: '4.3',
    price: '240,000원',
    note: '내일 오후 방문 가능',
  },
]

const risks = [
  { title: '거실 몰딩 시공', date: '2026-06-16', expire: '30일 뒤 만료', level: '주의' },
  { title: '욕실 누수 점검', date: '2026-05-28', expire: '12일 뒤 만료', level: '안전' },
]

const reviews = [
  {
    partner: '홍길동 파트너',
    title: '거실 몰딩 시공',
    rating: 5,
    date: '2026-06-24 작성됨',
    body: 'AI로 진행한 견적보다 저렴하게 진행해주셨습니다. 깔끔한 시공 감사합니다.',
  },
  {
    partner: '김도배 파트너',
    title: '거실 도배 시공',
    rating: 1,
    date: '2026-02-17 작성됨',
    body: '시공 시간이 예상보다 길고 마감이 아쉬웠습니다. 다시 확인이 필요합니다.',
  },
]

function App() {
  const [screen, setScreen] = useState(screens.login)
  const [history, setHistory] = useState([])
  const [userType, setUserType] = useState('customer')
  const [terms, setTerms] = useState([true, true, true, true, false])
  const [messages, setMessages] = useState([
    { from: 'partner', text: '안녕하세요. 몰딩 시공 문의 확인했습니다.' },
    { from: 'me', text: '오늘 방문 견적 가능하실까요?' },
  ])
  const [chatText, setChatText] = useState('')

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

  const sendMessage = () => {
    const trimmed = chatText.trim()
    if (!trimmed) return
    setMessages((items) => [...items, { from: 'me', text: trimmed }])
    setChatText('')
  }

  const title = useMemo(() => {
    const titles = {
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
      [screens.chat]: '채팅',
      [screens.mypage]: '마이페이지',
      [screens.myReviews]: '내가 쓴 리뷰',
      [screens.profile]: '내 정보',
    }
    return titles[screen]
  }, [screen])

  const publicScreen = [
    screens.login,
    screens.signup,
    screens.userType,
    screens.terms,
    screens.phone,
    screens.address,
    screens.welcome,
  ].includes(screen)

  return (
    <div className="app-shell">
      <main className="phone" data-screen={screen}>
        {publicScreen ? (
          <AuthFlow
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
              {screen === screens.home && <Home go={go} />}
              {screen === screens.estimate && <EstimateHome go={go} />}
              {screen === screens.estimateForm && <EstimateForm go={go} />}
              {screen === screens.estimateList && <EstimateList go={go} />}
              {screen === screens.matching && <Matching go={go} />}
              {screen === screens.partner && <PartnerDetail go={go} />}
              {screen === screens.matchHistory && <MatchHistory go={go} />}
              {screen === screens.reviewWrite && <ReviewWrite go={go} />}
              {screen === screens.risk && <RiskList go={go} />}
              {screen === screens.riskDetail && <RiskDetail go={go} />}
              {screen === screens.chat && (
                <Chat messages={messages} chatText={chatText} setChatText={setChatText} sendMessage={sendMessage} />
              )}
              {screen === screens.mypage && <MyPage go={go} />}
              {screen === screens.myReviews && <MyReviews />}
              {screen === screens.profile && <Profile />}
            </div>
            <BottomNav current={screen} go={go} />
          </>
        )}
      </main>
    </div>
  )
}

function AuthFlow({ screen, setScreen, go, back, userType, setUserType, terms, setTerms }) {
  if (screen === screens.login) {
    return (
      <section className="auth-screen login-screen">
        <Logo size="large" />
        <div className="login-row">
          <h1>로그인</h1>
          <div className="role-toggle" aria-label="사용자 유형">
            <button className="active">고객</button>
            <button onClick={() => setUserType('partner')}>파트너</button>
          </div>
        </div>
        <Field placeholder="아이디" />
        <Field placeholder="비밀번호" type="password" action="보기" />
        <PrimaryButton onClick={() => setScreen(screens.home)}>로그인</PrimaryButton>
        <div className="divider">- 혹은 -</div>
        <p className="muted center">SNS로 로그인</p>
        <div className="sns-row">
          <button>카</button>
          <span />
          <button>G</button>
          <span />
          <button>N</button>
        </div>
        <button className="link-row" onClick={() => go(screens.signup)}>
          회원가입&nbsp;&nbsp; | &nbsp;&nbsp;아이디 찾기&nbsp;&nbsp; | &nbsp;&nbsp;비밀번호 찾기
        </button>
      </section>
    )
  }

  if (screen === screens.signup) {
    return (
      <section className="auth-screen">
        <Logo />
        <h2 className="hero-copy">회원가입을 통해 수리 관련 서비스를 경험하세요</h2>
        <Field placeholder="이름" />
        <Field placeholder="아이디" action="중복확인" />
        <Field placeholder="이메일" action="중복확인" />
        <Field placeholder="비밀번호" type="password" action="보기" />
        <Field placeholder="비밀번호 확인" type="password" action="보기" />
        <PrimaryButton onClick={() => go(screens.userType)}>회원가입 하기</PrimaryButton>
        <button className="link-row" onClick={() => setScreen(screens.login)}>이미 아이디가 있어요</button>
      </section>
    )
  }

  if (screen === screens.userType) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">어떤 사용자신가요?</h2>
        <ChoiceCard active={userType === 'customer'} onClick={() => setUserType('customer')} title="고객" text="파트너에게 수리를 맡겨보세요" />
        <ChoiceCard active={userType === 'partner'} onClick={() => setUserType('partner')} title="파트너" text="시공이 필요한 고객을 만나보세요" />
        <PrimaryButton onClick={() => go(screens.terms)}>다음</PrimaryButton>
      </section>
    )
  }

  if (screen === screens.terms) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">고객님의 가입을 위해 약관에 동의해주세요</h2>
        <div className="terms-panel">
          {['서비스 이용 약관 동의', '개인정보 수집 및 이용 동의', 'AI 품질 검사를 위한 이미지 데이터 처리 동의', '시공 매칭을 위한 제 3자 정보 제공 동의', '할인 혜택 및 마케팅 정보 수신 동의'].map((item, index) => (
            <label className="check-line" key={item}>
              <input
                type="checkbox"
                checked={terms[index]}
                onChange={() => setTerms((values) => values.map((value, valueIndex) => valueIndex === index ? !value : value))}
              />
              <span>{index < 4 ? '(필수)' : '(선택)'} {item}</span>
            </label>
          ))}
          <button className="small-outline">약관 자세히보기</button>
        </div>
        <div className="button-row">
          <SecondaryButton onClick={back}>취소</SecondaryButton>
          <PrimaryButton onClick={() => go(screens.phone)}>동의 및 진행</PrimaryButton>
        </div>
      </section>
    )
  }

  if (screen === screens.phone) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">고객님의 전화번호를 알려주세요</h2>
        <div className="phone-row">
          <select defaultValue="KT"><option>KT</option><option>SKT</option><option>LG U+</option></select>
          <Field placeholder="XXX - XXXX - XXXX" />
        </div>
        <PrimaryButton narrow onClick={() => go(screens.address)}>다음</PrimaryButton>
        <button className="link-row" onClick={() => go(screens.address)}>건너뛰기</button>
      </section>
    )
  }

  if (screen === screens.address) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">고객님의 주소를 알려주세요</h2>
        <button className="input-like">주소 검색</button>
        <Field placeholder="상세 주소 입력 (ex : 202동 301호)" />
        <PrimaryButton narrow onClick={() => go(screens.welcome)}>다음</PrimaryButton>
        <button className="link-row" onClick={() => go(screens.welcome)}>건너뛰기</button>
      </section>
    )
  }

  return (
    <section className="auth-screen">
      <Logo />
      <h2 className="hero-copy compact">고객님, 환영합니다 !</h2>
      <p className="muted wide">TUKTAK에서 빠르게 견적을 받고 믿을 수 있는 파트너를 만나보세요.</p>
      <PrimaryButton narrow onClick={() => setScreen(screens.home)}>완료</PrimaryButton>
    </section>
  )
}

function Home({ go }) {
  return (
    <section className="home-screen">
      <Logo />
      <h2>고객님, 안녕하세요 !</h2>
      <p className="muted">오늘 필요한 수리 서비스를 선택해보세요.</p>
      <div className="quick-grid">
        <QuickAction label="AI 견적" onClick={() => go(screens.estimate)} />
        <QuickAction label="매칭" onClick={() => go(screens.matching)} />
        <QuickAction label="리스크 리포트" onClick={() => go(screens.risk)} />
        <QuickAction label="채팅" onClick={() => go(screens.chat)} />
      </div>
      <section className="white-card">
        <div className="section-head">
          <h3>최근 AI 견적</h3>
          <button onClick={() => go(screens.estimateList)}>전체보기</button>
        </div>
        <EstimateItem item={estimates[0]} onClick={() => go(screens.matching)} />
      </section>
    </section>
  )
}

function EstimateHome({ go }) {
  return (
    <section>
      <HeroBlock title="AI 견적을 시작해보세요" text="사진과 시공 정보를 입력하면 예상 비용과 위험 요소를 확인할 수 있어요." />
      <PrimaryButton onClick={() => go(screens.estimateForm)}>AI 견적 시작하기</PrimaryButton>
      <div className="list-stack">
        {estimates.map((item) => <EstimateItem key={item.title} item={item} onClick={() => go(screens.estimateList)} />)}
      </div>
    </section>
  )
}

function EstimateForm({ go }) {
  return (
    <section>
      <h2 className="page-copy">수리 정보를 알려주세요</h2>
      <Field placeholder="시공 분야 선택" />
      <Field placeholder="예상 위치 입력" />
      <textarea className="textarea" placeholder="문제 상황을 자세히 입력해주세요" />
      <button className="upload-box">사진 추가</button>
      <PrimaryButton onClick={() => go(screens.estimateList)}>견적 생성</PrimaryButton>
    </section>
  )
}

function EstimateList({ go }) {
  return (
    <section className="list-stack">
      {estimates.map((item) => <EstimateItem key={item.title} item={item} onClick={() => go(screens.matching)} />)}
    </section>
  )
}

function Matching({ go }) {
  return (
    <section className="list-stack">
      {partners.map((partner) => (
        <button className="partner-card" key={partner.name} onClick={() => go(screens.partner)}>
          <Avatar />
          <div>
            <h3>{partner.name}</h3>
            <p>{partner.specialty}</p>
            <strong>별점 {partner.rating} / 견적 {partner.price}</strong>
            <span>{partner.note}</span>
          </div>
        </button>
      ))}
      <SecondaryButton onClick={() => go(screens.matchHistory)}>매칭 히스토리</SecondaryButton>
    </section>
  )
}

function PartnerDetail({ go }) {
  return (
    <section>
      <div className="profile-hero">
        <Avatar large />
        <h2>홍길동 파트너</h2>
        <p>목공 전문 / 경력 13년</p>
        <strong>별점 5.0</strong>
      </div>
      <InfoPanel rows={[['진행 가능 비용', '620,000원'], ['가능 일정', '오늘 18:00'], ['전문 지역', '서울 전체']]} />
      <div className="button-row">
        <SecondaryButton onClick={() => go(screens.chat)}>채팅하기</SecondaryButton>
        <PrimaryButton onClick={() => go(screens.reviewWrite)}>선택하기</PrimaryButton>
      </div>
    </section>
  )
}

function MatchHistory({ go }) {
  return (
    <section className="list-stack">
      {partners.map((partner) => (
        <article className="white-card" key={partner.name}>
          <h3>{partner.name}</h3>
          <p>{partner.specialty}</p>
          <p className="muted">거실 몰딩 시공 완료</p>
          <button className="inline-button" onClick={() => go(screens.reviewWrite)}>리뷰 작성</button>
        </article>
      ))}
    </section>
  )
}

function ReviewWrite({ go }) {
  return (
    <section>
      <h2 className="page-copy">시공은 어떠셨나요?</h2>
      <div className="stars">★★★★★</div>
      <textarea className="textarea tall" placeholder="리뷰 내용을 입력해주세요" />
      <PrimaryButton onClick={() => go(screens.myReviews)}>작성 완료</PrimaryButton>
    </section>
  )
}

function RiskList({ go }) {
  return (
    <section>
      <div className="search-box">검색</div>
      <div className="list-stack">
        {risks.map((risk) => (
          <article className="risk-card" key={risk.title}>
            <div>
              <time>{risk.date}</time>
              <p>{risk.expire}</p>
            </div>
            <h3>{risk.title}</h3>
            <span>{risk.level}</span>
            <button onClick={() => go(screens.riskDetail)}>리스크 리포트 확인하기</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function RiskDetail() {
  return (
    <section>
      <HeroBlock title="거실 몰딩 시공 리스크" text="습기와 기존 몰딩 들뜸 가능성이 있어 시공 전 보강 확인이 필요합니다." />
      <InfoPanel rows={[['종합 위험도', '주의'], ['예상 추가 비용', '50,000원'], ['권장 조치', '벽면 상태 사전 점검']]} />
      <article className="white-card">
        <h3>AI 품질 검사</h3>
        <p>사진 기준 몰딩 접착면 일부가 고르지 않아 추가 마감 작업이 필요할 수 있습니다.</p>
      </article>
    </section>
  )
}

function Chat({ messages, chatText, setChatText, sendMessage }) {
  return (
    <section className="chat-screen">
      <div className="chat-partner"><Avatar /> <span>홍길동 파트너</span></div>
      <div className="message-list">
        {messages.map((message, index) => (
          <div className={`message ${message.from === 'me' ? 'mine' : ''}`} key={`${message.text}-${index}`}>{message.text}</div>
        ))}
      </div>
      <div className="chat-input">
        <input value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="메시지 입력" onKeyDown={(event) => event.key === 'Enter' && sendMessage()} />
        <button onClick={sendMessage}>전송</button>
      </div>
    </section>
  )
}

function MyPage({ go }) {
  return (
    <section>
      <div className="my-hero">
        <Avatar large />
        <h2>강대근 님, 안녕하세요 !</h2>
        <p>abc123@gmail.com</p>
      </div>
      <div className="menu-panel">
        <MenuRow label="AI 견적서 목록" onClick={() => go(screens.estimateList)} />
        <MenuRow label="매칭 히스토리" onClick={() => go(screens.matchHistory)} />
        <MenuRow label="리스크 리포트 목록" onClick={() => go(screens.risk)} />
        <MenuRow label="작성한 리뷰" onClick={() => go(screens.myReviews)} />
        <MenuRow label="내 정보 조회 / 수정" onClick={() => go(screens.profile)} />
      </div>
    </section>
  )
}

function MyReviews() {
  return (
    <section>
      <div className="search-box">검색</div>
      <div className="list-stack">
        {reviews.map((review) => <ReviewCard review={review} key={review.title} />)}
      </div>
    </section>
  )
}

function Profile() {
  return (
    <section>
      <div className="profile-hero">
        <Avatar large />
        <h2>강대근 님</h2>
      </div>
      <InfoPanel rows={[['닉네임', '강대근'], ['이름', '강대근'], ['이메일', 'abc123@gmail.com'], ['휴대폰 번호 변경', '010-1234-5678'], ['연동된 소셜 계정', '카카오'], ['주소 관리', '서울 강남구'], ['결제 수단 관리', '등록됨']]} />
      <p className="withdraw">회원탈퇴&nbsp;&nbsp; | &nbsp;&nbsp;로그아웃</p>
    </section>
  )
}

function AppHeader({ title, back, onSearch }) {
  return (
    <header className="app-header">
      <button className="icon-button" onClick={back} aria-label="뒤로가기">‹</button>
      <button className="search-icon" onClick={onSearch} aria-label="검색">⌕</button>
      <h1>{title}</h1>
    </header>
  )
}

function BottomNav({ current, go }) {
  const items = [
    ['AI 견적', screens.estimate, 'AI'],
    ['매칭', screens.matching, 'M'],
    ['홈', screens.home, 'H'],
    ['리스크', screens.risk, 'R'],
    ['채팅', screens.chat, 'C'],
  ]
  return (
    <nav className="bottom-nav">
      {items.map(([label, target, icon]) => (
        <button className={current === target ? 'active' : ''} key={target} onClick={() => go(target)} aria-label={label}>
          <span>{icon}</span>
        </button>
      ))}
    </nav>
  )
}

function Field({ placeholder, action, type = 'text' }) {
  return (
    <label className="field">
      <input type={type} placeholder={placeholder} />
      {action && <button type="button">{action}</button>}
    </label>
  )
}

function PrimaryButton({ children, onClick, narrow }) {
  return <button className={`primary-button ${narrow ? 'narrow' : ''}`} onClick={onClick}>{children}</button>
}

function SecondaryButton({ children, onClick }) {
  return <button className="secondary-button" onClick={onClick}>{children}</button>
}

function BackButton({ onClick }) {
  return <button className="floating-back" onClick={onClick} aria-label="뒤로가기">‹</button>
}

function Logo({ size }) {
  return <div className={`logo-mark ${size === 'large' ? 'large' : ''}`}>TUKTAK</div>
}

function ChoiceCard({ title, text, active, onClick }) {
  return (
    <button className={`choice-card ${active ? 'active' : ''}`} onClick={onClick}>
      <span>{active ? '✓' : ''}</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </button>
  )
}

function QuickAction({ label, onClick }) {
  return <button className="quick-action" onClick={onClick}>{label}</button>
}

function EstimateItem({ item, onClick }) {
  return (
    <button className="estimate-item" onClick={onClick}>
      <div>
        <h3>{item.title}</h3>
        <p>{item.date}</p>
      </div>
      <div>
        <strong>{item.price}</strong>
        <span>{item.status}</span>
      </div>
    </button>
  )
}

function HeroBlock({ title, text }) {
  return (
    <article className="hero-block">
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  )
}

function Avatar({ large }) {
  return <div className={`avatar ${large ? 'large' : ''}`} />
}

function InfoPanel({ rows }) {
  return (
    <div className="info-panel">
      {rows.map(([label, value]) => (
        <div className="info-row" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <i>›</i>
        </div>
      ))}
    </div>
  )
}

function MenuRow({ label, onClick }) {
  return <button className="menu-row" onClick={onClick}>{label}<span>›</span></button>
}

function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div className="review-head">
        <Avatar />
        <div>
          <h3>{review.partner}</h3>
          <p>{review.title}</p>
        </div>
      </div>
      <div className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} <span>{review.rating}/5</span></div>
      <p>{review.body}</p>
      <time>{review.date}</time>
      <button>삭제</button>
    </article>
  )
}

export default App

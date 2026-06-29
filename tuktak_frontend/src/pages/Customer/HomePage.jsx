import { EstimateItem } from '../../components/customer/Cards'
import { Logo } from '../../components/customer/FormControls'
import { estimates, screens } from '../../data/customerData'

function QuickAction({ label, onClick }) {
  return (
    <button className="quick-action" onClick={onClick}>
      {label}
    </button>
  )
}

export function HomePage({ go }) {
  return (
    <section className="home-screen">
      <Logo />
      <h2>고객님 안녕하세요!</h2>
      <p className="muted">오늘 필요한 수리 서비스를 선택해보세요.</p>
      <div className="quick-grid">
        <QuickAction label="AI 견적" onClick={() => go(screens.estimate)} />
        <QuickAction label="매칭" onClick={() => go(screens.matching)} />
        <QuickAction label="리스크 리포트" onClick={() => go(screens.risk)} />
        <QuickAction label="채팅" onClick={() => go(screens.chatList)} />
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

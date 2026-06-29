import { RiskCard } from '../../components/customer/Cards'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { Logo, PrimaryButton } from '../../components/customer/FormControls'
import { riskCards, screens } from '../../data/customerData'

export function RiskHomePage({ go }) {
  return (
    <section className="service-hero">
      <CustomerTopBar go={go} />
      <h1>AI 리스크 리포트 서비스</h1>
      <h2>AI로 발생할 리스크를 미리 확인해 보세요</h2>
      <p>매칭이 시작되면 견적서에 기반하여 리스크를 계산해 리포트를 작성해드립니다.</p>
      <div className="service-shot-row">
        <div className="phone-shot first risk" />
        <div className="phone-shot second risk" />
        <div className="phone-shot fourth risk" />
      </div>
      <div className="dot-row"><span className="active dim" /><span /><span /><span className="active dim" /></div>
      <PrimaryButton narrow onClick={() => go(screens.riskSelect)}>리스크 리포트 받기</PrimaryButton>
    </section>
  )
}

export function RiskSelectPage({ go }) {
  return (
    <section className="selection-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.riskHome)}>‹</button>
      <h1>AI 리스크 리포트</h1>
      <h2>AI 견적서를 선택해주세요</h2>
      <article className="record-card estimate-card large">
        <div className="record-side">
          <span>2026-06-16</span>
          <small>방금</small>
        </div>
        <div className="record-main">
          <h3>거실 몰딩 시공</h3>
          <p>담당 시공자 : 김철수</p>
          <p>확정 시공 비용 : 600,000</p>
          <button className="wide-action" onClick={() => go(screens.riskLoading)}>리스크 리포트 요청하기</button>
        </div>
      </article>
    </section>
  )
}

export function RiskLoadingPage({ go }) {
  return (
    <section className="status-screen">
      <Logo />
      <h2>리스크 리포트 생성중 입니다 ...</h2>
      <div className="status-ring loading" />
      <PrimaryButton narrow orange onClick={() => go(screens.riskSelect)}>취소</PrimaryButton>
    </section>
  )
}

export function RiskDonePage({ go }) {
  return (
    <section className="status-screen">
      <Logo />
      <h2>리스크 리포트가 생성되었습니다 !</h2>
      <div className="status-ring success">✓</div>
      <PrimaryButton narrow onClick={() => go(screens.riskOutput)}>확인하기</PrimaryButton>
    </section>
  )
}

export function RiskOutputPage({ go }) {
  return (
    <section className="document-screen">
      <article className="document-card">
        <div className="document-head">
          <div>
            <span>2026-06-16</span>
            <small>방금</small>
          </div>
          <div className="align-right">
            <h2>몰딩 시공 리스크 리포트</h2>
            <p>예상 비용 : 670,000</p>
          </div>
          <div className="pdf-icon">PDF</div>
        </div>
        <div className="document-body">
          <h3>리스크 리포트 내용..</h3>
          <div className="document-art risk" />
        </div>
      </article>
      <PrimaryButton narrow onClick={() => go(screens.riskHome)}>확인</PrimaryButton>
    </section>
  )
}

export function MyRiskListPage({ go }) {
  return (
    <section className="subpage-screen">
      <div className="subpage-title-row">
        <button className="inline-back-arrow" onClick={() => go(screens.mypage)}>‹</button>
        <h1>내 리스크리포트</h1>
      </div>
      <div className="search-shell">
        <div className="search-lens" />
        <span>검색</span>
        <i>›</i>
      </div>
      <div className="list-stack">
        {riskCards.map((item) => (
          <RiskCard key={item.id} item={item} onClick={() => go(screens.riskOutput)} />
        ))}
      </div>
    </section>
  )
}

import { HeroBlock, InfoPanel } from '../../components/customer/Cards'
import { risks, screens } from '../../data/customerData'

export function RiskListPage({ go }) {
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

export function RiskDetailPage() {
  return (
    <section>
      <HeroBlock
        title="거실 몰딩 시공 리스크"
        text="들뜸과 기존 몰딩 손상 가능성이 있어 시공 전 보강 상태 확인이 필요합니다."
      />
      <InfoPanel
        rows={[
          ['종합 위험도', '주의'],
          ['예상 추가 비용', '50,000원'],
          ['권장 조치', '벽면 상태 사전 점검'],
        ]}
      />
      <article className="white-card spaced">
        <h3>AI 점검 결과</h3>
        <p>사진 기준 몰딩 마감면이 고르지 않아 추가 마감 작업이 필요할 가능성이 있습니다.</p>
      </article>
    </section>
  )
}

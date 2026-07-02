import { FaChevronRight } from 'react-icons/fa'
import { ContractorTopBar } from '../../components/contractor/ContractorTopBar'

export function StatusBadge({ children, tone = 'blue' }) {
  return <span className={`contractor-status ${tone}`}>{children}</span>
}

export function ContractorPage({ title, children, back, action }) {
  return (
    <section className="contractor-screen">
      <ContractorTopBar title={title} back={back} action={action} />
      <div className="contractor-content">{children}</div>
    </section>
  )
}

export function MenuTile({ icon, label, onClick }) {
  return (
    <button className="contractor-menu-tile" type="button" onClick={onClick}>
      <span>{icon}</span>
      <strong>{label}</strong>
    </button>
  )
}

export function RequestCard({ item, onDetail, onAiEstimate, onQuote }) {
  return (
    <article className="contractor-request-card">
      <div>
        <strong className="contractor-region">{item.region}</strong>
        <h2>{item.title}</h2>
        <p>{item.budget} · {item.desiredDate}</p>
      </div>
      <div className="contractor-card-side">
        <small>시공일시<br />{item.desiredDate}<br />{item.time}</small>
        <button type="button" onClick={onDetail}>자세히 보기 <FaChevronRight /></button>
      </div>
      <div className="contractor-card-actions">
        <button type="button" onClick={onAiEstimate}>AI 견적서</button>
        <button type="button" onClick={onQuote}>견적 작성</button>
      </div>
    </article>
  )
}

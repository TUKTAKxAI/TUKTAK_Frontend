import { Avatar } from './FormControls'

export function ChoiceCard({ title, text, active, onClick }) {
  return (
    <button className={`choice-card ${active ? 'active' : ''}`} onClick={onClick}>
      <span>{active ? '✓' : ''}</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </button>
  )
}

export function EstimateItem({ item, onClick }) {
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

export function PartnerCard({ partner, onClick }) {
  return (
    <button className="partner-card" onClick={onClick}>
      <Avatar />
      <div>
        <h3>{partner.name}</h3>
        <p>{partner.specialty}</p>
        <strong>별점 {partner.rating} / 견적 {partner.price}</strong>
        <span>{partner.note}</span>
      </div>
    </button>
  )
}

export function HeroBlock({ title, text }) {
  return (
    <article className="hero-block">
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  )
}

export function InfoPanel({ rows }) {
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

export function MenuRow({ label, onClick }) {
  return (
    <button className="menu-row" onClick={onClick}>
      {label}
      <span>›</span>
    </button>
  )
}

export function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div className="review-head">
        <Avatar />
        <div>
          <h3>{review.partner}</h3>
          <p>{review.title}</p>
        </div>
      </div>
      <div className="review-rating">
        {'★'.repeat(review.rating)}
        {'☆'.repeat(5 - review.rating)}
        <span>{review.rating}/5</span>
      </div>
      <p>{review.body}</p>
      <time>{review.date}</time>
      <button>삭제</button>
    </article>
  )
}

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

export function SearchBar({ placeholder = '검색' }) {
  return (
    <div className="search-shell">
      <div className="search-lens" />
      <span>{placeholder}</span>
      <i>›</i>
    </div>
  )
}

export function EstimateCard({ item, onClick, actionLabel }) {
  return (
    <button className="record-card estimate-card" onClick={onClick}>
      <div className="record-side">
        <span>{item.date}</span>
        <small>{item.status}</small>
      </div>
      <div className="record-main">
        <h3>{item.title}</h3>
        <p>{item.subtitle}</p>
        {actionLabel ? <strong>{actionLabel}</strong> : null}
      </div>
    </button>
  )
}

export function HistoryCard({ item, onClickReview }) {
  return (
    <article className="record-card history-card">
      <div className="record-side">
        <span>{item.date}</span>
        <small>{item.status}</small>
      </div>
      <div className="record-main">
        <h3>{item.title}</h3>
        <p>{item.cost}</p>
        <p>{item.partner}</p>
        <p>{item.schedule}</p>
        <div className="record-footer">
          {item.reviewable ? <button className="mini-primary" onClick={onClickReview}>리뷰 작성</button> : <span />}
          <small>자세히 보기 ˅</small>
        </div>
      </div>
    </article>
  )
}

export function RiskCard({ item, onClick }) {
  return (
    <article className="record-card risk-list-card">
      <div className="record-side">
        <span>{item.date}</span>
        {item.expire ? <small>{item.expire}</small> : null}
      </div>
      <div className="record-main">
        <h3>{item.title}</h3>
        <button className={`wide-action ${item.disabled ? 'disabled' : ''}`} onClick={item.disabled ? undefined : onClick}>
          {item.action}
        </button>
      </div>
    </article>
  )
}

export function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div className="review-top">
        <Avatar tone={review.rating > 1 ? 'light' : 'blue'} />
        <div>
          <h3>{review.partner}</h3>
          <p>{review.specialty}</p>
          <div className="star-line">
            {'★'.repeat(review.rating)}
            {'☆'.repeat(5 - review.rating)}
            <span>{review.rating}/5</span>
          </div>
        </div>
      </div>
      <div className="review-middle">
        <h4>{review.title}</h4>
        <p>{review.price}</p>
      </div>
      <p className="review-body">{review.body}</p>
      <div className="review-bottom">
        <button className="mini-orange">삭제</button>
        <time>{review.date}</time>
      </div>
    </article>
  )
}

export function MenuTile({ icon, label, onClick }) {
  return (
    <button className="menu-tile" onClick={onClick}>
      <div className={`tile-icon ${icon}`} />
      <span>{label}</span>
    </button>
  )
}

export function HeroCard({ title, body, children }) {
  return (
    <section className="hero-card">
      <h2>{title}</h2>
      <p>{body}</p>
      {children}
    </section>
  )
}

export function PartnerBidCard({ partner, onClick }) {
  return (
    <button className="partner-bid-card" onClick={onClick}>
      <Avatar tone={partner.avatar === 'light' ? 'light' : partner.avatar === 'plain' ? 'plain' : 'blue'} />
      <div className="partner-bid-copy">
        <div className="partner-bid-head">
          <strong>{partner.name}</strong>
          <span>{'★'.repeat(Math.round(partner.rating))}{'☆'.repeat(5 - Math.round(partner.rating))} {partner.rating}/5</span>
        </div>
        <p>제안 시공비용 : {partner.price}</p>
        <small>자세한 정보는 클릭해서 보기</small>
      </div>
      {partner.highlight ? <em>{partner.highlight}</em> : null}
    </button>
  )
}

export function InfoRows({ rows }) {
  return (
    <div className="info-panel">
      {rows.map(([label, value]) => (
        <button className="info-row" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <i>›</i>
        </button>
      ))}
    </div>
  )
}

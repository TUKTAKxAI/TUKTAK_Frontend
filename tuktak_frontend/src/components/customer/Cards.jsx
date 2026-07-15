import { useState } from 'react'
import { FaChevronRight, FaSearch, FaTimes } from 'react-icons/fa'
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

export function SearchBar({ placeholder = '검색', value = '', onChange }) {
  return (
    <div className="search-shell">
      <FaSearch aria-hidden="true" />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {value ? <button type="button" onClick={() => onChange?.('')} aria-label="검색어 지우기"><FaTimes /></button> : null}
    </div>
  )
}

export function EstimateCard({ item, onClick, actionLabel }) {
  return (
    <button className="record-card" onClick={onClick}>
      <div className="record-title-row-head">
        <div>
          <span className="record-date">{item.date}</span>
          <h3 className="record-title">{item.title}</h3>
        </div>
        <span className="mypage-record-badge">{item.status}</span>
      </div>
      <div className="record-rows">
        <p className="record-detail"><span>비용</span>{item.subtitle.replace('예상 비용 : ', '')}</p>
        {item.details?.location ? <p className="record-detail"><span>위치</span>{item.details.location}</p> : null}
        {item.details?.estimatedTime ? <p className="record-detail"><span>시간</span>{item.details.estimatedTime}</p> : null}
      </div>
      {actionLabel ? <strong className="detail-toggle">{actionLabel}</strong> : null}
    </button>
  )
}

export function HistoryCard({ item, onClickReview }) {
  const [expanded, setExpanded] = useState(false)
  const isComplete = item.status === '완료됨'

  return (
    <article className="record-card">
      <div className="record-title-row-head">
        <div>
          <span className="record-date">{item.date}</span>
          <h3 className="record-title">{item.title}</h3>
        </div>
        <span className={`mypage-record-badge ${isComplete ? 'is-complete' : ''}`}>{item.status}</span>
      </div>
      <div className="record-rows">
        <p className="record-detail"><span>비용</span>{item.cost.replace('확정 시공 비용 : ', '')}</p>
        <p className="record-detail"><span>파트너</span>{item.partner.replace('담당 파트너 : ', '')}</p>
        <p className="record-detail"><span>예정일</span>{item.schedule.replace('시공 예정일 : ', '')}</p>
      </div>
      <div className="record-footer">
        <button className="detail-toggle" onClick={() => setExpanded((value) => !value)}>
          {expanded ? '자세히 접기' : '자세히 보기'}
        </button>
        {item.reviewable ? <button className="mini-primary side-review-button" onClick={onClickReview}>리뷰 작성</button> : null}
      </div>
      {expanded ? <HistoryDetailPanel details={item.details} /> : null}
    </article>
  )
}

function HistoryDetailPanel({ details }) {
  const sections = [
    ['요청 정보', details?.request ?? []],
    ['시공 정보', details?.work ?? []],
    ['파트너 정보', details?.partnerInfo ?? []],
  ]

  return (
    <div className="history-detail-panel">
      {sections.map(([title, rows]) => (
        <section key={title}>
          <h4>{title}</h4>
          {rows.map(([label, value]) => (
            <p key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </p>
          ))}
        </section>
      ))}
    </div>
  )
}

export function RiskCard({ item, onClick }) {
  const gradeClass = item.riskLevel === 'LOW' ? 'is-low' : item.riskLevel === 'MEDIUM' ? 'is-medium' : item.riskLevel === 'HIGH' ? 'is-high' : ''

  return (
    <article className={`record-card risk-list-card ${item.isExpired ? 'expired' : ''}`}>
      <div className="record-title-row-head">
        <div>
          <span className="record-date">{item.date}</span>
          <h3 className="record-title">{item.title}</h3>
        </div>
        <span className={`mypage-record-badge ${item.isExpired ? 'is-complete' : ''}`}>{item.expireLabel}</span>
      </div>
      <div className="record-rows">
        <p className="record-detail"><span>점수</span>{item.riskScore}점</p>
        <p className="record-detail"><span>등급</span><strong className={`risk-output-grade ${gradeClass}`}>{item.riskLevel}</strong></p>
      </div>
      <button className={`wide-action ${item.isExpired ? 'disabled' : ''}`} disabled={item.isExpired} onClick={item.isExpired ? undefined : onClick}>
        {item.isExpired ? '만료됨' : '리스크 리포트 확인하기'}
      </button>
    </article>
  )
}

export function ReviewCard({ review, onDelete }) {
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
        <button className="mini-orange" onClick={() => onDelete?.(review.id)}>삭제</button>
        <time>{review.date}</time>
      </div>
    </article>
  )
}

export function MenuTile({ Icon, label, onClick }) {
  return (
    <button className="mypage-menu-item" onClick={onClick}>
      <span className="mypage-menu-icon"><Icon aria-hidden="true" /></span>
      <span className="mypage-menu-label">{label}</span>
      <FaChevronRight className="mypage-menu-chevron" aria-hidden="true" />
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

export function InfoRows({ rows, onSelect }) {
  return (
    <div className="mypage-info-panel">
      {rows.map((row) => {
        const label = Array.isArray(row) ? row[0] : row.label
        const value = Array.isArray(row) ? row[1] : row.value

        return (
        <button className="info-row" key={label} onClick={() => onSelect?.(row)}>
          <span>{label}</span>
          <strong>{value}</strong>
          <i aria-hidden="true"><FaChevronRight /></i>
        </button>
        )
      })}
    </div>
  )
}

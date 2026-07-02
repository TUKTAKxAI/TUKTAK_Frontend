import { useState } from 'react'
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
      <div className="search-lens" />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {value ? <button type="button" onClick={() => onChange?.('')} aria-label="검색어 지우기">×</button> : <i>›</i>}
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
        <p className="record-detail"><span>비용</span>{item.subtitle.replace('예상 비용 : ', '')}</p>
        {item.details?.location ? <p className="record-detail"><span>위치</span>{item.details.location}</p> : null}
        {item.details?.estimatedTime ? <p className="record-detail"><span>시간</span>{item.details.estimatedTime}</p> : null}
        {actionLabel ? <strong>{actionLabel}</strong> : null}
      </div>
    </button>
  )
}

export function HistoryCard({ item, onClickReview }) {
  const [expanded, setExpanded] = useState(false)
  const statusClass = item.status === '진행중' ? 'in-progress' : item.status === '완료됨' ? 'completed' : ''

  return (
    <article className={`record-card history-card ${expanded ? 'expanded' : ''}`}>
      <div className="record-side">
        <span>{item.date}</span>
        <small className={`status-label ${statusClass}`}>{item.status}</small>
        {item.reviewable ? <button className="mini-primary side-review-button" onClick={onClickReview}>리뷰 작성</button> : null}
      </div>
      <div className="record-main">
        <h3>{item.title}</h3>
        <p className="record-detail"><span>비용</span>{item.cost.replace('확정 시공 비용 : ', '')}</p>
        <p className="record-detail"><span>파트너</span>{item.partner.replace('담당 파트너 : ', '')}</p>
        <p className="record-detail"><span>예정일</span>{item.schedule.replace('시공 예정일 : ', '')}</p>
        <div className="record-footer">
          <span />
          <button className="detail-toggle" onClick={() => setExpanded((value) => !value)}>
            {expanded ? '자세히 접기 ˄' : '자세히 보기 ˅'}
          </button>
        </div>
        {expanded ? <HistoryDetailPanel details={item.details} /> : null}
      </div>
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
  return (
    <article className={`record-card risk-list-card ${item.isExpired ? 'expired' : ''}`}>
      <div className="record-side">
        <span>{item.date}</span>
        <small className={`status-label ${item.isExpired ? 'completed' : 'in-progress'}`}>
          {item.expireLabel}
        </small>
      </div>
      <div className="record-main">
        <h3>{item.title}</h3>
        <p className="record-detail"><span>점수</span>{item.riskScore}점</p>
        <p className="record-detail"><span>등급</span>{item.riskLevel}</p>
        <button className={`wide-action ${item.isExpired ? 'disabled' : ''}`} disabled={item.isExpired} onClick={item.isExpired ? undefined : onClick}>
          {item.isExpired ? '만료됨' : '리스크 리포트 확인하기'}
        </button>
      </div>
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

export function MenuTile({ icon, image, label, onClick }) {
  return (
    <button className="menu-tile" onClick={onClick}>
      {image ? (
        <img
          className={`tile-icon-img ${label === '매칭 히스토리' ? 'matching-history-tile-icon' : ''} ${label === '내 AI 견적서' ? 'ai-estimate-tile-icon' : ''} ${label === '내가 쓴 리뷰' ? 'written-review-tile-icon' : ''} ${label === '내 정보' ? 'profile-tile-icon' : ''} ${label === '내 리스크리포트' ? 'risk-report-tile-icon' : ''}`}
          src={image}
          alt=""
        />
      ) : (
        <div className={`tile-icon ${icon}`} />
      )}
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

export function InfoRows({ rows, onSelect }) {
  return (
    <div className="info-panel">
      {rows.map((row) => {
        const label = Array.isArray(row) ? row[0] : row.label
        const value = Array.isArray(row) ? row[1] : row.value

        return (
        <button className="info-row" key={label} onClick={() => onSelect?.(row)}>
          <span>{label}</span>
          <strong>{value}</strong>
          <i>›</i>
        </button>
        )
      })}
    </div>
  )
}

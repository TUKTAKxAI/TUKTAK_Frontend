import { FaChevronRight } from 'react-icons/fa'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { screens } from '../../data/customerData'
import { contractorScreens } from '../../data/contractorData'

export function StatusBadge({ children, tone = 'blue' }) {
  return <span className={`contractor-status ${tone}`}>{children}</span>
}

export function ContractorPage({ title, children, go, back, action }) {
  const handleGo = (screen) => {
    if (screen === screens.mypage) {
      go?.(contractorScreens.mypage)
    } else {
      go?.(screen)
    }
  }

  return (
    <section className="home-layout">
      <CustomerTopBar go={handleGo} />

      <div className="flex flex-col flex-1">
        {(title || back || action) ? (
          <div className="contractor-page-head">
            <div>
              {back ? <button className="contractor-back-button" type="button" onClick={back}>‹</button> : null}
              {title ? <h1>{title}</h1> : null}
            </div>
            {action ? <div className="contractor-page-action">{action}</div> : null}
          </div>
        ) : null}
        {children}
      </div>

      <div className="h-40 w-full shrink-0"></div>
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

export function RequestCard({ item, onDetail }) {
  return (
    <article className="contractor-request-card simple">
      <div>
        <strong className="contractor-region">{item.city}</strong>
        <h2>{item.title}</h2>
        <p>{item.desiredDate} · {item.time}</p>
        {item.quoteId ? <p className="contractor-request-quoted">견적 전송 완료</p> : null}
      </div>
      <button className="contractor-detail-link" type="button" onClick={onDetail}>
        자세히 보기 <FaChevronRight />
      </button>
    </article>
  )
}

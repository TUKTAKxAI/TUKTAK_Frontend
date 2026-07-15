import { FaChevronRight } from 'react-icons/fa'
import { TopBar } from '../../components/customer/TopBar'
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
      <TopBar go={handleGo} />

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

export function RequestCard({ item, onDetail }) {
  return (
    <button className="contractor-requests-card" type="button" onClick={onDetail}>
      <span className="contractor-requests-card-body">
        <span className="contractor-requests-card-region">{item.city}</span>
        <span className="contractor-requests-card-title">{item.title}</span>
        <span className="contractor-requests-card-meta">{item.desiredDate} · {item.time}</span>
        {item.quoteId ? <span className="contractor-requests-card-badge">견적 전송 완료</span> : null}
      </span>
      <FaChevronRight className="contractor-requests-card-chevron" aria-hidden="true" />
    </button>
  )
}

import { FaChevronRight } from 'react-icons/fa'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { contractorScreens } from '../../data/contractorData'
import { screens } from '../../data/customerData'

export function StatusBadge({ children, tone = 'blue' }) {
  return <span className={`contractor-status ${tone}`}>{children}</span>
}

export function InfoModal({ title, message, confirmText = '확인', onConfirm }) {
  return (
    <div className="contractor-modal-backdrop" role="dialog" aria-modal="true">
      <div className="contractor-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="contractor-bottom-actions single">
          <button type="button" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

export function ContractorPage({ title, children, go, back, action }) {
  const headerGo = (screen) => {
    go?.(screen === screens.mypage ? contractorScreens.mypage : screen)
  }

  return (
    <section className="contractor-screen">
      <CustomerTopBar go={headerGo} compact onNotificationClick={() => go?.(contractorScreens.notifications)} />
      <div className="contractor-content">
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
        {item.quoteId ? <p>이미 견적서를 보냈습니다</p> : null}
      </div>
      <button className="contractor-detail-link" type="button" onClick={onDetail}>
        자세히 보기 <FaChevronRight />
      </button>
    </article>
  )
}

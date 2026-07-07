import { FaChevronRight } from 'react-icons/fa'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { screens } from '../../data/customerData'
import { contractorScreens } from '../../data/contractorData'

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
        {children}
      </div>

      <div className="h-40 w-full shrink-0"></div>
    </section>
  )
}

export function StatusBadge({ children, tone = 'blue' }) {
  return <span className={`contractor-status ${tone}`}>{children}</span>
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
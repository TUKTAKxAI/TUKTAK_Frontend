import { FaChevronLeft, FaUserCircle } from 'react-icons/fa'

export function ContractorTopBar({ title = '시공자', back, action }) {
  return (
    <header className="contractor-topbar">
      {back ? <button type="button" onClick={back}><FaChevronLeft /></button> : <span className="contractor-logo-mark">T</span>}
      <strong>{title}</strong>
      <div>{action || <FaUserCircle />}</div>
    </header>
  )
}

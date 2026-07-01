import { screens } from '../../data/customerData'
import { figmaAssets } from './figmaAssets'
import { Logo } from './FormControls'

export function HeaderIcon({ src, label, onClick }) {
  return (
    <button className="top-icon-button" type="button" aria-label={label} onClick={onClick}>
      <img src={src} alt="" />
    </button>
  )
}

/* hideTitle 추가 */
export function CustomerTopBar({ go, title, compact = false, hideTitle = false, }) {
  return (
    <header className={`customer-topbar ${compact ? 'compact' : ''}`}>
      <div className="brand-with-title">
        <Logo />
        {!hideTitle && title ? <h1>{title}</h1> : null}
      </div>
      <div className="top-actions">
        <HeaderIcon src={figmaAssets.notification} label="알림" />
        <HeaderIcon src={figmaAssets.userProfile} label="마이페이지" onClick={() => go?.(screens.mypage)} />
      </div>
    </header>
  )
}

import { screens } from '../../data/customerData'
import { useNotifications } from '../../context/notificationContext'
import { figmaAssets } from './figmaAssets'

export function HeaderIcon({ src, label, onClick, className = '' }) {
  return (
    <button className={`top-icon-button ${className}`.trim()} type="button" aria-label={label} onClick={onClick}>
      <img src={src} alt="" />
    </button>
  )
}

function Brand() {
  return (
    <div className="topbar-brand">
      <img src={figmaAssets.logoMark} alt="" className="topbar-logo-mark" />
      <span className="topbar-wordmark">TUKTAK</span>
    </div>
  )
}

export function TopBar({
  go,
  back,
  notificationIcon,
  notificationCount,
  onNotificationClick,
}) {
  const notifications = useNotifications()
  const resolvedNotificationIcon = notificationIcon ?? notifications?.notificationIcon ?? figmaAssets.notification
  const resolvedNotificationCount = notificationCount ?? notifications?.unreadCount ?? 0
  const handleNotificationClick = onNotificationClick ?? notifications?.openNotifications

  return (
    <header className="home-topbar customer-topbar">
      {back ? <HeaderIcon src={figmaAssets.back} label="뒤로가기" onClick={back} className="top-back-button" /> : <Brand />}
      <div className="top-actions">
        <div className="home-notification-trigger">
          <HeaderIcon src={resolvedNotificationIcon} label="알림" onClick={handleNotificationClick} />
          {resolvedNotificationCount > 0 ? <span>{resolvedNotificationCount}</span> : null}
        </div>
        <HeaderIcon src={figmaAssets.userProfile} label="마이페이지" onClick={() => go?.(screens.mypage)} />
      </div>
    </header>
  )
}

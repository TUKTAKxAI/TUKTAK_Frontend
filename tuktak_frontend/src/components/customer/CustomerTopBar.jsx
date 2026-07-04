import { screens } from '../../data/customerData'
import { useNotifications } from '../../context/notificationContext'
import { figmaAssets } from './figmaAssets'
import { Logo } from './FormControls'

export function HeaderIcon({ src, label, onClick }) {
  return (
    <button className="top-icon-button" type="button" aria-label={label} onClick={onClick}>
      <img src={src} alt="" />
    </button>
  )
}

export function CustomerTopBar({
  go,
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
      <Logo />
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

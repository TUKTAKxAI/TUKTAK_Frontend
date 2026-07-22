import { TopBar } from '../../components/customer/TopBar'

export function CustomerPage({
  children,
  go,
  back,
  notificationIcon,
  notificationCount,
  onNotificationClick,
  className = '',
}) {
  return (
    <section className={`home-layout flex flex-col h-full ${className}`.trim()}>
      <TopBar
        go={go}
        back={back}
        notificationIcon={notificationIcon}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
      />
      {children}
    </section>
  )
}

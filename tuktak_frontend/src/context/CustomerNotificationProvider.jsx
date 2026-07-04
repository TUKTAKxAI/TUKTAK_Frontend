import { useMemo, useState } from 'react'
import { figmaAssets } from '../components/customer/figmaAssets'
import notificationEmptyBell from '../assets/figma/notification-empty-bell-gray.svg'
import { NotificationContext } from './notificationContext'

const initialNotifications = [
  {
    id: 1,
    title: 'AI 견적서가 생성되었습니다.',
    message: '거실 몰딩 시공 견적서를 확인해보세요.',
    time: '방금 전',
    isRead: false,
  },
  {
    id: 2,
    title: '리스크 리포트가 준비되었습니다.',
    message: '추가 비용 가능성과 주의사항 체크리스트를 확인할 수 있어요.',
    time: '12분 전',
    isRead: false,
  },
  {
    id: 3,
    title: '새로운 시공자 견적이 도착했습니다.',
    message: '김도배 파트너님이 견적을 보냈습니다.',
    time: '1시간 전',
    isRead: true,
  },
]

export function CustomerNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  const value = useMemo(
    () => ({
      notificationIcon: unreadCount > 0 ? figmaAssets.notification : notificationEmptyBell,
      unreadCount,
      openNotifications: () => setIsOpen(true),
    }),
    [unreadCount]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {isOpen && (
        <div className="home-address-overlay" role="presentation" onClick={() => setIsOpen(false)}>
          <section
            className="home-notification-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-notification-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="home-address-head">
              <h2 id="home-notification-title">알림</h2>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="닫기">
                ×
              </button>
            </div>
            <div className="home-notification-summary">
              <strong>읽지 않은 알림 {unreadCount}개</strong>
              <button
                type="button"
                onClick={() => {
                  setNotifications((items) => items.map((item) => ({ ...item, isRead: true })))
                }}
              >
                모두 읽음
              </button>
            </div>
            <div className="home-notification-list">
              {notifications.length === 0 ? (
                <div className="home-notification-empty">
                  <img src={notificationEmptyBell} alt="" />
                  <p>도착한 알림이 없습니다.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    className={`home-notification-item ${notification.isRead ? 'read' : ''}`}
                    key={notification.id}
                    type="button"
                    onClick={() => {
                      setNotifications((items) =>
                        items.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
                      )
                    }}
                  >
                    <span aria-hidden="true" />
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                      <small>{notification.time}</small>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

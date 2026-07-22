import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { figmaAssets } from '../components/customer/figmaAssets'
import notificationEmptyBell from '../assets/figma/notification-empty-bell-gray.svg'
import { NotificationContext } from './notificationContext'
import { useAuth } from './authContext'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notificationApi'

const POLL_INTERVAL_MS = 15000

function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const diffMinutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000)
  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`
  return `${Math.floor(diffHours / 24)}일 전`
}

function mapNotification(item) {
  return {
    id: item.notification_id,
    title: item.title,
    message: item.content,
    time: formatRelativeTime(item.created_at),
    isRead: item.is_read,
  }
}

export function CustomerNotificationProvider({ children }) {
  const { isLogin } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  const fetchNotifications = useCallback(() => {
    return getNotifications({ page: 1, size: 30 })
      .then((result) => {
        setNotifications((result?.items || []).map(mapNotification))
      })
      .catch(() => {
        // 알림 조회 실패 시 다음 폴링에서 다시 시도한다.
      })
  }, [])

  useEffect(() => {
    if (!isLogin) return undefined

    fetchNotifications()
    const intervalId = setInterval(fetchNotifications, POLL_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [isLogin, fetchNotifications])

  const value = useMemo(
    () => ({
      notificationIcon: unreadCount > 0 ? figmaAssets.notification : notificationEmptyBell,
      unreadCount,
      openNotifications: () => setIsOpen(true),
    }),
    [unreadCount]
  )

  const handleMarkAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })))
    try {
      await markAllNotificationsRead()
    } catch {
      // 실패해도 다음 폴링에서 서버 상태로 재동기화된다.
    }
  }

  const handleItemClick = async (notification) => {
    if (notification.isRead) return
    setNotifications((items) =>
      items.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
    )
    try {
      await markNotificationRead(notification.id)
    } catch {
      // 실패해도 다음 폴링에서 서버 상태로 재동기화된다.
    }
  }

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
                <FaTimes />
              </button>
            </div>
            <div className="home-notification-summary">
              <strong>읽지 않은 알림 {unreadCount}개</strong>
              <button type="button" onClick={handleMarkAllRead}>
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
                    onClick={() => handleItemClick(notification)}
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

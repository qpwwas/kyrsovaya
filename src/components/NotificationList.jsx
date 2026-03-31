import { StatusPill } from './StatusPill'

export function NotificationList({ notifications }) {
  if (!notifications.length) {
    return <div className="empty-state">Уведомлений пока нет.</div>
  }

  return (
    <div className="notification-list">
      {notifications.map((notification) => (
        <article key={notification.id} className="notification-item">
          <div className="card__header">
            <div>
              <div className="notification-item__title">{notification.title}</div>
              <div className="notification-item__body">{notification.body}</div>
            </div>
            <StatusPill tone={notification.tone}>{notification.channel}</StatusPill>
          </div>
          <div className="notification-item__time">{notification.timeLabel}</div>
        </article>
      ))}
    </div>
  )
}

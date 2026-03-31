import { formatDateTime } from '../utils/format'
import { StatusPill } from './StatusPill'

export function ScheduleCard({ session, participantsCount, capacity }) {
  const occupancy = Math.round((participantsCount / capacity) * 100)
  const tone = occupancy >= 90 ? 'warning' : 'success'

  return (
    <article className="card schedule-card">
      <div className="schedule-card__header">
        <div>
          <StatusPill tone={session.statusTone}>{session.statusLabel}</StatusPill>
          <h3 className="card__title" style={{ marginTop: 12 }}>
            {session.sectionName}
          </h3>
          <p className="schedule-card__description">{formatDateTime(session.dateTime)}</p>
        </div>
        <StatusPill tone={tone}>{occupancy}% загрузка</StatusPill>
      </div>

      <div className="schedule-card__meta">
        <div className="meta-box">
          <span className="meta-box__label">Тренер</span>
          <span className="meta-box__value">{session.coach}</span>
        </div>
        <div className="meta-box">
          <span className="meta-box__label">Зал</span>
          <span className="meta-box__value">{session.hall}</span>
        </div>
        <div className="meta-box">
          <span className="meta-box__label">Заполнено</span>
          <span className="meta-box__value">
            {participantsCount} из {capacity}
          </span>
        </div>
        <div className="meta-box">
          <span className="meta-box__label">Формат</span>
          <span className="meta-box__value">{session.format}</span>
        </div>
      </div>

      <div className="inline-note">{session.note}</div>
    </article>
  )
}

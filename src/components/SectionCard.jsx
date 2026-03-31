import { StatusPill } from './StatusPill'

export function SectionCard({
  section,
  isEnrolled,
  canEnroll,
  onEnroll,
  participantsCount,
}) {
  const seatsLeft = section.capacity - participantsCount
  const occupancy = Math.round((participantsCount / section.capacity) * 100)

  return (
    <article className="card section-card">
      <div className="section-card__header">
        <div>
          <StatusPill tone={section.statusTone}>{section.statusLabel}</StatusPill>
          <h3 className="card__title" style={{ marginTop: 12 }}>
            {section.name}
          </h3>
          <p className="section-card__description">{section.description}</p>
        </div>
        <StatusPill tone={occupancy > 85 ? 'warning' : 'info'}>
          {participantsCount}/{section.capacity}
        </StatusPill>
      </div>

      <div className="tag-list">
        {section.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="section-card__meta">
        <div className="meta-box">
          <span className="meta-box__label">Тренер</span>
          <span className="meta-box__value">{section.coach}</span>
        </div>
        <div className="meta-box">
          <span className="meta-box__label">Зал</span>
          <span className="meta-box__value">{section.hall}</span>
        </div>
        <div className="meta-box">
          <span className="meta-box__label">Возрастная группа</span>
          <span className="meta-box__value">{section.ageGroup}</span>
        </div>
        <div className="meta-box">
          <span className="meta-box__label">Расписание</span>
          <span className="meta-box__value">{section.scheduleSummary}</span>
        </div>
      </div>

      <div className="progress-bar" aria-hidden="true">
        <span style={{ width: `${occupancy}%` }}></span>
      </div>

      <div className="actions-row">
        <button className="button" onClick={() => onEnroll(section.id)} disabled={!canEnroll}>
          {isEnrolled ? 'Уже записан' : 'Записать в секцию'}
        </button>
        <span className="inline-note">
          {seatsLeft > 0 ? `Свободно мест: ${seatsLeft}` : 'Свободных мест нет'}
        </span>
      </div>
    </article>
  )
}

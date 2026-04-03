import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../context/useAppState'

function AnimatedCounter({ value, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!Number.isFinite(value)) {
      return undefined
    }

    let frameId = 0
    const duration = 1000
    const startedAt = performance.now()

    function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(value * eased))

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick)
      }
    }

    frameId = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(frameId)
  }, [value])

  return (
    <>
      {displayValue}
      {suffix}
    </>
  )
}

export function AchievementsPage() {
  const {
    achievements,
    currentRole,
    getAttendanceRate,
    managedParticipantIds,
    participants,
    sectionsById,
  } = useAppState()

  const visibleParticipants =
    currentRole === 'athlete'
      ? participants.filter((participant) => managedParticipantIds.includes(participant.id))
      : currentRole === 'parent'
        ? participants.filter((participant) => managedParticipantIds.includes(participant.id))
        : participants

  const totalAchievements = achievements.length
  const averageAttendance = visibleParticipants.length
    ? Math.round(
        visibleParticipants.reduce((sum, p) => sum + getAttendanceRate(p.id), 0) /
          visibleParticipants.length
      )
    : 0

  return (
    <>
      <PageHeader
        eyebrow="Результаты и прогресс"
        title={
          <>
            Достижения
            <span className="accent-text"> спортсменов</span>
          </>
        }
        description="Отслеживайте награды, посещаемость и динамику роста показателей. Для спортсмена и родителя отображаются персональные данные."
      />

      <Reveal className="stats-strip" delay={0}>
        <article className="stats-strip__item">
          <span className="stats-strip__label">Спортсменов</span>
          <strong className="stats-strip__value">
            <AnimatedCounter value={visibleParticipants.length} />
          </strong>
        </article>
        <article className="stats-strip__item">
          <span className="stats-strip__label">Наград</span>
          <strong className="stats-strip__value">
            <AnimatedCounter value={totalAchievements} />
          </strong>
        </article>
        <article className="stats-strip__item">
          <span className="stats-strip__label">Ср. посещаемость</span>
          <strong className="stats-strip__value">
            <AnimatedCounter value={averageAttendance} suffix="%" />
          </strong>
        </article>
        <article className="stats-strip__item">
          <span className="stats-strip__label">Секций</span>
          <strong className="stats-strip__value">
            <AnimatedCounter value={Object.keys(sectionsById).length} />
          </strong>
        </article>
      </Reveal>

      <section className="achievement-grid">
        {visibleParticipants.length ? (
          visibleParticipants.map((participant, index) => {
            const participantAchievements = achievements.filter(
              (item) => item.participantId === participant.id,
            )
            const attendanceRate = getAttendanceRate(participant.id)
            const sections = participant.sectionIds
              .map((sectionId) => sectionsById[sectionId]?.name)
              .filter(Boolean)

            return (
              <Reveal key={participant.id} delay={50 + index * 30}>
                <article className="card">
                  <div className="card__header">
                    <div>
                      <StatusPill tone="info">{participant.level}</StatusPill>
                      <h2 className="card__title" style={{ marginTop: 12 }}>
                        {participant.name}
                      </h2>
                      <p className="card__description">{participant.focus}</p>
                    </div>
                    <StatusPill tone={attendanceRate >= 80 ? 'success' : 'warning'}>
                      {attendanceRate}%
                    </StatusPill>
                  </div>

                  <div className="section-card__meta">
                    <div className="meta-box">
                      <span className="meta-box__label">Возраст</span>
                      <span className="meta-box__value">{participant.age} лет</span>
                    </div>
                    <div className="meta-box">
                      <span className="meta-box__label">Родитель</span>
                      <span className="meta-box__value">{participant.parentName}</span>
                    </div>
                  </div>

                  {sections.length > 0 && (
                    <div className="tag-list">
                      {sections.map((sectionName) => (
                        <span key={sectionName} className="tag">
                          {sectionName}
                        </span>
                      ))}
                    </div>
                  )}

                  {participantAchievements.length ? (
                    <ul className="bullet-list">
                      {participantAchievements.map((achievement) => (
                        <li key={achievement.id}>
                          <span className="highlight">{achievement.title}</span>
                          <br />
                          <span style={{ color: 'var(--muted)' }}>{achievement.details}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-state" style={{ padding: 20 }}>
                      Пока нет зафиксированных достижений
                    </div>
                  )}
                </article>
              </Reveal>
            )
          })
        ) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            Для этого режима пока нет доступных данных. Выполните вход, чтобы увидеть
            достижения и персональную статистику.
          </div>
        )}
      </section>
    </>
  )
}

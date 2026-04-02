import { PageHeader } from '../components/PageHeader'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../context/useAppState'

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

  return (
    <>
      <PageHeader
        eyebrow="Результаты и прогресс"
        title="Достижения спортсменов и личная динамика"
        description="Страница показывает результаты, посещаемость и направления подготовки. Для спортсмена и родителя открываются персональные данные, для администратора и тренера доступна общая картина."
      />

      <section className="achievement-grid">
        {visibleParticipants.length ? visibleParticipants.map((participant) => {
          const participantAchievements = achievements.filter(
            (item) => item.participantId === participant.id,
          )
          const attendanceRate = getAttendanceRate(participant.id)
          const sections = participant.sectionIds
            .map((sectionId) => sectionsById[sectionId]?.name)
            .filter(Boolean)

          return (
            <article key={participant.id} className="card">
              <div className="card__header">
                <div>
                  <StatusPill tone="info">{participant.level}</StatusPill>
                  <h2 className="card__title" style={{ marginTop: 12 }}>
                    {participant.name}
                  </h2>
                  <p className="card__description">{participant.focus}</p>
                </div>
                <StatusPill tone={attendanceRate >= 80 ? 'success' : 'warning'}>
                  Посещаемость {attendanceRate}%
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

              <div className="tag-list">
                {sections.map((sectionName) => (
                  <span key={sectionName} className="tag">
                    {sectionName}
                  </span>
                ))}
              </div>

              {participantAchievements.length ? (
                <ul className="bullet-list">
                  {participantAchievements.map((achievement) => (
                    <li key={achievement.id}>
                      <span>
                        <span className="highlight">{achievement.title}</span>
                        <br />
                        {achievement.details}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  Для этого спортсмена пока не добавлены спортивные достижения.
                </div>
              )}
            </article>
          )
        }) : (
          <div className="empty-state">
            Для этого режима пока нет доступных данных. Выполните вход, чтобы увидеть
            достижения и персональную статистику.
          </div>
        )}
      </section>
    </>
  )
}

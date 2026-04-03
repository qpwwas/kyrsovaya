import { PageHeader } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
import { StatCard } from '../components/StatCard'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../context/useAppState'
import { formatDateTime } from '../utils/format'

function getTodayKey() {
  return new Intl.DateTimeFormat('sv-SE').format(new Date())
}

export function AdminPage() {
  const { currentRole, participants, schedule, sections, stats } = useAppState()

  const todaySessions = schedule.filter((session) =>
    session.dateTime.startsWith(getTodayKey()),
  )
  const coachLoad = sections.reduce((accumulator, section) => {
    const existing = accumulator[section.coach] ?? 0
    return {
      ...accumulator,
      [section.coach]: existing + 1,
    }
  }, {})

  return (
    <>
      <PageHeader
        eyebrow="Административная панель"
        title={
          <>
            Управление
            <span className="accent-text"> SportSpace</span>
          </>
        }
        description="Операционная информация для руководителя: тренировки, загрузка секций, список тренеров и статистика участников."
        action={
          <StatusPill tone={currentRole === 'admin' ? 'success' : 'warning'}>
            {currentRole === 'admin' ? 'Полный доступ' : 'Режим просмотра'}
          </StatusPill>
        }
      />

      <Reveal className="stats-grid" delay={0}>
        <StatCard
          label="Тренировок на день"
          value={stats.trainingsToday}
          hint="Активные слоты сегодня"
        />
        <StatCard
          label="Секций"
          value={stats.sectionCount}
          hint="Направлений в каталоге"
        />
        <StatCard
          label="Тренеров"
          value={stats.coachCount}
          hint="В расписании"
        />
        <StatCard
          label="Участников"
          value={stats.participantCount}
          hint="Спортсменов в секциях"
        />
      </Reveal>

      <div className="page-grid page-grid--two">
        <Reveal className="card" delay={50}>
          <div className="card__header">
            <div>
              <h2 className="card__title">Тренировки сегодня</h2>
              <p className="card__description">
                Дневная загрузка спортивного комплекса.
              </p>
            </div>
            <StatusPill tone="info">{todaySessions.length} занятий</StatusPill>
          </div>

          {todaySessions.length > 0 ? (
            <div className="timeline">
              {todaySessions.map((session) => (
                <article key={session.id} className="timeline__item">
                  <strong>{session.sectionName}</strong>
                  <span className="inline-note">{formatDateTime(session.dateTime)}</span>
                  <span className="inline-note">
                    {session.coach} / {session.hall}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">На сегодня тренировок не запланировано</div>
          )}
        </Reveal>

        <Reveal className="card" delay={100}>
          <div className="card__header">
            <div>
              <h2 className="card__title">Секции и наполняемость</h2>
              <p className="card__description">
                Количество участников и свободных мест.
              </p>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Секция</th>
                  <th>Тренер</th>
                  <th>Участники</th>
                  <th>Свободно</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <tr key={section.id}>
                    <td>{section.name}</td>
                    <td>{section.coach}</td>
                    <td>{section.participantIds.length}</td>
                    <td>{section.capacity - section.participantIds.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>

      <div className="page-grid page-grid--two">
        <Reveal className="card" delay={150}>
          <div className="card__header">
            <div>
              <h2 className="card__title">Тренерский состав</h2>
              <p className="card__description">
                Распределение направлений между тренерами.
              </p>
            </div>
          </div>

          <div className="coach-grid">
            {Object.entries(coachLoad).map(([coach, count]) => (
              <article key={coach} className="meta-box">
                <span className="meta-box__label">{coach}</span>
                <span className="meta-box__value">{count} секции</span>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="card" delay={200}>
          <div className="card__header">
            <div>
              <h2 className="card__title">Участники системы</h2>
              <p className="card__description">
                Спортсмены с возрастом и фокусом подготовки.
              </p>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Спортсмен</th>
                  <th>Возраст</th>
                  <th>Уровень</th>
                  <th>Фокус</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.id}>
                    <td>{participant.name}</td>
                    <td>{participant.age}</td>
                    <td>{participant.level}</td>
                    <td>{participant.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </>
  )
}

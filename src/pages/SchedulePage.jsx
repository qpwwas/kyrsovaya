import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
import { ScheduleCard } from '../components/ScheduleCard'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../context/useAppState'
import { formatDateTime, toDateTimeInputValue } from '../utils/format'

function ScheduleEditorCard({
  currentRole,
  halls,
  rescheduleSession,
  schedule,
  selectedSession,
  selectedSessionId,
  setSelectedSessionId,
}) {
  const [formState, setFormState] = useState({
    dateTime: toDateTimeInputValue(selectedSession?.dateTime ?? ''),
    hall: selectedSession?.hall ?? halls[0],
  })
  const [scheduleFeedback, setScheduleFeedback] = useState({
    type: 'info',
    message: 'При переносе тренировки система проверяет занятость залов и тренеров.',
  })

  function handleSubmit(event) {
    event.preventDefault()
    const result = rescheduleSession(selectedSessionId, formState)

    setScheduleFeedback({
      type: result.ok ? 'success' : 'error',
      message: result.message,
    })
  }

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Редактирование расписания</h2>
          <p className="card__description">
            Перенос тренировки с автоматической проверкой конфликтов.
          </p>
        </div>
        <StatusPill tone={['admin', 'coach'].includes(currentRole) ? 'success' : 'warning'}>
          {['admin', 'coach'].includes(currentRole) ? 'Доступно' : 'Только просмотр'}
        </StatusPill>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className={`alert alert--${scheduleFeedback.type}`}>
          {scheduleFeedback.message}
        </div>

        <div className="field">
          <label htmlFor="session-id">Выберите тренировку</label>
          <select
            id="session-id"
            value={selectedSessionId}
            onChange={(event) => setSelectedSessionId(event.target.value)}
          >
            {schedule.map((session) => (
              <option key={session.id} value={session.id}>
                {session.sectionName} / {formatDateTime(session.dateTime)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-grid form-grid--two">
          <div className="field">
            <label htmlFor="session-date">Новая дата и время</label>
            <input
              id="session-date"
              type="datetime-local"
              value={formState.dateTime}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  dateTime: event.target.value,
                }))
              }
            />
          </div>

          <div className="field">
            <label htmlFor="session-hall">Зал</label>
            <select
              id="session-hall"
              value={formState.hall}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  hall: event.target.value,
                }))
              }
            >
              {halls.map((hall) => (
                <option key={hall} value={hall}>
                  {hall}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="actions-row">
          <button
            className="button"
            type="submit"
            disabled={!['admin', 'coach'].includes(currentRole)}
          >
            Сохранить изменения
          </button>
        </div>

        {selectedSession ? (
          <div className="meta-box" style={{ marginTop: 8 }}>
            <span className="meta-box__label">Текущие данные</span>
            <span className="meta-box__value">{selectedSession.sectionName}</span>
            <p className="inline-note">
              Тренер: {selectedSession.coach} / Зал: {selectedSession.hall}
            </p>
          </div>
        ) : null}
      </form>
    </section>
  )
}

export function SchedulePage() {
  const { currentRole, halls, rescheduleSession, schedule, sectionsById } = useAppState()
  const [selectedSessionId, setSelectedSessionId] = useState(schedule[0]?.id ?? '')
  const [hallFilter, setHallFilter] = useState('all')
  const activeSessionId = schedule.some((session) => session.id === selectedSessionId)
    ? selectedSessionId
    : schedule[0]?.id ?? ''

  const selectedSession =
    schedule.find((session) => session.id === activeSessionId) ?? schedule[0]

  const filteredSchedule = schedule.filter(
    (session) => hallFilter === 'all' || session.hall === hallFilter,
  )

  return (
    <>
      <PageHeader
        eyebrow="Планирование тренировок"
        title={
          <>
            Расписание занятий
            <span className="accent-text"> и управление слотами</span>
          </>
        }
        description="Контроль занятости залов, тренеров и групп. Возможность переноса тренировок с автоматической проверкой конфликтов."
        action={
          <StatusPill tone={['admin', 'coach'].includes(currentRole) ? 'success' : 'warning'}>
            {['admin', 'coach'].includes(currentRole)
              ? 'Редактирование доступно'
              : 'Режим просмотра'}
          </StatusPill>
        }
      />

      <div className="split-content">
        <Reveal className="card" delay={0}>
          <div className="card__header">
            <div>
              <h2 className="card__title">Журнал тренировок</h2>
              <p className="card__description">
                Список занятий с информацией о загрузке групп и тренерах.
              </p>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 20 }}>
            <label htmlFor="hall-filter">Фильтр по залу</label>
            <select
              id="hall-filter"
              value={hallFilter}
              onChange={(event) => setHallFilter(event.target.value)}
            >
              <option value="all">Все залы</option>
              {halls.map((hall) => (
                <option key={hall} value={hall}>
                  {hall}
                </option>
              ))}
            </select>
          </div>

          <div className="schedule-list">
            {filteredSchedule.map((session, index) => {
              const section = sectionsById[session.sectionId]

              return (
                <Reveal key={session.id} delay={30 + index * 20}>
                  <ScheduleCard
                    session={session}
                    participantsCount={section.participantIds.length}
                    capacity={section.capacity}
                  />
                </Reveal>
              )
            })}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <ScheduleEditorCard
            key={activeSessionId}
            currentRole={currentRole}
            halls={halls}
            rescheduleSession={rescheduleSession}
            schedule={schedule}
            selectedSession={selectedSession}
            selectedSessionId={activeSessionId}
            setSelectedSessionId={setSelectedSessionId}
          />
        </Reveal>
      </div>
    </>
  )
}

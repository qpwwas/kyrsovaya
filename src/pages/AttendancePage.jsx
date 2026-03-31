import { useState } from 'react'
import { AttendanceTable } from '../components/AttendanceTable'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../context/useAppState'

export function AttendancePage() {
  const {
    attendanceRegisters,
    currentRole,
    markAttendance,
    participantsById,
  } = useAppState()
  const [selectedRegisterId, setSelectedRegisterId] = useState(
    attendanceRegisters[0]?.sessionId ?? '',
  )

  const currentRegister =
    attendanceRegisters.find((register) => register.sessionId === selectedRegisterId) ??
    attendanceRegisters[0]

  const summary = currentRegister
    ? currentRegister.marks.reduce(
        (accumulator, mark) => ({
          ...accumulator,
          [mark.status]: accumulator[mark.status] + 1,
        }),
        { present: 0, late: 0, absent: 0 },
      )
    : { present: 0, late: 0, absent: 0 }

  return (
    <>
      <PageHeader
        eyebrow="Контроль группы"
        title="Учет посещаемости спортсменов"
        description="Тренер и администратор могут отмечать присутствие, опоздания и пропуски. Родитель и спортсмен видят результаты в режиме чтения."
        action={
          <StatusPill tone={['admin', 'coach'].includes(currentRole) ? 'success' : 'warning'}>
            {['admin', 'coach'].includes(currentRole)
              ? 'Журнал доступен для редактирования'
              : 'Журнал только для просмотра'}
          </StatusPill>
        }
      />

      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Сводка по выбранной тренировке</h2>
            <p className="card__description">
              Выберите тренировку и обновите журнал посещаемости несколькими
              кликами.
            </p>
          </div>
        </div>

        <div className="form-grid form-grid--two" style={{ marginBottom: 18 }}>
          <div className="field">
            <label htmlFor="register-id">Тренировка</label>
            <select
              id="register-id"
              value={selectedRegisterId}
              onChange={(event) => setSelectedRegisterId(event.target.value)}
            >
              {attendanceRegisters.map((register) => (
                <option key={register.sessionId} value={register.sessionId}>
                  {register.sectionName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mini-stat-grid" style={{ marginBottom: 18 }}>
          <div className="mini-stat">
            <span className="mini-stat__value">{summary.present}</span>
            <span className="mini-stat__label">присутствовали</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat__value">{summary.late}</span>
            <span className="mini-stat__label">опоздали</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat__value">{summary.absent}</span>
            <span className="mini-stat__label">отсутствовали</span>
          </div>
        </div>

        {currentRegister ? (
          <AttendanceTable
            register={currentRegister}
            participantsById={participantsById}
            canManage={['admin', 'coach'].includes(currentRole)}
            onMarkAttendance={markAttendance}
          />
        ) : (
          <div className="empty-state">Журнал посещаемости пока не сформирован.</div>
        )}
      </section>

      <section className="stats-grid">
        <StatCard
          label="Журналов"
          value={attendanceRegisters.length}
          hint="подготовлены для контроля посещаемости"
        />
        <StatCard
          label="Режим"
          value={['admin', 'coach'].includes(currentRole) ? 'edit' : 'view'}
          hint="авторизация ограничивает доступ к изменениям"
        />
        <StatCard
          label="Статусы"
          value="3"
          hint="присутствовал, опоздал, отсутствовал"
        />
        <StatCard
          label="История"
          value="live"
          hint="обновляется сразу после отметки тренером"
        />
      </section>
    </>
  )
}

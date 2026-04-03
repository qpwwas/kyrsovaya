import { useState } from 'react'
import { AttendanceTable } from '../components/AttendanceTable'
import { PageHeader } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
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
  const activeRegisterId = attendanceRegisters.some(
    (register) => register.sessionId === selectedRegisterId,
  )
    ? selectedRegisterId
    : attendanceRegisters[0]?.sessionId ?? ''

  const currentRegister =
    attendanceRegisters.find((register) => register.sessionId === activeRegisterId) ??
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

  const canManage = ['admin', 'coach'].includes(currentRole)

  return (
    <>
      <PageHeader
        eyebrow="Контроль группы"
        title={
          <>
            Учет
            <span className="accent-text"> посещаемости</span>
          </>
        }
        description="Тренер и администратор могут отмечать присутствие, опоздания и пропуски. Родитель и спортсмен видят результаты в режиме чтения."
        action={
          <StatusPill tone={canManage ? 'success' : 'warning'}>
            {canManage ? 'Редактирование' : 'Только просмотр'}
          </StatusPill>
        }
      />

      <Reveal className="card" delay={0}>
        <div className="card__header">
          <div>
            <h2 className="card__title">Журнал тренировки</h2>
            <p className="card__description">
              Выберите тренировку и просмотрите или обновите посещаемость.
            </p>
          </div>
        </div>

        <div className="form-grid form-grid--two" style={{ marginBottom: 24 }}>
          <div className="field">
            <label htmlFor="register-id">Выберите тренировку</label>
            <select
              id="register-id"
              value={activeRegisterId}
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

        <div className="mini-stat-grid" style={{ marginBottom: 24 }}>
          <div className="mini-stat">
            <span className="mini-stat__value">{summary.present}</span>
            <span className="mini-stat__label">Присутствовали</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat__value">{summary.late}</span>
            <span className="mini-stat__label">Опоздали</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat__value">{summary.absent}</span>
            <span className="mini-stat__label">Отсутствовали</span>
          </div>
        </div>

        {currentRegister ? (
          <AttendanceTable
            register={currentRegister}
            participantsById={participantsById}
            canManage={canManage}
            onMarkAttendance={markAttendance}
          />
        ) : (
          <div className="empty-state">Журнал посещаемости пока не сформирован.</div>
        )}
      </Reveal>

      <Reveal className="stats-grid" delay={50}>
        <StatCard
          label="Журналов"
          value={attendanceRegisters.length}
          hint="Подготовлены для контроля"
        />
        <StatCard
          label="Режим"
          value={canManage ? 'edit' : 'view'}
          hint="Зависит от роли пользователя"
        />
        <StatCard
          label="Статусы"
          value="3"
          hint="Присутствие, опоздание, отсутствие"
        />
        <StatCard
          label="История"
          value="live"
          hint="Обновляется в реальном времени"
        />
      </Reveal>
    </>
  )
}

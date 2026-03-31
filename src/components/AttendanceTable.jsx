import { StatusPill } from './StatusPill'

const statusLabels = {
  present: 'Присутствовал',
  late: 'Опоздал',
  absent: 'Отсутствовал',
}

const statusTones = {
  present: 'success',
  late: 'warning',
  absent: 'danger',
}

export function AttendanceTable({
  register,
  participantsById,
  canManage,
  onMarkAttendance,
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Спортсмен</th>
            <th>Возраст</th>
            <th>Родитель</th>
            <th>Статус</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {register.marks.map((mark) => {
            const participant = participantsById[mark.participantId]

            return (
              <tr key={mark.participantId}>
                <td>{participant.name}</td>
                <td>{participant.age}</td>
                <td>{participant.parentName}</td>
                <td>
                  <StatusPill tone={statusTones[mark.status]}>
                    {statusLabels[mark.status]}
                  </StatusPill>
                </td>
                <td>
                  <div className="actions-row">
                    <button
                      className="button-ghost"
                      type="button"
                      onClick={() =>
                        onMarkAttendance(register.sessionId, mark.participantId, 'present')
                      }
                      disabled={!canManage}
                    >
                      Есть
                    </button>
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() =>
                        onMarkAttendance(register.sessionId, mark.participantId, 'late')
                      }
                      disabled={!canManage}
                    >
                      Опоздал
                    </button>
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() =>
                        onMarkAttendance(register.sessionId, mark.participantId, 'absent')
                      }
                      disabled={!canManage}
                    >
                      Отсутствовал
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

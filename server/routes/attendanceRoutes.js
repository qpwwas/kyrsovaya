import { Router } from 'express'
import { authenticateRequest, requireRoles } from '../middleware/auth.js'
import { listAttendance, updateAttendance } from '../services/clubService.js'

export const attendanceRouter = Router()

attendanceRouter.get('/', authenticateRequest, async (request, response) => {
  response.json({
    registers: await listAttendance(request.user),
  })
})

attendanceRouter.patch(
  '/:sessionId',
  authenticateRequest,
  requireRoles('admin', 'coach'),
  async (request, response) => {
    const registers = await updateAttendance(
      request.user,
      request.params.sessionId,
      request.body?.participantId,
      request.body?.status,
    )

    response.json({
      message: 'Посещаемость обновлена.',
      registers,
    })
  },
)

import { Router } from 'express'
import { authenticateRequest, requireRoles } from '../middleware/auth.js'
import { listAttendance, updateAttendance } from '../services/clubService.js'

export const attendanceRouter = Router()

attendanceRouter.get('/', authenticateRequest, (request, response) => {
  response.json({
    registers: listAttendance(request.user),
  })
})

attendanceRouter.patch(
  '/:sessionId',
  authenticateRequest,
  requireRoles('admin', 'coach'),
  (request, response, next) => {
    try {
      const registers = updateAttendance(
        request.user,
        request.params.sessionId,
        request.body?.participantId,
        request.body?.status,
      )

      response.json({
        message: 'Посещаемость обновлена.',
        registers,
      })
    } catch (error) {
      next(error)
    }
  },
)

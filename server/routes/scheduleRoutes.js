import { Router } from 'express'
import { authenticateRequest, requireRoles } from '../middleware/auth.js'
import { listSchedule, rescheduleTraining } from '../services/clubService.js'

export const scheduleRouter = Router()

scheduleRouter.get('/', (_request, response) => {
  response.json({
    schedule: listSchedule(),
  })
})

scheduleRouter.patch(
  '/:sessionId',
  authenticateRequest,
  requireRoles('admin', 'coach'),
  (request, response, next) => {
    try {
      const session = rescheduleTraining(request.user, request.params.sessionId, {
        dateTime: request.body?.dateTime,
        hall: request.body?.hall,
      })

      response.json({
        message: 'Расписание обновлено.',
        session,
      })
    } catch (error) {
      next(error)
    }
  },
)

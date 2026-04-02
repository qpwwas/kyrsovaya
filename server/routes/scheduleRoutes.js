import { Router } from 'express'
import { authenticateRequest, requireRoles } from '../middleware/auth.js'
import { listSchedule, rescheduleTraining } from '../services/clubService.js'

export const scheduleRouter = Router()

scheduleRouter.get('/', async (_request, response) => {
  response.json({
    schedule: await listSchedule(),
  })
})

scheduleRouter.patch(
  '/:sessionId',
  authenticateRequest,
  requireRoles('admin', 'coach'),
  async (request, response) => {
    const session = await rescheduleTraining(request.user, request.params.sessionId, {
      dateTime: request.body?.dateTime,
      hall: request.body?.hall,
    })

    response.json({
      message: 'Расписание обновлено.',
      session,
    })
  },
)

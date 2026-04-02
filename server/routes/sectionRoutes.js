import { Router } from 'express'
import { authenticateRequest, requireRoles } from '../middleware/auth.js'
import { enrollInSection, listSections } from '../services/clubService.js'

export const sectionRouter = Router()

sectionRouter.get('/', async (_request, response) => {
  response.json({
    sections: await listSections(),
  })
})

sectionRouter.post(
  '/:sectionId/enroll',
  authenticateRequest,
  requireRoles('athlete', 'parent'),
  async (request, response) => {
    const participantIds = Array.isArray(request.body?.participantIds)
      ? request.body.participantIds
      : []
    const section = await enrollInSection(
      request.user,
      request.params.sectionId,
      participantIds,
    )

    response.status(201).json({
      message: 'Запись в секцию оформлена.',
      section,
    })
  },
)

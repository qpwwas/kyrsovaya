import { Router } from 'express'
import { authenticateRequest, requireRoles } from '../middleware/auth.js'
import { enrollInSection, listSections } from '../services/clubService.js'

export const sectionRouter = Router()

sectionRouter.get('/', (_request, response) => {
  response.json({
    sections: listSections(),
  })
})

sectionRouter.post(
  '/:sectionId/enroll',
  authenticateRequest,
  requireRoles('athlete', 'parent'),
  (request, response, next) => {
    try {
      const participantIds = Array.isArray(request.body?.participantIds)
        ? request.body.participantIds
        : []
      const section = enrollInSection(
        request.user,
        request.params.sectionId,
        participantIds,
      )

      response.status(201).json({
        message: 'Запись в секцию оформлена.',
        section,
      })
    } catch (error) {
      next(error)
    }
  },
)

import { Router } from 'express'
import { authenticateRequest } from '../middleware/auth.js'
import { listParticipants } from '../services/clubService.js'

export const participantRouter = Router()

participantRouter.get('/', authenticateRequest, async (request, response) => {
  response.json({
    participants: await listParticipants(request.user),
  })
})

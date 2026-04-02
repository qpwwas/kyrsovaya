import { Router } from 'express'
import { authenticateRequest } from '../middleware/auth.js'
import { listAchievements } from '../services/clubService.js'

export const achievementRouter = Router()

achievementRouter.get('/', authenticateRequest, async (request, response) => {
  response.json({
    achievements: await listAchievements(request.user),
  })
})

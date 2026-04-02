import { Router } from 'express'
import { authenticateRequest, requireRoles } from '../middleware/auth.js'
import { getDashboardStats } from '../services/clubService.js'

export const dashboardRouter = Router()

dashboardRouter.get(
  '/stats',
  authenticateRequest,
  requireRoles('admin', 'coach'),
  (_request, response) => {
    response.json(getDashboardStats())
  },
)

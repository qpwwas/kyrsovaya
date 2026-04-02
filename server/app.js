import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/errorHandler.js'
import { achievementRouter } from './routes/achievementRoutes.js'
import { attendanceRouter } from './routes/attendanceRoutes.js'
import { authRouter } from './routes/authRoutes.js'
import { dashboardRouter } from './routes/dashboardRoutes.js'
import { participantRouter } from './routes/participantRoutes.js'
import { scheduleRouter } from './routes/scheduleRoutes.js'
import { sectionRouter } from './routes/sectionRoutes.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(currentDir, '..')
const distDir = path.join(projectRoot, 'dist')
const distIndexPath = path.join(distDir, 'index.html')

function hasBuiltFrontend() {
  return fs.existsSync(distIndexPath)
}

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ok',
      service: 'sportspace-api',
    })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/sections', sectionRouter)
  app.use('/api/schedule', scheduleRouter)
  app.use('/api/attendance', attendanceRouter)
  app.use('/api/achievements', achievementRouter)
  app.use('/api/participants', participantRouter)
  app.use('/api/dashboard', dashboardRouter)

  app.use('/api/*splat', (_request, response) => {
    response.status(404).json({
      message: 'API маршрут не найден.',
    })
  })

  if (hasBuiltFrontend()) {
    app.use(express.static(distDir))

    app.get('/{*splat}', (request, response, next) => {
      if (request.path.startsWith('/api/')) {
        next()
        return
      }

      response.sendFile(distIndexPath)
    })
  }

  app.use(errorHandler)

  return app
}

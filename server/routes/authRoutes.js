import { Router } from 'express'
import { authenticateRequest, createToken } from '../middleware/auth.js'
import { authenticateCredentials } from '../services/clubService.js'

export const authRouter = Router()

authRouter.post('/login', (request, response, next) => {
  try {
    const { email = '', password = '' } = request.body ?? {}

    if (!email.trim() || !password.trim()) {
      response.status(400).json({
        message: 'Укажите e-mail и пароль.',
      })
      return
    }

    const user = authenticateCredentials(email.trim(), password)
    const token = createToken(user)

    response.json({
      token,
      user,
    })
  } catch (error) {
    next(error)
  }
})

authRouter.get('/me', authenticateRequest, (request, response) => {
  response.json({
    user: request.user,
  })
})

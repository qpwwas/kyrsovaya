import { Router } from 'express'
import { authenticateRequest, createToken } from '../middleware/auth.js'
import {
  authenticateCredentials,
  registerUser,
  updateCurrentUser,
} from '../services/clubService.js'

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

authRouter.post('/register', (request, response, next) => {
  try {
    const user = registerUser(request.body ?? {})
    const token = createToken(user)

    response.status(201).json({
      message: 'Аккаунт успешно создан.',
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

authRouter.patch('/me', authenticateRequest, (request, response, next) => {
  try {
    const user = updateCurrentUser(request.user.id, request.body ?? {})

    response.json({
      message: 'Профиль обновлен.',
      user,
    })
  } catch (error) {
    next(error)
  }
})

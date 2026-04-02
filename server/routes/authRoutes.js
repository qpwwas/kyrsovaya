import { Router } from 'express'
import { authenticateRequest, createToken } from '../middleware/auth.js'
import {
  authenticateCredentials,
  registerUser,
  updateCurrentUser,
} from '../services/clubService.js'

export const authRouter = Router()

authRouter.post('/login', async (request, response) => {
  const { email = '', password = '' } = request.body ?? {}

  if (!email.trim() || !password.trim()) {
    response.status(400).json({
      message: 'Укажите e-mail и пароль.',
    })
    return
  }

  const user = await authenticateCredentials(email.trim(), password)
  const token = createToken(user)

  response.json({
    token,
    user,
  })
})

authRouter.post('/register', async (request, response) => {
  const user = await registerUser(request.body ?? {})
  const token = createToken(user)

  response.status(201).json({
    message: 'Аккаунт успешно создан.',
    token,
    user,
  })
})

authRouter.get('/me', authenticateRequest, (request, response) => {
  response.json({
    user: request.user,
  })
})

authRouter.patch('/me', authenticateRequest, async (request, response) => {
  const user = await updateCurrentUser(request.user.id, request.body ?? {})

  response.json({
    message: 'Профиль обновлен.',
    user,
  })
})

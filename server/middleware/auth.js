import jwt from 'jsonwebtoken'
import { getUserById } from '../services/clubService.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'sportspace-dev-secret'

function createError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '12h' },
  )
}

export function authenticateRequest(request, _response, next) {
  try {
    const authorizationHeader = request.headers.authorization ?? ''
    const token = authorizationHeader.startsWith('Bearer ')
      ? authorizationHeader.slice(7)
      : null

    if (!token) {
      throw createError(401, 'Требуется токен авторизации.')
    }

    const payload = jwt.verify(token, JWT_SECRET)
    const user = getUserById(payload.sub)

    if (!user) {
      throw createError(401, 'Пользователь для токена не найден.')
    }

    request.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(createError(401, 'Токен недействителен или истек.'))
      return
    }

    next(error)
  }
}

export function requireRoles(...roles) {
  return (request, _response, next) => {
    if (!request.user) {
      next(createError(401, 'Пользователь не авторизован.'))
      return
    }

    if (!roles.includes(request.user.role)) {
      next(createError(403, 'Недостаточно прав для выполнения этого действия.'))
      return
    }

    next()
  }
}

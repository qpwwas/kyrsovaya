import {
  initialAchievements,
  initialAttendanceRegisters,
  initialParticipants,
  initialProfiles,
  initialSchedule,
  initialSections,
} from '../data/mockData.js'

const STATE_STORAGE_KEY = 'sportspace.mock.state'
const TOKEN_STORAGE_KEY = 'sportspace.mock.tokens'

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms))

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function getPositionByRole(role) {
  if (role === 'admin') {
    return 'Администратор'
  }

  if (role === 'coach') {
    return 'Тренер'
  }

  if (role === 'parent') {
    return 'Родитель'
  }

  return 'Спортсмен'
}

function createInitialUsers() {
  return Object.entries(initialProfiles).reduce((accumulator, [role, profile]) => {
    accumulator[`user-${role}`] = {
      id: `user-${role}`,
      email: profile.email.toLowerCase(),
      fullName: profile.fullName,
      role,
      phone: profile.phone,
      emergencyContact: profile.emergencyContact,
      note: profile.note,
      position: profile.position,
      password: profile.password,
      athleteId: profile.athleteId ?? null,
      managedAthletes: clone(profile.managedAthletes ?? []),
    }

    return accumulator
  }, {})
}

function createInitialState() {
  return {
    sections: clone(initialSections),
    schedule: clone(initialSchedule),
    participants: clone(initialParticipants),
    attendanceRegisters: clone(initialAttendanceRegisters),
    achievements: clone(initialAchievements),
    users: createInitialUsers(),
  }
}

function readFromStorage(key, fallbackValue) {
  if (!isBrowser()) {
    return clone(fallbackValue)
  }

  try {
    const rawValue = window.localStorage.getItem(key)

    if (!rawValue) {
      return clone(fallbackValue)
    }

    return JSON.parse(rawValue)
  } catch {
    return clone(fallbackValue)
  }
}

function writeToStorage(key, value) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

let mockState = readFromStorage(STATE_STORAGE_KEY, createInitialState())
let tokenRegistry = readFromStorage(TOKEN_STORAGE_KEY, {})

function persistState() {
  writeToStorage(STATE_STORAGE_KEY, mockState)
}

function persistTokens() {
  writeToStorage(TOKEN_STORAGE_KEY, tokenRegistry)
}

function createTokenForUser(userId) {
  const token = `mock-token-${userId}-${Date.now()}`
  tokenRegistry[token] = userId
  persistTokens()
  return token
}

function createError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function serializeUser(user) {
  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone,
    emergencyContact: user.emergencyContact,
    note: user.note,
    position: user.position,
    ...(user.athleteId ? { athleteId: user.athleteId } : {}),
    ...(user.managedAthletes?.length ? { managedAthletes: clone(user.managedAthletes) } : {}),
  }
}

function resolveUserByToken(token) {
  const mappedUserId = tokenRegistry[token]

  if (mappedUserId && mockState.users[mappedUserId]) {
    return mockState.users[mappedUserId]
  }

  const legacyMatch = token?.match(/mock-token-(admin|coach|athlete|parent)-/)

  if (legacyMatch) {
    return mockState.users[`user-${legacyMatch[1]}`] ?? null
  }

  return null
}

function findParticipant(participantId) {
  return mockState.participants.find((participant) => participant.id === participantId)
}

function buildAttendanceRegisters() {
  return mockState.attendanceRegisters.map((register) => ({
    ...clone(register),
    marks: register.marks.map((mark) => ({
      ...mark,
      participantName: findParticipant(mark.participantId)?.name ?? 'Неизвестный спортсмен',
    })),
  }))
}

function buildAchievements() {
  return mockState.achievements.map((achievement) => ({
    ...clone(achievement),
    participantName: findParticipant(achievement.participantId)?.name ?? 'Неизвестный спортсмен',
  }))
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function ensureUniqueEmail(email, excludedUserId = '') {
  const normalizedEmail = normalizeEmail(email)
  const hasDuplicate = Object.values(mockState.users).some(
    (user) => user.id !== excludedUserId && user.email === normalizedEmail,
  )

  if (hasDuplicate) {
    throw createError('Пользователь с таким e-mail уже зарегистрирован.', 409)
  }
}

function createParticipantFromPayload(payload, role) {
  const participantId = `ath-${Date.now().toString().slice(-6)}`

  const participant =
    role === 'parent'
      ? {
          id: participantId,
          name: payload.childName.trim(),
          age: Number(payload.childAge) || 0,
          level: payload.childLevel.trim() || 'Начальный',
          parentName: payload.fullName.trim(),
          sectionIds: [],
          focus: payload.childFocus.trim() || 'Общая спортивная подготовка',
        }
      : {
          id: participantId,
          name: payload.fullName.trim(),
          age: Number(payload.athleteAge) || 0,
          level: payload.athleteLevel.trim() || 'Начальный',
          parentName: payload.parentName.trim(),
          sectionIds: [],
          focus: payload.athleteFocus.trim() || 'Общая спортивная подготовка',
        }

  mockState.participants.push(participant)
  return participant
}

export async function login(credentials) {
  await delay()

  const email = normalizeEmail(credentials.email)
  const password = credentials.password.trim()
  const user = Object.values(mockState.users).find(
    (profile) => profile.email === email && profile.password === password,
  )

  if (!user) {
    throw createError('Неверный e-mail или пароль.', 401)
  }

  const token = createTokenForUser(user.id)

  return {
    token,
    user: serializeUser(user),
  }
}

export async function registerAccount(payload) {
  await delay()

  const email = normalizeEmail(payload.email)
  ensureUniqueEmail(email)

  const role = payload.role
  const userId = `user-${Date.now()}`
  const participant =
    role === 'athlete' || role === 'parent' ? createParticipantFromPayload(payload, role) : null

  const user = {
    id: userId,
    email,
    fullName: payload.fullName.trim(),
    role,
    phone: payload.phone?.trim() ?? '',
    emergencyContact: payload.emergencyContact?.trim() ?? '',
    note: payload.note?.trim() ?? '',
    position: getPositionByRole(role),
    password: payload.password,
    athleteId: role === 'athlete' ? participant?.id ?? null : null,
    managedAthletes: role === 'parent' && participant ? [participant.id] : [],
  }

  mockState.users[userId] = user
  persistState()

  const token = createTokenForUser(userId)

  return {
    token,
    user: serializeUser(user),
  }
}

export async function getCurrentUser(token) {
  await delay()

  const user = resolveUserByToken(token)

  if (!user) {
    throw createError('Токен недействителен.', 401)
  }

  return { user: serializeUser(user) }
}

export async function updateCurrentUser(token, payload) {
  await delay()

  const user = resolveUserByToken(token)

  if (!user) {
    throw createError('Сессия истекла.', 401)
  }

  const nextEmail = payload.email ? normalizeEmail(payload.email) : user.email
  ensureUniqueEmail(nextEmail, user.id)

  user.fullName = payload.fullName?.trim() ?? user.fullName
  user.email = nextEmail
  user.phone = payload.phone?.trim() ?? user.phone
  user.emergencyContact = payload.emergencyContact?.trim() ?? user.emergencyContact
  user.note = payload.note?.trim() ?? user.note

  persistState()

  return { user: serializeUser(user) }
}

export async function getSections() {
  await delay()
  return { sections: clone(mockState.sections) }
}

export async function enrollSection(token, sectionId, participantIds = []) {
  await delay()

  if (!resolveUserByToken(token)) {
    throw createError('Сессия истекла.', 401)
  }

  const section = mockState.sections.find((item) => item.id === sectionId)

  if (!section) {
    throw createError('Секция не найдена.', 404)
  }

  participantIds.forEach((participantId) => {
    if (section.participantIds.includes(participantId)) {
      return
    }

    if (section.participantIds.length >= section.capacity) {
      return
    }

    section.participantIds.push(participantId)
    const participant = findParticipant(participantId)

    if (participant && !participant.sectionIds.includes(sectionId)) {
      participant.sectionIds.push(sectionId)
    }
  })

  persistState()

  return {
    success: true,
    section: clone(section),
  }
}

export async function getSchedule() {
  await delay()
  return { schedule: clone(mockState.schedule) }
}

export async function updateScheduleSession(token, sessionId, payload) {
  await delay()

  if (!resolveUserByToken(token)) {
    throw createError('Сессия истекла.', 401)
  }

  const session = mockState.schedule.find((item) => item.id === sessionId)

  if (!session) {
    throw createError('Тренировка не найдена.', 404)
  }

  if (payload.dateTime) {
    session.dateTime = payload.dateTime
  }

  if (payload.hall) {
    session.hall = payload.hall
  }

  persistState()

  return { session: clone(session) }
}

export async function getParticipants(token) {
  await delay()

  if (!resolveUserByToken(token)) {
    throw createError('Сессия истекла.', 401)
  }

  return { participants: clone(mockState.participants) }
}

export async function getAttendance(token) {
  await delay()

  if (!resolveUserByToken(token)) {
    throw createError('Сессия истекла.', 401)
  }

  return { registers: buildAttendanceRegisters() }
}

export async function updateAttendanceMark(token, sessionId, payload) {
  await delay()

  if (!resolveUserByToken(token)) {
    throw createError('Сессия истекла.', 401)
  }

  const session = mockState.schedule.find((item) => item.id === sessionId)

  if (!session) {
    throw createError('Тренировка не найдена.', 404)
  }

  let register = mockState.attendanceRegisters.find((item) => item.sessionId === sessionId)

  if (!register) {
    register = {
      sessionId,
      sectionId: session.sectionId,
      sectionName: session.sectionName,
      marks: [],
    }
    mockState.attendanceRegisters.push(register)
  }

  const existingMark = register.marks.find(
    (mark) => mark.participantId === payload.participantId,
  )

  if (existingMark) {
    existingMark.status = payload.status
  } else {
    register.marks.push({
      participantId: payload.participantId,
      status: payload.status,
    })
  }

  persistState()

  return { registers: buildAttendanceRegisters() }
}

export async function getAchievements(token) {
  await delay()

  if (!resolveUserByToken(token)) {
    throw createError('Сессия истекла.', 401)
  }

  return { achievements: buildAchievements() }
}

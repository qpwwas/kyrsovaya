import bcrypt from 'bcryptjs'
import {
  Achievement,
  Attendance,
  Participant,
  Schedule,
  Section,
  User,
} from '../db/models.js'

function createError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function requireText(value, minLength, message) {
  const normalizedValue = normalizeText(value)

  if (normalizedValue.length < minLength) {
    throw createError(400, message)
  }

  return normalizedValue
}

function parseAge(value, message) {
  const age = Number.parseInt(value, 10)

  if (!Number.isInteger(age) || age < 5 || age > 25) {
    throw createError(400, message)
  }

  return age
}

async function ensureEmailAvailable(email) {
  const existingUser = await User.exists({ email })

  if (existingUser) {
    throw createError(409, 'Пользователь с таким e-mail уже зарегистрирован.')
  }
}

async function getNextParticipantId() {
  const [lastParticipant] = await Participant.aggregate([
    {
      $match: {
        _id: /^ath-\d+$/,
      },
    },
    {
      $addFields: {
        numericId: {
          $toInt: {
            $arrayElemAt: [{ $split: ['$_id', '-'] }, 1],
          },
        },
      },
    },
    {
      $sort: {
        numericId: -1,
      },
    },
    {
      $limit: 1,
    },
  ])

  const lastNumber = lastParticipant?.numericId ?? 0
  return `ath-${String(lastNumber + 1).padStart(2, '0')}`
}

function mapParticipant(row) {
  if (!row) {
    return null
  }

  return {
    id: row._id,
    name: row.name,
    age: row.age,
    level: row.level,
    parentName: row.parentName,
    focus: row.focus,
    sectionIds: row.sectionIds ?? [],
  }
}

function mapUser(row) {
  if (!row) {
    return null
  }

  return {
    id: String(row._id),
    role: row.role,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    emergencyContact: row.emergencyContact,
    note: row.note,
    position: row.position,
    athleteId: row.athleteId ?? null,
    managedAthletes: row.role === 'parent' ? row.managedAthletes ?? [] : [],
  }
}

function mapSection(row) {
  const participantIds = row.participantIds ?? []

  return {
    id: row._id,
    name: row.name,
    description: row.description,
    coach: row.coach,
    hall: row.hall,
    ageGroup: row.ageGroup,
    level: row.level,
    tags: row.tags ?? [],
    capacity: row.capacity,
    scheduleSummary: row.scheduleSummary,
    statusLabel: row.statusLabel,
    statusTone: row.statusTone,
    participantsCount: participantIds.length,
    participantIds,
  }
}

function mapSchedule(row, section) {
  const participantIds = section?.participantIds ?? []

  return {
    id: row._id,
    sectionId: row.sectionId,
    sectionName: row.sectionName,
    coach: row.coach,
    hall: row.hall,
    dateTime: row.dateTime,
    format: row.format,
    note: row.note,
    statusLabel: row.statusLabel,
    statusTone: row.statusTone,
    participantsCount: participantIds.length,
    capacity: section?.capacity ?? 0,
  }
}

function getAllowedParticipantIds(user) {
  if (user.role === 'athlete' && user.athleteId) {
    return [user.athleteId]
  }

  if (user.role === 'parent') {
    return user.managedAthletes ?? []
  }

  return []
}

export async function getUserById(userId) {
  const row = await User.findById(userId).lean()
  return mapUser(row)
}

export async function registerUser(payload) {
  const role = normalizeText(payload.role)
  const fullName = requireText(payload.fullName, 3, 'Укажите ФИО пользователя.')
  const email = normalizeEmail(payload.email)
  const phone = requireText(payload.phone, 6, 'Укажите контактный телефон.')
  const emergencyContact = requireText(
    payload.emergencyContact,
    3,
    'Заполните поле экстренной связи.',
  )
  const note = normalizeText(payload.note)
  const password = normalizeText(payload.password)

  if (!['athlete', 'parent'].includes(role)) {
    throw createError(
      400,
      'Самостоятельная регистрация доступна только спортсмену или родителю.',
    )
  }

  if (!isValidEmail(email)) {
    throw createError(400, 'Укажите корректный e-mail.')
  }

  if (password.length < 6) {
    throw createError(400, 'Пароль должен содержать не менее 6 символов.')
  }

  await ensureEmailAvailable(email)

  const passwordHash = bcrypt.hashSync(password, 10)

  if (role === 'athlete') {
    const parentName = requireText(
      payload.parentName,
      3,
      'Укажите имя родителя или законного представителя.',
    )
    const athleteAge = parseAge(
      payload.athleteAge,
      'Возраст спортсмена должен быть числом от 5 до 25.',
    )
    const athleteLevel = requireText(
      payload.athleteLevel,
      2,
      'Укажите уровень подготовки спортсмена.',
    )
    const athleteFocus = requireText(
      payload.athleteFocus,
      3,
      'Укажите спортивное направление или цель.',
    )
    const participantId = await getNextParticipantId()

    await Participant.create({
      _id: participantId,
      name: fullName,
      age: athleteAge,
      level: athleteLevel,
      parentName,
      focus: athleteFocus,
      sectionIds: [],
    })

    const user = await User.create({
      role,
      fullName,
      email,
      phone,
      emergencyContact,
      note,
      position: 'Спортсмен',
      passwordHash,
      athleteId: participantId,
      managedAthletes: [],
    })

    return mapUser(user.toObject())
  }

  const childName = requireText(payload.childName, 3, 'Укажите имя ребенка.')
  const childAge = parseAge(
    payload.childAge,
    'Возраст ребенка должен быть числом от 5 до 25.',
  )
  const childLevel = requireText(
    payload.childLevel,
    2,
    'Укажите уровень подготовки ребенка.',
  )
  const childFocus = requireText(
    payload.childFocus,
    3,
    'Укажите направление подготовки ребенка.',
  )
  const participantId = await getNextParticipantId()

  await Participant.create({
    _id: participantId,
    name: childName,
    age: childAge,
    level: childLevel,
    parentName: fullName,
    focus: childFocus,
    sectionIds: [],
  })

  const user = await User.create({
    role,
    fullName,
    email,
    phone,
    emergencyContact,
    note,
    position: 'Родитель',
    passwordHash,
    athleteId: null,
    managedAthletes: [participantId],
  })

  return mapUser(user.toObject())
}

export async function updateCurrentUser(userId, payload) {
  const fullName = normalizeText(payload.fullName)
  const phone = normalizeText(payload.phone)
  const emergencyContact = normalizeText(payload.emergencyContact)
  const note = normalizeText(payload.note)

  if (fullName.length < 3) {
    throw createError(400, 'ФИО должно содержать не менее 3 символов.')
  }

  if (!phone) {
    throw createError(400, 'Укажите контактный номер телефона.')
  }

  if (!emergencyContact) {
    throw createError(400, 'Заполните поле для экстренной связи.')
  }

  const row = await User.findByIdAndUpdate(
    userId,
    {
      fullName,
      phone,
      emergencyContact,
      note,
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean()

  if (!row) {
    throw createError(404, 'Пользователь не найден.')
  }

  return mapUser(row)
}

export async function authenticateCredentials(email, password) {
  const row = await User.findOne({ email: normalizeEmail(email) }).lean()

  if (!row) {
    throw createError(401, 'Такого пользователя не существует.')
  }

  const passwordMatches = bcrypt.compareSync(password, row.passwordHash)

  if (!passwordMatches) {
    throw createError(401, 'Неверный пароль.')
  }

  return mapUser(row)
}

export async function listSections() {
  const rows = await Section.find().sort({ name: 1 }).lean()
  return rows.map(mapSection)
}

export async function listParticipants(user) {
  if (user.role === 'athlete' && user.athleteId) {
    const row = await Participant.findById(user.athleteId).lean()
    return row ? [mapParticipant(row)] : []
  }

  if (user.role === 'athlete') {
    return []
  }

  if (user.role === 'parent') {
    if (!user.managedAthletes?.length) {
      return []
    }

    const rows = await Participant.find({
      _id: { $in: user.managedAthletes },
    })
      .sort({ name: 1 })
      .lean()

    return rows.map(mapParticipant)
  }

  const rows = await Participant.find().sort({ name: 1 }).lean()
  return rows.map(mapParticipant)
}

export async function enrollInSection(user, sectionId, requestedParticipantIds = []) {
  const section = await Section.findById(sectionId).lean()

  if (!section) {
    throw createError(404, 'Секция не найдена.')
  }

  const allowedParticipantIds = getAllowedParticipantIds(user)

  if (!allowedParticipantIds.length) {
    throw createError(
      403,
      'Запись в секцию доступна только спортсмену или родителю с привязанным ребенком.',
    )
  }

  const participantIds =
    requestedParticipantIds.length > 0 ? requestedParticipantIds : allowedParticipantIds

  const invalidRequest = participantIds.some(
    (participantId) => !allowedParticipantIds.includes(participantId),
  )

  if (invalidRequest) {
    throw createError(
      403,
      'Нельзя записать участника, который не относится к текущему профилю.',
    )
  }

  const existingParticipants = await Participant.find({
    _id: { $in: participantIds },
  })
    .select('_id')
    .lean()

  if (existingParticipants.length !== participantIds.length) {
    throw createError(404, 'Один из выбранных спортсменов не найден.')
  }

  const missingIds = participantIds.filter(
    (participantId) => !(section.participantIds ?? []).includes(participantId),
  )

  if (!missingIds.length) {
    throw createError(409, 'Указанный спортсмен уже состоит в этой секции.')
  }

  const availableSlots = section.capacity - (section.participantIds?.length ?? 0)

  if (availableSlots <= 0) {
    throw createError(409, 'В секции нет свободных мест.')
  }

  const idsToInsert = missingIds.slice(0, availableSlots)

  await Section.updateOne(
    { _id: sectionId },
    { $addToSet: { participantIds: { $each: idsToInsert } } },
  )

  await Participant.updateMany(
    { _id: { $in: idsToInsert } },
    { $addToSet: { sectionIds: sectionId } },
  )

  const updatedSection = await Section.findById(sectionId).lean()
  return mapSection(updatedSection)
}

export async function listSchedule() {
  const [scheduleRows, sections] = await Promise.all([
    Schedule.find().sort({ dateTime: 1 }).lean(),
    Section.find().select('_id capacity participantIds').lean(),
  ])

  const sectionMap = new Map(sections.map((section) => [section._id, section]))

  return scheduleRows.map((row) => mapSchedule(row, sectionMap.get(row.sectionId)))
}

export async function rescheduleTraining(user, sessionId, payload) {
  if (!['admin', 'coach'].includes(user.role)) {
    throw createError(
      403,
      'Изменение расписания доступно только администратору и тренеру.',
    )
  }

  if (!payload.dateTime || !payload.hall) {
    throw createError(400, 'Необходимо указать дату, время и зал.')
  }

  const session = await Schedule.findById(sessionId).lean()

  if (!session) {
    throw createError(404, 'Тренировка не найдена.')
  }

  const conflict = await Schedule.findOne({
    _id: { $ne: sessionId },
    dateTime: payload.dateTime,
    $or: [{ hall: payload.hall }, { coach: session.coach }],
  }).lean()

  if (conflict) {
    throw createError(
      409,
      `Конфликт расписания: ${conflict.sectionName} уже использует выбранный слот.`,
    )
  }

  await Schedule.updateOne(
    { _id: sessionId },
    {
      dateTime: payload.dateTime,
      hall: payload.hall,
      statusLabel: 'Обновлено',
      statusTone: 'warning',
      note: `Расписание обновлено. Новый слот: ${payload.dateTime}.`,
    },
  )

  const [updatedSession, section] = await Promise.all([
    Schedule.findById(sessionId).lean(),
    Section.findById(session.sectionId).select('_id capacity participantIds').lean(),
  ])

  return mapSchedule(updatedSession, section)
}

export async function listAttendance(user) {
  let attendanceFilter = {}

  if (user.role === 'athlete' && user.athleteId) {
    attendanceFilter = { participantId: user.athleteId }
  } else if (user.role === 'athlete') {
    return []
  } else if (user.role === 'parent' && user.managedAthletes?.length) {
    attendanceFilter = { participantId: { $in: user.managedAthletes } }
  } else if (user.role === 'parent') {
    return []
  }

  const attendanceRows = await Attendance.find(attendanceFilter).lean()

  if (!attendanceRows.length) {
    return []
  }

  const sessionIds = [...new Set(attendanceRows.map((row) => row.sessionId))]
  const participantIds = [...new Set(attendanceRows.map((row) => row.participantId))]

  const [scheduleRows, participantRows] = await Promise.all([
    Schedule.find({ _id: { $in: sessionIds } }).lean(),
    Participant.find({ _id: { $in: participantIds } }).lean(),
  ])

  const scheduleMap = new Map(scheduleRows.map((row) => [row._id, row]))
  const participantMap = new Map(participantRows.map((row) => [row._id, row]))

  const sortedRows = [...attendanceRows].sort((left, right) => {
    const leftSchedule = scheduleMap.get(left.sessionId)
    const rightSchedule = scheduleMap.get(right.sessionId)
    const leftParticipant = participantMap.get(left.participantId)
    const rightParticipant = participantMap.get(right.participantId)

    const byDate =
      new Date(leftSchedule?.dateTime ?? 0).getTime() -
      new Date(rightSchedule?.dateTime ?? 0).getTime()

    if (byDate !== 0) {
      return byDate
    }

    return (leftParticipant?.name ?? '').localeCompare(
      rightParticipant?.name ?? '',
      'ru',
    )
  })

  const registerMap = new Map()

  for (const row of sortedRows) {
    const schedule = scheduleMap.get(row.sessionId)
    const participant = participantMap.get(row.participantId)

    if (!schedule || !participant) {
      continue
    }

    if (!registerMap.has(row.sessionId)) {
      registerMap.set(row.sessionId, {
        sessionId: row.sessionId,
        sectionId: schedule.sectionId,
        sectionName: schedule.sectionName,
        dateTime: schedule.dateTime,
        marks: [],
      })
    }

    registerMap.get(row.sessionId).marks.push({
      participantId: row.participantId,
      status: row.status,
      participantName: participant.name,
      age: participant.age,
      parentName: participant.parentName,
    })
  }

  return Array.from(registerMap.values())
}

export async function updateAttendance(user, sessionId, participantId, status) {
  if (!['admin', 'coach'].includes(user.role)) {
    throw createError(
      403,
      'Изменять посещаемость могут только администратор и тренер.',
    )
  }

  if (!['present', 'late', 'absent'].includes(status)) {
    throw createError(400, 'Недопустимый статус посещаемости.')
  }

  const [sessionExists, participantExists] = await Promise.all([
    Schedule.exists({ _id: sessionId }),
    Participant.exists({ _id: participantId }),
  ])

  if (!sessionExists) {
    throw createError(404, 'Тренировка для журнала не найдена.')
  }

  if (!participantExists) {
    throw createError(404, 'Спортсмен не найден.')
  }

  await Attendance.findOneAndUpdate(
    { sessionId, participantId },
    { status },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  )

  return listAttendance(user)
}

export async function listAchievements(user) {
  let achievementFilter = {}

  if (user.role === 'athlete' && user.athleteId) {
    achievementFilter = { participantId: user.athleteId }
  } else if (user.role === 'athlete') {
    return []
  } else if (user.role === 'parent' && user.managedAthletes?.length) {
    achievementFilter = { participantId: { $in: user.managedAthletes } }
  } else if (user.role === 'parent') {
    return []
  }

  const rows = await Achievement.find(achievementFilter).sort({ _id: 1 }).lean()

  if (!rows.length) {
    return []
  }

  const participantIds = [...new Set(rows.map((row) => row.participantId))]
  const participantRows = await Participant.find({
    _id: { $in: participantIds },
  }).lean()

  const participantMap = new Map(participantRows.map((row) => [row._id, row]))

  return rows
    .map((row) => {
      const participant = participantMap.get(row.participantId)

      if (!participant) {
        return null
      }

      return {
        id: row._id,
        participantId: row.participantId,
        title: row.title,
        details: row.details,
        participantName: participant.name,
        level: participant.level,
        focus: participant.focus,
      }
    })
    .filter(Boolean)
    .sort((left, right) => {
      const byName = left.participantName.localeCompare(right.participantName, 'ru')

      if (byName !== 0) {
        return byName
      }

      return left.id.localeCompare(right.id, 'ru')
    })
}

export async function getDashboardStats() {
  const todayKey = new Date().toISOString().slice(0, 10)
  const todayPattern = new RegExp(`^${todayKey}`)

  const [sections, participantCount, todaySessions] = await Promise.all([
    Section.find().sort({ name: 1 }).lean(),
    Participant.countDocuments(),
    Schedule.find({ dateTime: { $regex: todayPattern } })
      .sort({ dateTime: 1 })
      .lean(),
  ])

  const coachLoadMap = sections.reduce((accumulator, section) => {
    return {
      ...accumulator,
      [section.coach]: (accumulator[section.coach] ?? 0) + 1,
    }
  }, {})

  return {
    stats: {
      sectionCount: sections.length,
      coachCount: new Set(sections.map((section) => section.coach)).size,
      participantCount,
      trainingsToday: todaySessions.length,
    },
    todaySessions: todaySessions.map((row) => ({
      id: row._id,
      sectionName: row.sectionName,
      coach: row.coach,
      hall: row.hall,
      dateTime: row.dateTime,
    })),
    coachLoad: Object.entries(coachLoadMap)
      .sort(([leftCoach], [rightCoach]) => leftCoach.localeCompare(rightCoach, 'ru'))
      .map(([coach, sectionsCount]) => ({
        coach,
        sectionsCount,
      })),
  }
}

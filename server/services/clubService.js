import bcrypt from 'bcryptjs'
import { db } from '../db/client.js'

function createError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function parseCsvList(csvValue) {
  return csvValue ? csvValue.split(',').filter(Boolean) : []
}

function parseTags(tagsJson) {
  try {
    return JSON.parse(tagsJson)
  } catch {
    return []
  }
}

function getManagedAthletes(userId) {
  return db
    .prepare(
      'SELECT participant_id FROM parent_children WHERE user_id = ? ORDER BY participant_id',
    )
    .all(userId)
    .map((row) => row.participant_id)
}

function mapUser(row) {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    emergencyContact: row.emergency_contact,
    note: row.note,
    position: row.position,
    athleteId: row.athlete_id ?? null,
    managedAthletes: row.role === 'parent' ? getManagedAthletes(row.id) : [],
  }
}

function mapSection(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    coach: row.coach,
    hall: row.hall,
    ageGroup: row.age_group,
    level: row.level,
    tags: parseTags(row.tags_json),
    capacity: row.capacity,
    scheduleSummary: row.schedule_summary,
    statusLabel: row.status_label,
    statusTone: row.status_tone,
    participantsCount: row.participants_count,
    participantIds: parseCsvList(row.participant_ids),
  }
}

function mapSchedule(row) {
  return {
    id: row.id,
    sectionId: row.section_id,
    sectionName: row.section_name,
    coach: row.coach,
    hall: row.hall,
    dateTime: row.date_time,
    format: row.format,
    note: row.note,
    statusLabel: row.status_label,
    statusTone: row.status_tone,
    participantsCount: row.participants_count,
    capacity: row.capacity,
  }
}

function getAllowedParticipantIds(user) {
  if (user.role === 'athlete' && user.athleteId) {
    return [user.athleteId]
  }

  if (user.role === 'parent') {
    return user.managedAthletes
  }

  return []
}

export function getUserById(userId) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  return mapUser(row)
}

export function authenticateCredentials(email, password) {
  const row = db
    .prepare('SELECT * FROM users WHERE lower(email) = lower(?)')
    .get(email)

  if (!row) {
    throw createError(401, 'Такого пользователя не существует.')
  }

  const passwordMatches = bcrypt.compareSync(password, row.password_hash)

  if (!passwordMatches) {
    throw createError(401, 'Неверный пароль.')
  }

  return mapUser(row)
}

export function listSections() {
  const rows = db
    .prepare(`
      SELECT
        s.*,
        COUNT(sp.participant_id) AS participants_count,
        GROUP_CONCAT(sp.participant_id) AS participant_ids
      FROM sections s
      LEFT JOIN section_participants sp ON sp.section_id = s.id
      GROUP BY s.id
      ORDER BY s.name
    `)
    .all()

  return rows.map(mapSection)
}

export function enrollInSection(user, sectionId, requestedParticipantIds = []) {
  const section = listSections().find((item) => item.id === sectionId)

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
    throw createError(403, 'Нельзя записать участника, который не относится к текущему профилю.')
  }

  const missingIds = participantIds.filter(
    (participantId) => !section.participantIds.includes(participantId),
  )

  if (!missingIds.length) {
    throw createError(409, 'Указанный спортсмен уже состоит в этой секции.')
  }

  const availableSlots = section.capacity - section.participantsCount

  if (availableSlots <= 0) {
    throw createError(409, 'В секции нет свободных мест.')
  }

  const idsToInsert = missingIds.slice(0, availableSlots)

  const insertEnrollment = db.prepare(`
    INSERT INTO section_participants (section_id, participant_id)
    VALUES (?, ?)
  `)

  const transaction = db.transaction(() => {
    for (const participantId of idsToInsert) {
      insertEnrollment.run(sectionId, participantId)
    }
  })

  transaction()

  return listSections().find((item) => item.id === sectionId)
}

export function listSchedule() {
  const rows = db
    .prepare(`
      SELECT
        sch.*,
        sec.capacity AS capacity,
        COUNT(sp.participant_id) AS participants_count
      FROM schedule sch
      JOIN sections sec ON sec.id = sch.section_id
      LEFT JOIN section_participants sp ON sp.section_id = sec.id
      GROUP BY sch.id
      ORDER BY sch.date_time
    `)
    .all()

  return rows.map(mapSchedule)
}

export function rescheduleTraining(user, sessionId, payload) {
  if (!['admin', 'coach'].includes(user.role)) {
    throw createError(403, 'Изменение расписания доступно только администратору и тренеру.')
  }

  if (!payload.dateTime || !payload.hall) {
    throw createError(400, 'Необходимо указать дату, время и зал.')
  }

  const session = db.prepare('SELECT * FROM schedule WHERE id = ?').get(sessionId)

  if (!session) {
    throw createError(404, 'Тренировка не найдена.')
  }

  const conflict = db
    .prepare(`
      SELECT * FROM schedule
      WHERE id <> ?
        AND date_time = ?
        AND (hall = ? OR coach = ?)
      LIMIT 1
    `)
    .get(sessionId, payload.dateTime, payload.hall, session.coach)

  if (conflict) {
    throw createError(
      409,
      `Конфликт расписания: ${conflict.section_name} уже использует выбранный слот.`,
    )
  }

  db.prepare(`
    UPDATE schedule
    SET date_time = ?,
        hall = ?,
        status_label = ?,
        status_tone = ?,
        note = ?
    WHERE id = ?
  `).run(
    payload.dateTime,
    payload.hall,
    'Обновлено',
    'warning',
    `Расписание обновлено. Новый слот: ${payload.dateTime}.`,
    sessionId,
  )

  return listSchedule().find((item) => item.id === sessionId)
}

export function listAttendance(user) {
  const baseQuery = `
    SELECT
      att.session_id,
      sch.section_id,
      sch.section_name,
      sch.date_time,
      att.participant_id,
      att.status,
      p.name AS participant_name,
      p.age,
      p.parent_name
    FROM attendance att
    JOIN schedule sch ON sch.id = att.session_id
    JOIN participants p ON p.id = att.participant_id
  `

  let rows = []

  if (user.role === 'athlete' && user.athleteId) {
    rows = db
      .prepare(`${baseQuery} WHERE att.participant_id = ? ORDER BY sch.date_time, p.name`)
      .all(user.athleteId)
  } else if (user.role === 'parent' && user.managedAthletes.length) {
    const placeholders = user.managedAthletes.map(() => '?').join(', ')
    rows = db
      .prepare(
        `${baseQuery} WHERE att.participant_id IN (${placeholders}) ORDER BY sch.date_time, p.name`,
      )
      .all(...user.managedAthletes)
  } else {
    rows = db.prepare(`${baseQuery} ORDER BY sch.date_time, p.name`).all()
  }

  const registerMap = new Map()

  for (const row of rows) {
    if (!registerMap.has(row.session_id)) {
      registerMap.set(row.session_id, {
        sessionId: row.session_id,
        sectionId: row.section_id,
        sectionName: row.section_name,
        dateTime: row.date_time,
        marks: [],
      })
    }

    registerMap.get(row.session_id).marks.push({
      participantId: row.participant_id,
      status: row.status,
      participantName: row.participant_name,
      age: row.age,
      parentName: row.parent_name,
    })
  }

  return Array.from(registerMap.values())
}

export function updateAttendance(user, sessionId, participantId, status) {
  if (!['admin', 'coach'].includes(user.role)) {
    throw createError(403, 'Изменять посещаемость могут только администратор и тренер.')
  }

  if (!['present', 'late', 'absent'].includes(status)) {
    throw createError(400, 'Недопустимый статус посещаемости.')
  }

  const sessionExists = db.prepare('SELECT id FROM schedule WHERE id = ?').get(sessionId)

  if (!sessionExists) {
    throw createError(404, 'Тренировка для журнала не найдена.')
  }

  const participantExists = db
    .prepare('SELECT id FROM participants WHERE id = ?')
    .get(participantId)

  if (!participantExists) {
    throw createError(404, 'Спортсмен не найден.')
  }

  db.prepare(`
    INSERT INTO attendance (session_id, participant_id, status)
    VALUES (?, ?, ?)
    ON CONFLICT(session_id, participant_id)
    DO UPDATE SET status = excluded.status
  `).run(sessionId, participantId, status)

  return listAttendance(user)
}

export function listAchievements(user) {
  const baseQuery = `
    SELECT
      ach.id,
      ach.participant_id,
      ach.title,
      ach.details,
      p.name AS participant_name,
      p.level,
      p.focus
    FROM achievements ach
    JOIN participants p ON p.id = ach.participant_id
  `

  let rows = []

  if (user.role === 'athlete' && user.athleteId) {
    rows = db
      .prepare(`${baseQuery} WHERE ach.participant_id = ? ORDER BY p.name, ach.id`)
      .all(user.athleteId)
  } else if (user.role === 'parent' && user.managedAthletes.length) {
    const placeholders = user.managedAthletes.map(() => '?').join(', ')
    rows = db
      .prepare(
        `${baseQuery} WHERE ach.participant_id IN (${placeholders}) ORDER BY p.name, ach.id`,
      )
      .all(...user.managedAthletes)
  } else {
    rows = db.prepare(`${baseQuery} ORDER BY p.name, ach.id`).all()
  }

  return rows.map((row) => ({
    id: row.id,
    participantId: row.participant_id,
    title: row.title,
    details: row.details,
    participantName: row.participant_name,
    level: row.level,
    focus: row.focus,
  }))
}

export function getDashboardStats() {
  const todayKey = new Date().toISOString().slice(0, 10)
  const sectionCount = db.prepare('SELECT COUNT(*) AS count FROM sections').get().count
  const coachCount = db
    .prepare('SELECT COUNT(DISTINCT coach) AS count FROM sections')
    .get().count
  const participantCount = db
    .prepare('SELECT COUNT(*) AS count FROM participants')
    .get().count
  const trainingsToday = db
    .prepare('SELECT COUNT(*) AS count FROM schedule WHERE substr(date_time, 1, 10) = ?')
    .get(todayKey).count

  const todaySessions = db
    .prepare(`
      SELECT id, section_name, coach, hall, date_time
      FROM schedule
      WHERE substr(date_time, 1, 10) = ?
      ORDER BY date_time
    `)
    .all(todayKey)

  const coachLoad = db
    .prepare(`
      SELECT coach, COUNT(*) AS sections_count
      FROM sections
      GROUP BY coach
      ORDER BY coach
    `)
    .all()

  return {
    stats: {
      sectionCount,
      coachCount,
      participantCount,
      trainingsToday,
    },
    todaySessions: todaySessions.map((row) => ({
      id: row.id,
      sectionName: row.section_name,
      coach: row.coach,
      hall: row.hall,
      dateTime: row.date_time,
    })),
    coachLoad: coachLoad.map((row) => ({
      coach: row.coach,
      sectionsCount: row.sections_count,
    })),
  }
}

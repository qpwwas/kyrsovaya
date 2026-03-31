import { startTransition, useState } from 'react'
import {
  halls,
  initialAchievements,
  initialAttendanceRegisters,
  initialNotifications,
  initialParticipants,
  initialProfiles,
  initialSchedule,
  initialSections,
  referenceDate,
  roleOptions,
} from '../data/mockData'
import { AppStateContext } from './appStateShared'
import { formatDateTime, roleLabels } from '../utils/format'

function createFeedback(type, message) {
  return { type, message }
}

export function AppStateProvider({ children }) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [currentRole, setCurrentRole] = useState('admin')
  const [sections, setSections] = useState(initialSections)
  const [schedule, setSchedule] = useState(initialSchedule)
  const [participants, setParticipants] = useState(initialParticipants)
  const [attendanceRegisters, setAttendanceRegisters] = useState(
    initialAttendanceRegisters,
  )
  const [notifications, setNotifications] = useState(initialNotifications)
  const [authFeedback, setAuthFeedback] = useState(
    createFeedback(
      'info',
      'Включен демонстрационный режим. Для каждой роли доступны свои сценарии и страницы.',
    ),
  )
  const [profileFeedback, setProfileFeedback] = useState(
    createFeedback(
      'info',
      'Личный кабинет готов к редактированию. Изменения сохраняются в рамках демонстрации.',
    ),
  )

  const currentUser = profiles[currentRole]
  const participantsById = Object.fromEntries(
    participants.map((participant) => [participant.id, participant]),
  )
  const sectionsById = Object.fromEntries(sections.map((section) => [section.id, section]))
  const achievements = initialAchievements
  const managedParticipantIds =
    currentRole === 'athlete'
      ? currentUser.athleteId
        ? [currentUser.athleteId]
        : []
      : currentRole === 'parent'
        ? currentUser.managedAthletes
        : []

  function pushNotification(title, body, tone = 'info', channel = 'в системе') {
    setNotifications((previous) => [
      {
        id: `notice-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        title,
        body,
        tone,
        channel,
        timeLabel: 'только что',
      },
      ...previous,
    ])
  }

  function setRole(nextRole) {
    if (!profiles[nextRole]) {
      return
    }

    startTransition(() => {
      setCurrentRole(nextRole)
    })

    setAuthFeedback(
      createFeedback(
        'success',
        `Активирован режим "${roleLabels[nextRole]}". Навигация и данные обновлены под выбранную роль.`,
      ),
    )
  }

  function signIn({ role, email, password }) {
    const normalizedEmail = email.trim().toLowerCase()

    if (!profiles[role]) {
      const message = 'Выберите роль пользователя, чтобы открыть нужный сценарий.'
      setAuthFeedback(createFeedback('error', message))
      return { ok: false, message }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      const message = 'Укажите корректный e-mail для входа в систему.'
      setAuthFeedback(createFeedback('error', message))
      return { ok: false, message }
    }

    if (password.trim().length < 6) {
      const message = 'Пароль должен содержать не менее 6 символов.'
      setAuthFeedback(createFeedback('error', message))
      return { ok: false, message }
    }

    if (
      normalizedEmail !== profiles[role].email.toLowerCase() ||
      password !== profiles[role].password
    ) {
      const message =
        'Для демо-входа используйте учетные данные роли из блока "Демо-аккаунты".'
      setAuthFeedback(createFeedback('error', message))
      return { ok: false, message }
    }

    startTransition(() => {
      setCurrentRole(role)
    })

    const message = `Вход выполнен. Открыт личный кабинет "${roleLabels[role]}".`
    setAuthFeedback(createFeedback('success', message))
    pushNotification(
      'Авторизация подтверждена',
      `Выполнен вход под ролью "${roleLabels[role]}".`,
      'success',
      'кабинет',
    )

    return { ok: true, message }
  }

  function updateProfile(payload) {
    if (payload.fullName.trim().length < 3) {
      const message = 'ФИО должно содержать не менее 3 символов.'
      setProfileFeedback(createFeedback('error', message))
      return { ok: false, message }
    }

    if (!payload.phone.trim()) {
      const message = 'Укажите контактный номер телефона.'
      setProfileFeedback(createFeedback('error', message))
      return { ok: false, message }
    }

    if (!payload.emergencyContact.trim()) {
      const message = 'Заполните поле для экстренной связи.'
      setProfileFeedback(createFeedback('error', message))
      return { ok: false, message }
    }

    setProfiles((previous) => ({
      ...previous,
      [currentRole]: {
        ...previous[currentRole],
        fullName: payload.fullName.trim(),
        phone: payload.phone.trim(),
        emergencyContact: payload.emergencyContact.trim(),
        note: payload.note.trim(),
      },
    }))

    const message = 'Профиль обновлен. Данные личного кабинета сохранены.'
    setProfileFeedback(createFeedback('success', message))
    pushNotification(
      'Профиль изменен',
      `Контактные данные пользователя "${payload.fullName.trim()}" обновлены.`,
      'success',
      'кабинет',
    )

    return { ok: true, message }
  }

  function enrollInSection(sectionId) {
    const section = sectionsById[sectionId]

    if (!section) {
      return {
        ok: false,
        message: 'Выбранная секция не найдена.',
      }
    }

    if (!managedParticipantIds.length) {
      const message =
        'Запись доступна только для роли спортсмена или родителя с привязанным ребенком.'
      pushNotification('Запись отклонена', message, 'warning', 'секции')
      return { ok: false, message }
    }

    const missingIds = managedParticipantIds.filter(
      (participantId) => !section.participantIds.includes(participantId),
    )
    const availableSlots = section.capacity - section.participantIds.length
    const idsToAdd = missingIds.slice(0, availableSlots)

    if (!idsToAdd.length) {
      const message =
        availableSlots <= 0
          ? 'В секции нет свободных мест. Запись невозможна.'
          : 'Указанный спортсмен уже состоит в этой секции.'
      pushNotification('Запись отклонена', message, 'warning', 'секции')
      return { ok: false, message }
    }

    setSections((previous) =>
      previous.map((item) =>
        item.id === sectionId
          ? { ...item, participantIds: [...item.participantIds, ...idsToAdd] }
          : item,
      ),
    )

    setParticipants((previous) =>
      previous.map((participant) =>
        idsToAdd.includes(participant.id)
          ? {
              ...participant,
              sectionIds: participant.sectionIds.includes(sectionId)
                ? participant.sectionIds
                : [...participant.sectionIds, sectionId],
            }
          : participant,
      ),
    )

    const message = `Запись в секцию "${section.name}" оформлена успешно.`
    pushNotification('Новая запись', message, 'success', 'секции')
    return { ok: true, message }
  }

  function rescheduleSession(sessionId, payload) {
    const targetSession = schedule.find((session) => session.id === sessionId)

    if (!targetSession) {
      return { ok: false, message: 'Слот расписания не найден.' }
    }

    if (!['admin', 'coach'].includes(currentRole)) {
      const message =
        'Изменение расписания доступно только администратору и тренеру.'
      pushNotification('Нет доступа', message, 'warning', 'расписание')
      return { ok: false, message }
    }

    if (!payload.dateTime || !payload.hall) {
      const message = 'Заполните дату, время и зал, чтобы перенести тренировку.'
      pushNotification('Расписание не обновлено', message, 'warning', 'расписание')
      return { ok: false, message }
    }

    const conflict = schedule.find((session) => {
      if (session.id === sessionId) {
        return false
      }

      return (
        session.dateTime === payload.dateTime &&
        (session.hall === payload.hall || session.coach === targetSession.coach)
      )
    })

    if (conflict) {
      const message = `Конфликт расписания: ${conflict.sectionName} уже использует выбранный слот.`
      pushNotification('Конфликт ресурсов', message, 'danger', 'расписание')
      return { ok: false, message }
    }

    setSchedule((previous) =>
      previous.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              dateTime: payload.dateTime,
              hall: payload.hall,
              statusLabel: 'Обновлено',
              statusTone: 'warning',
              note: `Расписание обновлено. Новый слот: ${formatDateTime(
                payload.dateTime,
              )}.`,
            }
          : session,
      ),
    )

    const message = `Тренировка "${targetSession.sectionName}" перенесена на ${formatDateTime(
      payload.dateTime,
    )}.`
    pushNotification('Расписание изменено', message, 'success', 'расписание')

    return { ok: true, message }
  }

  function markAttendance(sessionId, participantId, status) {
    if (!['admin', 'coach'].includes(currentRole)) {
      const message = 'Отмечать посещаемость могут только администратор и тренер.'
      pushNotification('Нет доступа', message, 'warning', 'посещаемость')
      return { ok: false, message }
    }

    setAttendanceRegisters((previous) =>
      previous.map((register) =>
        register.sessionId === sessionId
          ? {
              ...register,
              marks: register.marks.map((mark) =>
                mark.participantId === participantId ? { ...mark, status } : mark,
              ),
            }
          : register,
      ),
    )

    const message = `Посещаемость для ${
      participantsById[participantId]?.name ?? 'спортсмена'
    } обновлена.`
    pushNotification('Посещаемость сохранена', message, 'success', 'журнал')
    return { ok: true, message }
  }

  function getAttendanceRate(participantId) {
    const participantMarks = attendanceRegisters.flatMap((register) =>
      register.marks.filter((mark) => mark.participantId === participantId),
    )

    if (!participantMarks.length) {
      return 0
    }

    const presentCount = participantMarks.filter(
      (mark) => mark.status === 'present' || mark.status === 'late',
    ).length

    return Math.round((presentCount / participantMarks.length) * 100)
  }

  const coachCount = new Set(sections.map((section) => section.coach)).size
  const trainingsToday = schedule.filter((session) =>
    session.dateTime.startsWith(referenceDate),
  ).length
  const stats = {
    trainingsToday,
    sectionCount: sections.length,
    coachCount,
    participantCount: participants.length,
    occupancyAlerts: schedule.filter((session) => {
      const section = sectionsById[session.sectionId]
      return section && section.participantIds.length / section.capacity > 0.85
    }).length,
    freeSections: sections.filter((section) => section.participantIds.length < section.capacity)
      .length,
  }

  const value = {
    achievements,
    attendanceRegisters,
    authFeedback,
    currentRole,
    currentUser,
    getAttendanceRate,
    halls,
    managedParticipantIds,
    markAttendance,
    notifications,
    participants,
    participantsById,
    profileFeedback,
    profiles,
    rescheduleSession,
    roleOptions,
    schedule,
    sections,
    sectionsById,
    setRole,
    signIn,
    stats,
    updateProfile,
    enrollInSection,
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

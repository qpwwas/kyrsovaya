import { startTransition, useEffect, useState } from 'react'
import {
  halls as fallbackHalls,
  initialNotifications,
  initialProfiles,
  roleOptions,
} from '../data/mockData'
import {
  enrollSection,
  getAchievements,
  getAttendance,
  getCurrentUser,
  getParticipants,
  getSchedule,
  getSections,
  login,
  updateAttendanceMark,
  updateCurrentUser as saveCurrentUser,
  updateScheduleSession,
} from '../services/api'
import { AppStateContext } from './appStateShared'
import { roleLabels } from '../utils/format'

const TOKEN_STORAGE_KEY = 'sportspace.auth.token'

function createFeedback(type, message) {
  return { type, message }
}

function getTodayKey() {
  return new Intl.DateTimeFormat('sv-SE').format(new Date())
}

function getDefaultAuthFeedback() {
  return createFeedback(
    'info',
    'Секции и расписание загружаются с сервера. Для личных разделов выполните вход под одной из ролей.',
  )
}

function getDefaultProfileFeedback() {
  return createFeedback(
    'info',
    'Профиль редактируется через API. После авторизации изменения сохраняются в базе данных.',
  )
}

function readStoredToken() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''
}

function writeStoredToken(token) {
  if (typeof window === 'undefined') {
    return
  }

  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
    return
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function AppStateProvider({ children }) {
  const profiles = initialProfiles
  const [selectedRole, setSelectedRole] = useState('admin')
  const [token, setToken] = useState(() => readStoredToken())
  const [authenticatedUser, setAuthenticatedUser] = useState(null)
  const [sections, setSections] = useState([])
  const [schedule, setSchedule] = useState([])
  const [participants, setParticipants] = useState([])
  const [attendanceRegisters, setAttendanceRegisters] = useState([])
  const [achievements, setAchievements] = useState([])
  const [notifications, setNotifications] = useState(initialNotifications)
  const [authFeedback, setAuthFeedback] = useState(getDefaultAuthFeedback)
  const [profileFeedback, setProfileFeedback] = useState(getDefaultProfileFeedback)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isSyncingData, setIsSyncingData] = useState(false)

  const currentUser = authenticatedUser ?? profiles[selectedRole]
  const currentRole = authenticatedUser?.role ?? selectedRole
  const isAuthenticated = Boolean(authenticatedUser && token)
  const sectionsById = Object.fromEntries(sections.map((section) => [section.id, section]))
  const participantsById = Object.fromEntries(
    participants.map((participant) => [participant.id, participant]),
  )
  const managedParticipantIds =
    currentRole === 'athlete'
      ? currentUser?.athleteId
        ? [currentUser.athleteId]
        : []
      : currentRole === 'parent'
        ? currentUser?.managedAthletes ?? []
        : []

  const halls = Array.from(
    new Set([
      ...sections.map((section) => section.hall),
      ...schedule.map((session) => session.hall),
    ]),
  )

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
      ...previous.slice(0, 5),
    ])
  }

  function clearProtectedCollections() {
    setParticipants([])
    setAttendanceRegisters([])
    setAchievements([])
  }

  function resetSession(role = 'admin') {
    writeStoredToken('')
    setToken('')
    setAuthenticatedUser(null)
    setSelectedRole(role)
    clearProtectedCollections()
  }

  async function loadPublicCollections() {
    const [sectionsPayload, schedulePayload] = await Promise.all([
      getSections(),
      getSchedule(),
    ])

    return {
      sections: sectionsPayload.sections,
      schedule: schedulePayload.schedule,
    }
  }

  async function loadProtectedCollections(authToken) {
    const [participantsPayload, attendancePayload, achievementsPayload] =
      await Promise.all([
        getParticipants(authToken),
        getAttendance(authToken),
        getAchievements(authToken),
      ])

    return {
      participants: participantsPayload.participants,
      attendanceRegisters: attendancePayload.registers,
      achievements: achievementsPayload.achievements,
    }
  }

  function applyPublicCollections(payload) {
    setSections(payload.sections)
    setSchedule(payload.schedule)
  }

  function applyProtectedCollections(payload) {
    setParticipants(payload.participants)
    setAttendanceRegisters(payload.attendanceRegisters)
    setAchievements(payload.achievements)
  }

  function handleUnauthorized(error, fallbackMessage) {
    if (error?.statusCode !== 401) {
      return false
    }

    resetSession('admin')
    setAuthFeedback(
      createFeedback(
        'warning',
        fallbackMessage ??
          'Сессия истекла. Выполните вход снова, чтобы продолжить работу с личными данными.',
      ),
    )
    setNotifications(initialNotifications)
    return true
  }

  async function reloadPublicData() {
    const publicCollections = await loadPublicCollections()
    applyPublicCollections(publicCollections)
    return publicCollections
  }

  async function reloadAuthenticatedData(authToken) {
    const protectedCollections = await loadProtectedCollections(authToken)
    applyProtectedCollections(protectedCollections)
    return protectedCollections
  }

  useEffect(() => {
    let isCancelled = false

    async function bootstrap() {
      setIsBootstrapping(true)

      try {
        const publicCollections = await loadPublicCollections()

        if (isCancelled) {
          return
        }

        applyPublicCollections(publicCollections)

        const storedToken = readStoredToken()

        if (!storedToken) {
          return
        }

        const { user } = await getCurrentUser(storedToken)
        const protectedCollections = await loadProtectedCollections(storedToken)

        if (isCancelled) {
          return
        }

        writeStoredToken(storedToken)
        setToken(storedToken)
        setAuthenticatedUser(user)
        setSelectedRole(user.role)
        applyProtectedCollections(protectedCollections)
        setAuthFeedback(
          createFeedback(
            'success',
            `Сессия восстановлена. Открыт кабинет "${roleLabels[user.role]}".`,
          ),
        )
      } catch (error) {
        if (isCancelled) {
          return
        }

        if (error?.statusCode === 401) {
          writeStoredToken('')
          setToken('')
          setAuthenticatedUser(null)
          setSelectedRole('admin')
          clearProtectedCollections()
          setNotifications(initialNotifications)
          setAuthFeedback(
            createFeedback(
              'warning',
              'Сохраненная сессия истекла. Выполните вход заново.',
            ),
          )
          return
        }

        setAuthFeedback(
          createFeedback(
            'error',
            error.message ?? 'Не удалось загрузить данные приложения с сервера.',
          ),
        )
      } finally {
        if (!isCancelled) {
          setIsBootstrapping(false)
        }
      }
    }

    bootstrap()

    return () => {
      isCancelled = true
    }
  }, [])

  function setRole(nextRole) {
    if (!profiles[nextRole]) {
      return
    }

    if (isAuthenticated) {
      setAuthFeedback(
        createFeedback(
          'warning',
          'Чтобы переключиться на другую роль, сначала выйдите из текущего аккаунта.',
        ),
      )
      return
    }

    startTransition(() => {
      setSelectedRole(nextRole)
    })

    setAuthFeedback(
      createFeedback(
        'info',
        `Выбран демонстрационный режим "${roleLabels[nextRole]}". Для доступа к защищенным данным выполните вход.`,
      ),
    )
  }

  async function signIn({ role, email, password }) {
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

    setIsSyncingData(true)

    try {
      const { token: nextToken, user } = await login({
        email: normalizedEmail,
        password,
      })

      const [publicCollections, protectedCollections] = await Promise.all([
        loadPublicCollections(),
        loadProtectedCollections(nextToken),
      ])

      writeStoredToken(nextToken)
      setToken(nextToken)
      setAuthenticatedUser(user)
      setSelectedRole(user.role)
      applyPublicCollections(publicCollections)
      applyProtectedCollections(protectedCollections)

      const roleMessage =
        user.role === role
          ? `Вход выполнен. Открыт личный кабинет "${roleLabels[user.role]}".`
          : `Вход выполнен. Учетная запись относится к роли "${roleLabels[user.role]}".`

      setAuthFeedback(createFeedback('success', roleMessage))
      pushNotification(
        'Авторизация подтверждена',
        `Выполнен вход под ролью "${roleLabels[user.role]}".`,
        'success',
        'кабинет',
      )

      return { ok: true, message: roleMessage }
    } catch (error) {
      const message = error.message ?? 'Не удалось выполнить вход через API.'
      setAuthFeedback(createFeedback('error', message))
      return { ok: false, message }
    } finally {
      setIsSyncingData(false)
    }
  }

  function signOut() {
    const fallbackRole = authenticatedUser?.role ?? 'admin'
    resetSession(fallbackRole)
    setNotifications(initialNotifications)
    setAuthFeedback(
      createFeedback(
        'info',
        'Вы вышли из аккаунта. Публичные разделы остаются доступны без авторизации.',
      ),
    )
    setProfileFeedback(getDefaultProfileFeedback())
  }

  async function updateProfile(payload) {
    if (!isAuthenticated || !token || !authenticatedUser) {
      const message = 'Чтобы сохранить профиль, сначала выполните вход в систему.'
      setProfileFeedback(createFeedback('warning', message))
      return { ok: false, message }
    }

    setIsSyncingData(true)

    try {
      const { user } = await saveCurrentUser(token, payload)

      setAuthenticatedUser(user)
      setProfileFeedback(
        createFeedback('success', 'Профиль обновлен. Данные сохранены в базе данных.'),
      )
      pushNotification(
        'Профиль изменен',
        `Контактные данные пользователя "${user.fullName}" обновлены.`,
        'success',
        'кабинет',
      )

      return { ok: true, message: 'Профиль обновлен.' }
    } catch (error) {
      if (handleUnauthorized(error)) {
        return { ok: false, message: 'Сессия истекла.' }
      }

      const message = error.message ?? 'Не удалось сохранить профиль.'
      setProfileFeedback(createFeedback('error', message))
      return { ok: false, message }
    } finally {
      setIsSyncingData(false)
    }
  }

  async function enrollInSection(sectionId) {
    if (!isAuthenticated || !token || !authenticatedUser) {
      const message = 'Для записи в секцию выполните вход как спортсмен или родитель.'
      pushNotification('Запись отклонена', message, 'warning', 'секции')
      return { ok: false, message }
    }

    setIsSyncingData(true)

    try {
      const participantIds =
        authenticatedUser.role === 'athlete'
          ? authenticatedUser.athleteId
            ? [authenticatedUser.athleteId]
            : []
          : authenticatedUser.managedAthletes ?? []

      await enrollSection(token, sectionId, participantIds)
      await Promise.all([reloadPublicData(), reloadAuthenticatedData(token)])

      const sectionName = sectionsById[sectionId]?.name ?? 'выбранная секция'
      const message = `Запись в секцию "${sectionName}" оформлена успешно.`
      pushNotification('Новая запись', message, 'success', 'секции')
      return { ok: true, message }
    } catch (error) {
      if (handleUnauthorized(error)) {
        return { ok: false, message: 'Сессия истекла.' }
      }

      const message = error.message ?? 'Не удалось записать участника в секцию.'
      pushNotification('Запись отклонена', message, 'warning', 'секции')
      return { ok: false, message }
    } finally {
      setIsSyncingData(false)
    }
  }

  async function rescheduleSession(sessionId, payload) {
    if (!isAuthenticated || !token || !authenticatedUser) {
      const message = 'Чтобы изменить расписание, выполните вход как администратор или тренер.'
      pushNotification('Нет доступа', message, 'warning', 'расписание')
      return { ok: false, message }
    }

    setIsSyncingData(true)

    try {
      const { session } = await updateScheduleSession(token, sessionId, payload)
      await reloadPublicData()

      const message = `Тренировка "${session.sectionName}" перенесена.`
      pushNotification('Расписание изменено', message, 'success', 'расписание')
      return { ok: true, message }
    } catch (error) {
      if (handleUnauthorized(error)) {
        return { ok: false, message: 'Сессия истекла.' }
      }

      const message = error.message ?? 'Не удалось обновить расписание.'
      pushNotification('Расписание не обновлено', message, 'warning', 'расписание')
      return { ok: false, message }
    } finally {
      setIsSyncingData(false)
    }
  }

  async function markAttendance(sessionId, participantId, status) {
    if (!isAuthenticated || !token || !authenticatedUser) {
      const message = 'Чтобы отмечать посещаемость, выполните вход как администратор или тренер.'
      pushNotification('Нет доступа', message, 'warning', 'посещаемость')
      return { ok: false, message }
    }

    setIsSyncingData(true)

    try {
      const { registers } = await updateAttendanceMark(token, sessionId, {
        participantId,
        status,
      })

      setAttendanceRegisters(registers)
      const participantName =
        participantsById[participantId]?.name ??
        registers
          .flatMap((register) => register.marks)
          .find((mark) => mark.participantId === participantId)?.participantName ??
        'спортсмен'

      const message = `Посещаемость для ${participantName} обновлена.`
      pushNotification('Посещаемость сохранена', message, 'success', 'журнал')
      return { ok: true, message }
    } catch (error) {
      if (handleUnauthorized(error)) {
        return { ok: false, message: 'Сессия истекла.' }
      }

      const message = error.message ?? 'Не удалось обновить посещаемость.'
      pushNotification('Посещаемость не обновлена', message, 'warning', 'журнал')
      return { ok: false, message }
    } finally {
      setIsSyncingData(false)
    }
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

  const participantCount = Math.max(
    participants.length,
    new Set(sections.flatMap((section) => section.participantIds ?? [])).size,
  )
  const stats = {
    trainingsToday: schedule.filter((session) => session.dateTime.startsWith(getTodayKey())).length,
    sectionCount: sections.length,
    coachCount: new Set(sections.map((section) => section.coach)).size,
    participantCount,
    occupancyAlerts: schedule.filter((session) => {
      const section = sectionsById[session.sectionId]
      return section && (section.participantIds?.length ?? 0) / section.capacity > 0.85
    }).length,
    freeSections: sections.filter(
      (section) => (section.participantIds?.length ?? 0) < section.capacity,
    ).length,
  }

  const value = {
    achievements,
    attendanceRegisters,
    authFeedback,
    currentRole,
    currentUser,
    getAttendanceRate,
    halls: halls.length ? halls : fallbackHalls,
    isAuthenticated,
    isBootstrapping,
    isSyncingData,
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
    signOut,
    stats,
    token,
    updateProfile,
    enrollInSection,
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

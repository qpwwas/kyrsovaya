const API_BASE = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(payload.message ?? 'Не удалось выполнить запрос к API.')
    error.statusCode = response.status
    throw error
  }

  return payload
}

export function login(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function registerAccount(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCurrentUser(token) {
  return request('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function updateCurrentUser(token, payload) {
  return request('/auth/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export function getSections() {
  return request('/sections')
}

export function enrollSection(token, sectionId, participantIds = []) {
  return request(`/sections/${sectionId}/enroll`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ participantIds }),
  })
}

export function getSchedule() {
  return request('/schedule')
}

export function updateScheduleSession(token, sessionId, payload) {
  return request(`/schedule/${sessionId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export function getParticipants(token) {
  return request('/participants', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function getAttendance(token) {
  return request('/attendance', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function updateAttendanceMark(token, sessionId, payload) {
  return request(`/attendance/${sessionId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export function getAchievements(token) {
  return request('/achievements', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../context/useAppState'
import { roleLabels } from '../utils/format'

function LoginCard({
  currentRole,
  authFeedback,
  profiles,
  roleOptions,
  signIn,
}) {
  const [loginForm, setLoginForm] = useState({
    role: currentRole,
    email: '',
    password: '',
  })

  function handleLoginSubmit(event) {
    event.preventDefault()
    signIn(loginForm)
  }

  function applyDemoCredentials(role) {
    const profile = profiles[role]

    setLoginForm({
      role,
      email: profile.email,
      password: profile.password,
    })
  }

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Авторизация по ролям</h2>
          <p className="card__description">
            Демо-вход с валидацией формы и переключением сценариев пользователя.
          </p>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleLoginSubmit}>
        <div className={`alert alert--${authFeedback.type}`}>{authFeedback.message}</div>

        <div className="form-grid form-grid--two">
          <div className="field">
            <label htmlFor="login-role">Роль</label>
            <select
              id="login-role"
              value={loginForm.role}
              onChange={(event) =>
                setLoginForm((previous) => ({
                  ...previous,
                  role: event.target.value,
                }))
              }
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              value={loginForm.email}
              placeholder="user@sport.local"
              onChange={(event) =>
                setLoginForm((previous) => ({
                  ...previous,
                  email: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="login-password">Пароль</label>
          <input
            id="login-password"
            type="password"
            value={loginForm.password}
            placeholder="не менее 6 символов"
            onChange={(event) =>
              setLoginForm((previous) => ({
                ...previous,
                password: event.target.value,
              }))
            }
          />
        </div>

        <div className="actions-row">
          <button className="button" type="submit">
            Войти в систему
          </button>
        </div>
      </form>

      <div className="divider" style={{ margin: '20px 0' }}></div>

      <div className="card-grid">
        {roleOptions.map((role) => (
          <article key={role.value} className="meta-box">
            <span className="meta-box__label">{role.label}</span>
            <div className="mini-list">
              <span className="meta-box__value">{profiles[role.value].email}</span>
              <span className="inline-note">Пароль: {profiles[role.value].password}</span>
            </div>
            <div className="actions-row" style={{ marginTop: 14 }}>
              <button
                className="button-secondary"
                type="button"
                onClick={() => applyDemoCredentials(role.value)}
              >
                Подставить данные
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function ProfileCard({ currentUser, profileFeedback, updateProfile }) {
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser.fullName,
    phone: currentUser.phone,
    emergencyContact: currentUser.emergencyContact,
    note: currentUser.note,
  })

  function handleProfileSubmit(event) {
    event.preventDefault()
    updateProfile(profileForm)
  }

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Личный кабинет</h2>
          <p className="card__description">
            Редактирование контактных данных, заметок и экстренной связи.
          </p>
        </div>
        <StatusPill tone="info">{currentUser.position}</StatusPill>
      </div>

      <form className="form-grid" onSubmit={handleProfileSubmit}>
        <div className={`alert alert--${profileFeedback.type}`}>
          {profileFeedback.message}
        </div>

        <div className="form-grid form-grid--two">
          <div className="field">
            <label htmlFor="profile-name">ФИО</label>
            <input
              id="profile-name"
              value={profileForm.fullName}
              onChange={(event) =>
                setProfileForm((previous) => ({
                  ...previous,
                  fullName: event.target.value,
                }))
              }
            />
          </div>
          <div className="field">
            <label htmlFor="profile-phone">Телефон</label>
            <input
              id="profile-phone"
              value={profileForm.phone}
              onChange={(event) =>
                setProfileForm((previous) => ({
                  ...previous,
                  phone: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="profile-contact">Экстренная связь</label>
          <input
            id="profile-contact"
            value={profileForm.emergencyContact}
            onChange={(event) =>
              setProfileForm((previous) => ({
                ...previous,
                emergencyContact: event.target.value,
              }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="profile-note">Заметка профиля</label>
          <textarea
            id="profile-note"
            value={profileForm.note}
            onChange={(event) =>
              setProfileForm((previous) => ({
                ...previous,
                note: event.target.value,
              }))
            }
          />
        </div>

        <div className="actions-row">
          <button className="button" type="submit">
            Сохранить изменения
          </button>
        </div>
      </form>
    </section>
  )
}

export function HomePage() {
  const {
    authFeedback,
    currentRole,
    currentUser,
    profileFeedback,
    profiles,
    roleOptions,
    signIn,
    stats,
    updateProfile,
  } = useAppState()

  const roleHighlights = {
    admin: [
      'контроль секций и загрузки залов',
      'статистика тренировок на день',
      'публикация уведомлений',
    ],
    coach: [
      'ведение списка участников',
      'коррекция расписания без конфликтов',
      'учет посещаемости после тренировки',
    ],
    athlete: [
      'запись в секции',
      'просмотр результатов и достижений',
      'управление личными данными',
    ],
    parent: [
      'контроль расписания ребенка',
      'получение важных уведомлений',
      'просмотр прогресса и посещаемости',
    ],
  }

  return (
    <>
      <PageHeader
        eyebrow="Личный кабинет и роли"
        title="Система управления спортивными секциями и тренировками"
        description="Демонстрационный фронтенд покрывает ключевые сценарии курсовой: регистрацию и авторизацию по ролям, личный кабинет, запись в секции, управление расписанием, контроль залов, посещаемость, достижения и административную панель."
      />

      <section className="hero-card">
        <div className="hero-card__content">
          <StatusPill tone="info">
            Текущая роль: {roleLabels[currentRole]}
          </StatusPill>
          <p className="hero-card__summary">
            Интерфейс построен как основа для курсового проекта по критериям из
            `docx`: есть маршруты, формы, валидация, разные роли, уведомления и
            архитектура, которую можно безболезненно расширить backend-частью.
          </p>

          <div className="hero-card__metrics">
            <div className="hero-card__metric">
              <span className="hero-card__metric-value">{stats.sectionCount}</span>
              <span className="hero-card__metric-label">спортивных секций</span>
            </div>
            <div className="hero-card__metric">
              <span className="hero-card__metric-value">{stats.trainingsToday}</span>
              <span className="hero-card__metric-label">тренировки сегодня</span>
            </div>
            <div className="hero-card__metric">
              <span className="hero-card__metric-value">{stats.participantCount}</span>
              <span className="hero-card__metric-label">участников в системе</span>
            </div>
            <div className="hero-card__metric">
              <span className="hero-card__metric-value">{stats.coachCount}</span>
              <span className="hero-card__metric-label">тренеров в базе</span>
            </div>
          </div>
        </div>
      </section>

      <section className="role-grid">
        {roleOptions.map((role) => (
          <article key={role.value} className="card role-card">
            <div className="card__header">
              <div>
                <StatusPill tone={role.value === currentRole ? 'success' : 'neutral'}>
                  {role.label}
                </StatusPill>
                <h2 className="role-card__title" style={{ marginTop: 12 }}>
                  {role.summary}
                </h2>
              </div>
            </div>

            <ul className="role-card__list">
              {roleHighlights[role.value].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <div className="page-grid page-grid--two">
        <LoginCard
          key={currentRole}
          currentRole={currentRole}
          authFeedback={authFeedback}
          profiles={profiles}
          roleOptions={roleOptions}
          signIn={signIn}
        />

        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">Что уже покрыто</h2>
              <p className="card__description">
                Блоки интерфейса, которые уже соответствуют логике курсовой.
              </p>
            </div>
          </div>

          <div className="stats-grid">
            <StatCard
              label="Роли"
              value="4"
              hint="администратор, тренер, спортсмен, родитель"
            />
            <StatCard
              label="Маршруты"
              value="6"
              hint="от главной до административной панели"
            />
            <StatCard
              label="Формы"
              value="3"
              hint="вход, редактирование профиля, перенос тренировки"
            />
            <StatCard
              label="Уведомления"
              value="online"
              hint="изменения видны сразу после действий"
            />
          </div>

          <div className="divider" style={{ margin: '20px 0' }}></div>

          <ul className="bullet-list">
            <li>страницы разделены по маршрутам через `react-router-dom`</li>
            <li>данные собраны в отдельном слое `data/` и контексте состояния</li>
            <li>каждое действие пользователя сопровождается понятным сообщением</li>
            <li>структура готова к следующему этапу: API, БД и настоящая авторизация</li>
          </ul>
        </section>
      </div>

      <ProfileCard
        key={currentRole}
        currentUser={currentUser}
        profileFeedback={profileFeedback}
        updateProfile={updateProfile}
      />
    </>
  )
}

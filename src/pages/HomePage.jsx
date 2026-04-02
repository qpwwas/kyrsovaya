import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../context/useAppState'
import { roleLabels } from '../utils/format'

const registrationRoleOptions = [
  {
    value: 'athlete',
    label: 'Спортсмен',
    summary: 'Создает личный профиль и получает возможность записываться в секции.',
  },
  {
    value: 'parent',
    label: 'Родитель',
    summary: 'Создает свой кабинет и сразу добавляет ребенка в систему.',
  },
]

function createRegistrationForm(role = 'athlete') {
  return {
    role,
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    password: '',
    note: '',
    parentName: '',
    athleteAge: '',
    athleteLevel: '',
    athleteFocus: '',
    childName: '',
    childAge: '',
    childLevel: '',
    childFocus: '',
  }
}

function LoginCard({
  currentRole,
  isAuthenticated,
  isSyncingData,
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
          <h2 className="card__title">Вход в систему</h2>
          <p className="card__description">
            Авторизация по ролям администратора, тренера, спортсмена и родителя.
          </p>
        </div>
        <StatusPill tone={isAuthenticated ? 'success' : 'info'}>
          {isAuthenticated ? 'Сессия активна' : 'Готово к входу'}
        </StatusPill>
      </div>

      <form className="form-grid" onSubmit={handleLoginSubmit}>
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
          <button className="button" type="submit" disabled={isSyncingData}>
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

function RegistrationCard({ isAuthenticated, isSyncingData, registerUser }) {
  const [registrationForm, setRegistrationForm] = useState(createRegistrationForm())

  function updateField(field, value) {
    setRegistrationForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function handleRoleChange(nextRole) {
    setRegistrationForm((previous) => ({
      ...createRegistrationForm(nextRole),
      fullName: previous.fullName,
      email: previous.email,
      phone: previous.phone,
      emergencyContact: previous.emergencyContact,
      password: previous.password,
      note: previous.note,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    registerUser(registrationForm)
  }

  if (isAuthenticated) {
    return (
      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Регистрация завершена</h2>
            <p className="card__description">
              Новый аккаунт уже открыт. Для создания еще одной учетной записи сначала
              выйдите из текущей сессии.
            </p>
          </div>
          <StatusPill tone="success">Аккаунт активен</StatusPill>
        </div>

        <ul className="bullet-list">
          <li>спортсмен может сразу записываться в секции и смотреть достижения</li>
          <li>родитель получает кабинет и привязанного ребенка</li>
          <li>контактные данные можно уточнить в личном кабинете ниже</li>
        </ul>
      </section>
    )
  }

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Регистрация нового пользователя</h2>
          <p className="card__description">
            Публичная регистрация доступна для спортсмена и родителя.
          </p>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="register-role">Кого регистрируем</label>
          <select
            id="register-role"
            value={registrationForm.role}
            onChange={(event) => handleRoleChange(event.target.value)}
          >
            {registrationRoleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <span className="inline-note">
            {
              registrationRoleOptions.find((role) => role.value === registrationForm.role)
                ?.summary
            }
          </span>
        </div>

        <div className="form-grid form-grid--two">
          <div className="field">
            <label htmlFor="register-full-name">ФИО</label>
            <input
              id="register-full-name"
              value={registrationForm.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="register-email">E-mail</label>
            <input
              id="register-email"
              type="email"
              value={registrationForm.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </div>
        </div>

        <div className="form-grid form-grid--two">
          <div className="field">
            <label htmlFor="register-phone">Телефон</label>
            <input
              id="register-phone"
              value={registrationForm.phone}
              onChange={(event) => updateField('phone', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="register-password">Пароль</label>
            <input
              id="register-password"
              type="password"
              value={registrationForm.password}
              onChange={(event) => updateField('password', event.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="register-contact">Экстренная связь</label>
          <input
            id="register-contact"
            value={registrationForm.emergencyContact}
            placeholder="Контакт на случай переноса тренировки или ЧС"
            onChange={(event) => updateField('emergencyContact', event.target.value)}
          />
        </div>

        {registrationForm.role === 'athlete' ? (
          <div className="form-grid">
            <div className="form-grid form-grid--two">
              <div className="field">
                <label htmlFor="register-parent-name">Родитель или представитель</label>
                <input
                  id="register-parent-name"
                  value={registrationForm.parentName}
                  onChange={(event) => updateField('parentName', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="register-athlete-age">Возраст спортсмена</label>
                <input
                  id="register-athlete-age"
                  type="number"
                  min="5"
                  max="25"
                  value={registrationForm.athleteAge}
                  onChange={(event) => updateField('athleteAge', event.target.value)}
                />
              </div>
            </div>

            <div className="form-grid form-grid--two">
              <div className="field">
                <label htmlFor="register-athlete-level">Уровень подготовки</label>
                <input
                  id="register-athlete-level"
                  value={registrationForm.athleteLevel}
                  placeholder="Начальный, средний, продвинутый"
                  onChange={(event) => updateField('athleteLevel', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="register-athlete-focus">Спортивный фокус</label>
                <input
                  id="register-athlete-focus"
                  value={registrationForm.athleteFocus}
                  placeholder="Например: плавание на короткие дистанции"
                  onChange={(event) => updateField('athleteFocus', event.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="form-grid">
            <div className="form-grid form-grid--two">
              <div className="field">
                <label htmlFor="register-child-name">Имя ребенка</label>
                <input
                  id="register-child-name"
                  value={registrationForm.childName}
                  onChange={(event) => updateField('childName', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="register-child-age">Возраст ребенка</label>
                <input
                  id="register-child-age"
                  type="number"
                  min="5"
                  max="25"
                  value={registrationForm.childAge}
                  onChange={(event) => updateField('childAge', event.target.value)}
                />
              </div>
            </div>

            <div className="form-grid form-grid--two">
              <div className="field">
                <label htmlFor="register-child-level">Уровень ребенка</label>
                <input
                  id="register-child-level"
                  value={registrationForm.childLevel}
                  placeholder="Начальный, средний, продвинутый"
                  onChange={(event) => updateField('childLevel', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="register-child-focus">Направление подготовки</label>
                <input
                  id="register-child-focus"
                  value={registrationForm.childFocus}
                  placeholder="Например: гимнастика и координация"
                  onChange={(event) => updateField('childFocus', event.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="register-note">Комментарий</label>
          <textarea
            id="register-note"
            value={registrationForm.note}
            placeholder="Медицинские пометки, цели на сезон, пожелания по расписанию"
            onChange={(event) => updateField('note', event.target.value)}
          />
        </div>

        <div className="actions-row">
          <button className="button" type="submit" disabled={isSyncingData}>
            Создать аккаунт
          </button>
        </div>
      </form>
    </section>
  )
}

function ProfileCard({ currentUser, isSyncingData, profileFeedback, updateProfile }) {
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
        <div className={`alert alert--${profileFeedback.type}`}>{profileFeedback.message}</div>

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
          <button className="button" type="submit" disabled={isSyncingData}>
            Сохранить изменения
          </button>
        </div>
      </form>
    </section>
  )
}

function GuestCabinetCard() {
  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Личный кабинет откроется после входа</h2>
          <p className="card__description">
            Пока доступен только публичный каталог секций и расписание тренировок.
          </p>
        </div>
        <StatusPill tone="warning">Гостевой режим</StatusPill>
      </div>

      <ul className="bullet-list">
        <li>спортсмен после входа видит свои достижения и посещаемость</li>
        <li>родитель получает доступ к данным ребенка и записи в секции</li>
        <li>тренер и администратор могут менять расписание и журнал посещаемости</li>
      </ul>
    </section>
  )
}

export function HomePage() {
  const {
    authFeedback,
    currentRole,
    currentUser,
    isAuthenticated,
    isSyncingData,
    profileFeedback,
    profiles,
    registerUser,
    roleOptions,
    signIn,
    stats,
    updateProfile,
  } = useAppState()

  const roleHighlights = {
    admin: [
      'контроль секций, занятости залов и общей статистики',
      'работа с административной панелью и списками участников',
      'проверка нагрузки тренеров и количества тренировок на день',
    ],
    coach: [
      'ведение списка участников и редактирование посещаемости',
      'корректировка расписания без конфликтов по залам и тренерам',
      'оперативная работа с составом групп',
    ],
    athlete: [
      'запись в секции и просмотр собственных достижений',
      'контроль личного расписания и посещаемости',
      'редактирование контактных данных в кабинете',
    ],
    parent: [
      'контроль расписания ребенка и уведомлений по изменениям',
      'просмотр достижений и посещаемости привязанного спортсмена',
      'запись ребенка в подходящие секции',
    ],
  }

  return (
    <>
      <PageHeader
        eyebrow="Личный кабинет и роли"
        title="Система управления спортивными секциями и расписанием тренировок"
        description="Интерфейс покрывает ключевые критерии курсовой: регистрацию и авторизацию, роли пользователей, личный кабинет, секции, расписание, посещаемость, достижения и административный контроль."
      />

      <section className="hero-card">
        <div className="hero-card__content">
          <StatusPill tone={isAuthenticated ? 'success' : 'info'}>
            Текущая роль: {roleLabels[currentRole]}
          </StatusPill>
          <p className="hero-card__summary">
            Проект уже работает как цельная система: публичные разделы доступны без
            входа, а защищенные маршруты открываются только после авторизации. Новые
            спортсмены и родители могут зарегистрироваться прямо из интерфейса.
          </p>

          <div className="hero-card__metrics">
            <div className="hero-card__metric">
              <span className="hero-card__metric-value">{stats.sectionCount}</span>
              <span className="hero-card__metric-label">спортивных секций</span>
            </div>
            <div className="hero-card__metric">
              <span className="hero-card__metric-value">{stats.trainingsToday}</span>
              <span className="hero-card__metric-label">тренировки на сегодня</span>
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

      <div className={`alert alert--${authFeedback.type}`}>{authFeedback.message}</div>

      <div className="page-grid page-grid--two">
        <LoginCard
          key={`${isAuthenticated ? 'auth' : 'guest'}-${currentRole}`}
          currentRole={currentRole}
          isAuthenticated={isAuthenticated}
          isSyncingData={isSyncingData}
          profiles={profiles}
          roleOptions={roleOptions}
          signIn={signIn}
        />

        <RegistrationCard
          key={isAuthenticated ? 'registration-auth' : 'registration-public'}
          isAuthenticated={isAuthenticated}
          isSyncingData={isSyncingData}
          registerUser={registerUser}
        />
      </div>

      <div className="page-grid page-grid--two">
        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">Что уже покрыто в проекте</h2>
              <p className="card__description">
                Базовый функционал курсовой уже доступен в интерфейсе и backend API.
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
              hint="с учетом защищенных страниц и административного доступа"
            />
            <StatCard
              label="Формы"
              value="4"
              hint="вход, регистрация, редактирование профиля, перенос тренировки"
            />
            <StatCard
              label="Данные"
              value="API"
              hint="фронтенд подключен к Express и MongoDB"
            />
          </div>

          <div className="divider" style={{ margin: '20px 0' }}></div>

          <ul className="bullet-list">
            <li>публичные разделы работают без авторизации и загружаются с сервера</li>
            <li>личные данные, достижения и посещаемость защищены по ролям</li>
            <li>административная панель доступна только администратору</li>
            <li>спортсмен и родитель могут создать новый аккаунт прямо из интерфейса</li>
          </ul>
        </section>

        {isAuthenticated ? (
          <ProfileCard
            key={currentUser.email}
            currentUser={currentUser}
            isSyncingData={isSyncingData}
            profileFeedback={profileFeedback}
            updateProfile={updateProfile}
          />
        ) : (
          <GuestCabinetCard />
        )}
      </div>
    </>
  )
}

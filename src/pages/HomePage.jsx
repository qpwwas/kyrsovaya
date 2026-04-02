import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../context/useAppState'
import { roleLabels } from '../utils/format'

function getQuickActions(isAuthenticated, currentRole) {
  if (!isAuthenticated) {
    return [
      {
        to: '/login',
        title: 'Вход в систему',
        description: 'Отдельная страница авторизации для всех ролей.',
      },
      {
        to: '/register',
        title: 'Регистрация',
        description: 'Создание аккаунта спортсмена или родителя.',
      },
      {
        to: '/sections',
        title: 'Каталог секций',
        description: 'Просмотр направлений, тренеров и свободных мест.',
      },
      {
        to: '/schedule',
        title: 'Расписание',
        description: 'Ближайшие тренировки, залы и время проведения.',
      },
    ]
  }

  const commonActions = [
    {
      to: '/profile',
      title: 'Личный кабинет',
      description: 'Редактирование профиля и контактных данных.',
    },
    {
      to: '/sections',
      title: 'Секции',
      description: 'Просмотр спортивных направлений и запись.',
    },
    {
      to: '/schedule',
      title: 'Расписание',
      description: 'Контроль тренировок и занятости залов.',
    },
  ]

  if (currentRole === 'admin') {
    return [
      ...commonActions,
      {
        to: '/admin',
        title: 'Админ-панель',
        description: 'Общая статистика, тренеры, участники и секции.',
      },
    ]
  }

  if (currentRole === 'coach') {
    return [
      ...commonActions,
      {
        to: '/attendance',
        title: 'Посещаемость',
        description: 'Работа с журналом и составом тренировок.',
      },
    ]
  }

  return [
    ...commonActions,
    {
      to: '/achievements',
      title: 'Достижения',
      description: 'Просмотр результатов, наград и спортивного прогресса.',
    },
  ]
}

export function HomePage() {
  const {
    authFeedback,
    currentRole,
    currentUser,
    isAuthenticated,
    roleOptions,
    stats,
  } = useAppState()

  const quickActions = getQuickActions(isAuthenticated, currentRole)

  return (
    <>
      <PageHeader
        eyebrow="Главная панель"
        title="Система управления спортивными секциями"
        description="Главная страница теперь работает как спокойный минималистичный дашборд, а вход, регистрация и профиль вынесены в отдельные страницы."
        action={
          isAuthenticated ? (
            <Link className="button-secondary" to="/profile">
              Открыть профиль
            </Link>
          ) : (
            <div className="actions-row">
              <Link className="button-secondary" to="/login">
                Вход
              </Link>
              <Link className="button" to="/register">
                Регистрация
              </Link>
            </div>
          )
        }
      />

      <div className={`alert alert--${authFeedback.type}`}>{authFeedback.message}</div>

      <div className="page-grid page-grid--two">
        <section className="hero-card">
          <div className="hero-card__content">
            <StatusPill tone={isAuthenticated ? 'success' : 'neutral'}>
              {isAuthenticated ? `Активная роль: ${roleLabels[currentRole]}` : 'Публичный режим'}
            </StatusPill>

            <h2 className="hero-card__title">
              {isAuthenticated
                ? `Добро пожаловать, ${currentUser.fullName}`
                : 'Управление секциями, расписанием и участниками в одном интерфейсе'}
            </h2>

            <p className="hero-card__summary">
              {isAuthenticated
                ? 'После входа система открывает персональные возможности по роли: профиль, достижения, посещаемость, расписание и административные сценарии.'
                : 'Гости могут изучать секции и расписание, а отдельные страницы входа и регистрации помогают быстрее перейти в личный кабинет без перегруженной главной страницы.'}
            </p>

            <div className="hero-card__metrics">
              <div className="hero-card__metric">
                <span className="hero-card__metric-value">{stats.sectionCount}</span>
                <span className="hero-card__metric-label">секций в системе</span>
              </div>
              <div className="hero-card__metric">
                <span className="hero-card__metric-value">{stats.trainingsToday}</span>
                <span className="hero-card__metric-label">тренировок сегодня</span>
              </div>
              <div className="hero-card__metric">
                <span className="hero-card__metric-value">{stats.participantCount}</span>
                <span className="hero-card__metric-label">участников в базе</span>
              </div>
              <div className="hero-card__metric">
                <span className="hero-card__metric-value">{stats.coachCount}</span>
                <span className="hero-card__metric-label">тренеров</span>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">Быстрые действия</h2>
              <p className="card__description">
                Частые сценарии теперь распределены по отдельным чистым экранам.
              </p>
            </div>
          </div>

          <div className="quick-links">
            {quickActions.map((action) => (
              <Link key={action.to} className="quick-link" to={action.to}>
                <strong className="quick-link__title">{action.title}</strong>
                <span className="quick-link__description">{action.description}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="page-grid page-grid--two">
        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">Что уже реализовано</h2>
              <p className="card__description">
                Основной функционал курсового проекта уже собран в единую систему.
              </p>
            </div>
          </div>

          <div className="stack-list">
            <article className="stack-list__item">
              <strong className="stack-list__title">Регистрация и авторизация</strong>
              <p className="stack-list__body">
                Пользователи входят в систему по ролям, а спортсмен и родитель могут
                регистрироваться самостоятельно.
              </p>
            </article>
            <article className="stack-list__item">
              <strong className="stack-list__title">Каталог секций</strong>
              <p className="stack-list__body">
                Доступны описания секций, тренеры, залы, расписание и свободные места.
              </p>
            </article>
            <article className="stack-list__item">
              <strong className="stack-list__title">Расписание и занятость</strong>
              <p className="stack-list__body">
                Система хранит тренировки, поддерживает изменения и контролирует занятость.
              </p>
            </article>
            <article className="stack-list__item">
              <strong className="stack-list__title">Достижения и посещаемость</strong>
              <p className="stack-list__body">
                Для защищенных ролей доступны личные результаты и журнал посещений.
              </p>
            </article>
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">
                {isAuthenticated ? 'Текущий аккаунт' : 'Публичный сценарий'}
              </h2>
              <p className="card__description">
                {isAuthenticated
                  ? 'Краткая сводка по активному пользователю и его роли.'
                  : 'До входа можно спокойно изучить структуру системы и основные разделы.'}
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="summary-list">
              <div className="summary-list__item">
                <span className="summary-list__label">Пользователь</span>
                <span className="summary-list__value">{currentUser.fullName}</span>
              </div>
              <div className="summary-list__item">
                <span className="summary-list__label">Роль</span>
                <span className="summary-list__value">{roleLabels[currentRole]}</span>
              </div>
              <div className="summary-list__item">
                <span className="summary-list__label">E-mail</span>
                <span className="summary-list__value">{currentUser.email}</span>
              </div>
              <div className="summary-list__item">
                <span className="summary-list__label">Заметка</span>
                <span className="summary-list__value">{currentUser.note}</span>
              </div>
            </div>
          ) : (
            <>
              <ul className="bullet-list">
                <li>Главная страница больше не перегружена формами входа и регистрации.</li>
                <li>Для входа и регистрации сделаны отдельные спокойные страницы.</li>
                <li>Профиль пользователя теперь тоже живет на собственном маршруте.</li>
                <li>Публичные секции и расписание можно изучать без авторизации.</li>
              </ul>

              <div className="actions-row">
                <Link className="button" to="/login">
                  Открыть вход
                </Link>
                <Link className="button-secondary" to="/register">
                  Перейти к регистрации
                </Link>
              </div>
            </>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Роли в системе</h2>
            <p className="card__description">
              Каждая роль получила собственный сценарий работы и набор доступных страниц.
            </p>
          </div>
        </div>

        <div className="card-grid">
          {roleOptions.map((role) => (
            <article key={role.value} className="meta-box">
              <StatusPill tone={role.value === currentRole ? 'success' : 'neutral'}>
                {role.label}
              </StatusPill>
              <strong className="meta-box__value">{role.summary}</strong>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

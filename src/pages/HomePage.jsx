import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoginFormCard } from '../components/auth/LoginFormCard'
import { PageHeader } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../context/useAppState'
import { roleLabels } from '../utils/format'

const sportCards = [
  {
    title: 'Футбол',
    subtitle: 'Junior Pro',
    status: 'Открыт набор',
    tone: 'success',
    meta: '18 мест / Игровой зал',
  },
  {
    title: 'Плавание',
    subtitle: 'Sprint Team',
    status: 'Почти заполнено',
    tone: 'warning',
    meta: '16 мест / Бассейн 1',
  },
  {
    title: 'Баскетбол',
    subtitle: 'U16 Core',
    status: 'Открыт набор',
    tone: 'success',
    meta: '20 мест / Игровой зал',
  },
  {
    title: 'Гимнастика',
    subtitle: 'Flex Kids',
    status: 'Последние места',
    tone: 'info',
    meta: '12 мест / Малый зал',
  },
  {
    title: 'Тхэквондо',
    subtitle: 'Start Group',
    status: 'Открыт набор',
    tone: 'success',
    meta: '14 мест / Зал единоборств',
  },
  {
    title: 'Лёгкая атлетика',
    subtitle: 'Track Lab',
    status: 'Набор скоро',
    tone: 'neutral',
    meta: 'Новый поток / Стадион',
  },
]

const scheduleTabs = [
  {
    key: 'mon',
    label: 'Пн',
    items: [
      { time: '17:00', section: 'Гимнастика Kids', hall: 'Малый зал', coach: 'Н. Колесова' },
      { time: '18:30', section: 'Плавание PRO', hall: 'Бассейн 1', coach: 'И. Лапина' },
      { time: '20:00', section: 'Футбол Junior', hall: 'Игровой зал', coach: 'А. Новиков' },
    ],
  },
  {
    key: 'tue',
    label: 'Вт',
    items: [
      { time: '16:30', section: 'Тхэквондо Start', hall: 'Зал единоборств', coach: 'Д. Сейтханов' },
      { time: '18:00', section: 'Баскетбол U16', hall: 'Игровой зал', coach: 'Р. Гусев' },
      { time: '19:30', section: 'Плавание Sprint', hall: 'Бассейн 1', coach: 'И. Лапина' },
    ],
  },
  {
    key: 'wed',
    label: 'Ср',
    items: [
      { time: '17:30', section: 'Лёгкая атлетика', hall: 'Стадион', coach: 'М. Корнев' },
      { time: '18:00', section: 'Гимнастика Flex', hall: 'Малый зал', coach: 'Н. Колесова' },
      { time: '19:00', section: 'Футбол Junior', hall: 'Игровой зал', coach: 'А. Новиков' },
    ],
  },
  {
    key: 'thu',
    label: 'Чт',
    items: [
      { time: '16:00', section: 'Плавание PRO', hall: 'Бассейн 1', coach: 'И. Лапина' },
      { time: '18:00', section: 'Баскетбол U16', hall: 'Игровой зал', coach: 'Р. Гусев' },
      { time: '19:30', section: 'Тхэквондо Start', hall: 'Зал единоборств', coach: 'Д. Сейтханов' },
    ],
  },
  {
    key: 'fri',
    label: 'Пт',
    items: [
      { time: '17:00', section: 'Лёгкая атлетика', hall: 'Стадион', coach: 'М. Корнев' },
      { time: '18:30', section: 'Гимнастика Kids', hall: 'Малый зал', coach: 'Н. Колесова' },
      { time: '20:00', section: 'Футбол Junior', hall: 'Игровой зал', coach: 'А. Новиков' },
    ],
  },
  {
    key: 'sat',
    label: 'Сб',
    items: [
      { time: '10:00', section: 'Плавание Sprint', hall: 'Бассейн 1', coach: 'И. Лапина' },
      { time: '11:30', section: 'Баскетбол U16', hall: 'Игровой зал', coach: 'Р. Гусев' },
      { time: '13:00', section: 'Тхэквондо Start', hall: 'Зал единоборств', coach: 'Д. Сейтханов' },
    ],
  },
]

const achievementCards = [
  {
    title: 'Городские старты',
    metric: 24,
    suffix: '+',
    description: 'Награды и призовые места воспитанников за текущий сезон.',
  },
  {
    title: 'Личный прогресс',
    metric: 87,
    suffix: '%',
    description: 'Средний рост посещаемости и вовлеченности по активным группам.',
  },
  {
    title: 'Командные победы',
    metric: 12,
    suffix: '',
    description: 'Победы команд на турнирах и открытых городских матчах.',
  },
]

const dashboardMenu = ['Обзор', 'Секции', 'Посещаемость', 'Тренеры', 'Уведомления']

const dashboardRows = [
  { name: 'Алина Орлова', section: 'Плавание PRO', status: 'Присутствует' },
  { name: 'Илья Карпов', section: 'Футбол Junior', status: 'Присутствует' },
  { name: 'София Орлова', section: 'Гимнастика Kids', status: 'Опоздание' },
  { name: 'Руслан Байкенов', section: 'Баскетбол U16', status: 'Отсутствует' },
]

function AnimatedCounter({ value, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!Number.isFinite(value)) {
      return undefined
    }

    let frameId = 0
    const duration = 1200
    const startedAt = performance.now()

    function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(value * eased))

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick)
      }
    }

    frameId = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(frameId)
  }, [value])

  return (
    <>
      {displayValue}
      {suffix}
    </>
  )
}

function SectionLead({ eyebrow, title, description }) {
  return (
    <div className="landing-section__lead">
      <span className="landing-section__eyebrow">{eyebrow}</span>
      <h2 className="landing-section__title">{title}</h2>
      <p className="landing-section__description">{description}</p>
    </div>
  )
}

export function HomePage() {
  const {
    authFeedback,
    currentRole,
    currentUser,
    isAuthenticated,
    isSyncingData,
    profiles,
    roleOptions,
    setRole,
    signIn,
    stats,
  } = useAppState()
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = useState(scheduleTabs[0].key)

  const activeSchedule = scheduleTabs.find((day) => day.key === activeDay) ?? scheduleTabs[0]
  const showcaseStats = [
    { label: 'Секций', value: stats.sectionCount, suffix: '' },
    { label: 'Тренировок сегодня', value: stats.trainingsToday, suffix: '' },
    { label: 'Участников', value: stats.participantCount, suffix: '' },
    { label: 'Тренеров', value: stats.coachCount, suffix: '' },
  ]

  return (
    <>
      <PageHeader
        eyebrow="SportSpace Manager"
        title={
          <>
            Управление спортивными секциями
            <span className="accent-text"> нового поколения</span>
          </>
        }
        description="Единая платформа для организации тренировок, контроля посещаемости и отслеживания достижений спортсменов."
        action={
          <div className="actions-row">
            <Link className="button-secondary" to="/sections">
              Смотреть секции
            </Link>
            <Link className="button" to={isAuthenticated ? '/profile' : '/register'}>
              {isAuthenticated ? 'Личный кабинет' : 'Начать сейчас'}
            </Link>
          </div>
        }
      />

      <div className="landing-flow">
        <Reveal className="landing-hero" delay={0}>
          <div className="landing-hero__content">
            <StatusPill tone={isAuthenticated ? 'success' : 'neutral'}>
              {isAuthenticated ? `${roleLabels[currentRole]}` : 'Гостевой режим'}
            </StatusPill>

            <h2 className="landing-hero__title">
              Современная система для спортивных клубов и секций
            </h2>

            <p className="landing-hero__description">
              Интерфейс объединяет управление секциями, расписание тренировок, учет посещаемости
              и достижения спортсменов в единую экосистему.
            </p>

            <div className="landing-hero__actions">
              <Link className="button" to={isAuthenticated ? '/schedule' : '/login'}>
                {isAuthenticated ? 'Открыть расписание' : 'Войти в систему'}
              </Link>
              <Link className="button-secondary" to="/admin">
                Панель управления
              </Link>
            </div>
          </div>

          <div className="landing-hero__metrics">
            {showcaseStats.map((item) => (
              <article key={item.label} className="landing-hero__metric">
                <strong className="landing-hero__metric-value">
                  <AnimatedCounter value={item.value} suffix={item.suffix} />
                </strong>
                <span className="landing-hero__metric-label">{item.label}</span>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="stats-strip" delay={100}>
          {showcaseStats.map((item) => (
            <article key={item.label} className="stats-strip__item">
              <span className="stats-strip__label">{item.label}</span>
              <strong className="stats-strip__value">
                <AnimatedCounter value={item.value} suffix={item.suffix} />
              </strong>
            </article>
          ))}
        </Reveal>

        <Reveal className="landing-section card showcase-card" delay={150}>
          <SectionLead
            eyebrow="Секции"
            title="Спортивные направления для всех возрастов"
            description="Выберите подходящую секцию из каталога и запишите спортсмена прямо через интерфейс платформы."
          />

          <div className="sport-grid">
            {sportCards.map((item) => (
              <article key={item.title} className="sport-card">
                <div className="sport-card__top">
                  <div>
                    <strong className="sport-card__title">{item.title}</strong>
                    <span className="sport-card__subtitle">{item.subtitle}</span>
                  </div>
                  <StatusPill tone={item.tone}>{item.status}</StatusPill>
                </div>
                <div className="sport-card__footer">
                  <span>{item.meta}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="actions-row">
            <Link className="button" to="/sections">
              Перейти в каталог секций
            </Link>
          </div>
        </Reveal>

        <Reveal className="landing-section card showcase-card" delay={200}>
          <SectionLead
            eyebrow="Расписание"
            title="Планирование тренировок по дням недели"
            description="Просматривайте расписание занятий, контролируйте загрузку залов и тренеров."
          />

          <div className="week-tabs">
            {scheduleTabs.map((tab) => (
              <button
                key={tab.key}
                className={`week-tabs__button${tab.key === activeDay ? ' week-tabs__button--active' : ''}`}
                type="button"
                onClick={() => setActiveDay(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="schedule-preview">
            <table className="schedule-preview__table">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Секция</th>
                  <th>Зал</th>
                  <th>Тренер</th>
                </tr>
              </thead>
              <tbody>
                {activeSchedule.items.map((item) => (
                  <tr key={`${activeSchedule.key}-${item.time}-${item.section}`}>
                    <td>{item.time}</td>
                    <td>{item.section}</td>
                    <td>{item.hall}</td>
                    <td>{item.coach}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="actions-row">
            <Link className="button-secondary" to="/schedule">
              Полное расписание
            </Link>
          </div>
        </Reveal>

        <Reveal className="landing-section card showcase-card" delay={250}>
          <SectionLead
            eyebrow="Достижения"
            title="Результаты и прогресс спортсменов"
            description="Отслеживайте награды, статистику посещаемости и рост показателей воспитанников."
          />

          <div className="achievement-cards">
            {achievementCards.map((item) => (
              <article key={item.title} className="achievement-card">
                <span className="achievement-card__label">{item.title}</span>
                <strong className="achievement-card__value">
                  <AnimatedCounter value={item.metric} suffix={item.suffix} />
                </strong>
                <p className="achievement-card__description">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="actions-row">
            <Link className="button-secondary" to="/achievements">
              Все достижения
            </Link>
          </div>
        </Reveal>

        <Reveal className="landing-section card showcase-card" delay={300}>
          <SectionLead
            eyebrow="Панель управления"
            title="Административный контроль в реальном времени"
            description="Мониторинг посещаемости, управление секциями и быстрый доступ к ключевой статистике."
          />

          <div className="dashboard-preview">
            <aside className="dashboard-preview__sidebar">
              <span className="dashboard-preview__sidebar-title">Меню</span>
              <div className="dashboard-preview__menu">
                {dashboardMenu.map((item, index) => (
                  <span
                    key={item}
                    className={`dashboard-preview__menu-item${index === 0 ? ' dashboard-preview__menu-item--active' : ''}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </aside>

            <div className="dashboard-preview__content">
              <div className="dashboard-preview__stats">
                <div className="dashboard-preview__stat">
                  <span>Тренировок</span>
                  <strong>18</strong>
                </div>
                <div className="dashboard-preview__stat">
                  <span>Активных секций</span>
                  <strong>06</strong>
                </div>
                <div className="dashboard-preview__stat">
                  <span>Уведомлений</span>
                  <strong>04</strong>
                </div>
              </div>

              <table className="dashboard-preview__table">
                <thead>
                  <tr>
                    <th>Спортсмен</th>
                    <th>Секция</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardRows.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{row.section}</td>
                      <td>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="actions-row">
            <Link className="button" to="/admin">
              Открыть панель управления
            </Link>
          </div>
        </Reveal>

        {!isAuthenticated ? (
          <Reveal className="landing-section card showcase-card" delay={350}>
            <SectionLead
              eyebrow="Авторизация"
              title="Войдите в систему для полного доступа"
              description="После входа откроются персональные разделы: профиль, достижения, посещаемость и управление."
            />

            <LoginFormCard
              authFeedback={authFeedback}
              currentRole={currentRole}
              isSyncingData={isSyncingData}
              onSuccess={() => navigate('/profile')}
              profiles={profiles}
              roleOptions={roleOptions}
              setRole={setRole}
              signIn={signIn}
            />
          </Reveal>
        ) : (
          <Reveal className="landing-section card showcase-card" delay={350}>
            <SectionLead
              eyebrow="Профиль"
              title="Добро пожаловать в систему"
              description="Вы авторизованы и имеете доступ ко всем разделам платформы согласно вашей роли."
            />

            <div className="card showcase-card--inner">
              <div className="card__header">
                <div>
                  <h2 className="card__title">Активная сессия</h2>
                  <p className="card__description">
                    Продолжите работу в личном кабинете или перейдите к нужному разделу.
                  </p>
                </div>
                <StatusPill tone="success">{roleLabels[currentRole]}</StatusPill>
              </div>

              <div className="summary-list">
                <div className="summary-list__item">
                  <span className="summary-list__label">Пользователь</span>
                  <span className="summary-list__value">{currentUser.fullName}</span>
                </div>
                <div className="summary-list__item">
                  <span className="summary-list__label">E-mail</span>
                  <span className="summary-list__value">{currentUser.email}</span>
                </div>
                <div className="summary-list__item">
                  <span className="summary-list__label">Должность</span>
                  <span className="summary-list__value">{currentUser.position}</span>
                </div>
              </div>

              <div className="landing-hero__actions">
                <Link className="button" to="/profile">
                  Личный кабинет
                </Link>
                <Link className="button-secondary" to="/schedule">
                  Расписание
                </Link>
              </div>
            </div>
          </Reveal>
        )}

        <Reveal className="landing-section card showcase-card" delay={400}>
          <SectionLead
            eyebrow="Роли"
            title="Система разграничения доступа"
            description="Каждая роль открывает определенный набор возможностей и разделов платформы."
          />

          <div className="role-pill-grid">
            {roleOptions.map((role) => (
              <article key={role.value} className="role-pill-card">
                <StatusPill tone={role.value === currentRole ? 'success' : 'neutral'}>
                  {role.label}
                </StatusPill>
                <p className="role-pill-card__description">{role.summary}</p>
              </article>
            ))}
          </div>

          <div className="landing-hero__actions">
            <Link className="button-secondary" to="/sections">
              Каталог секций
            </Link>
            <Link className="button" to={isAuthenticated ? '/profile' : '/register'}>
              {isAuthenticated ? 'Личный кабинет' : 'Создать аккаунт'}
            </Link>
          </div>
        </Reveal>
      </div>
    </>
  )
}

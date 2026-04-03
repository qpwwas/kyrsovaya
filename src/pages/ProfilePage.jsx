import { Link } from 'react-router-dom'
import { ProfileFormCard } from '../components/auth/ProfileFormCard'
import { PageHeader } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
import { StatCard } from '../components/StatCard'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../context/useAppState'
import { roleLabels } from '../utils/format'

function getRoleActions(currentRole) {
  const commonActions = [
    {
      to: '/sections',
      title: 'Каталог секций',
      description: 'Просмотр направлений, тренеров и свободных мест.',
    },
    {
      to: '/schedule',
      title: 'Расписание',
      description: 'Ближайшие тренировки и изменения по залам.',
    },
  ]

  if (currentRole === 'admin') {
    return [
      ...commonActions,
      {
        to: '/admin',
        title: 'Панель управления',
        description: 'Статистика, секции, тренеры и участники.',
      },
      {
        to: '/attendance',
        title: 'Посещаемость',
        description: 'Журналы и статусы по тренировкам.',
      },
    ]
  }

  if (currentRole === 'coach') {
    return [
      ...commonActions,
      {
        to: '/attendance',
        title: 'Журнал посещаемости',
        description: 'Отметка присутствия и работа с группами.',
      },
      {
        to: '/achievements',
        title: 'Достижения',
        description: 'Результаты и прогресс спортсменов.',
      },
    ]
  }

  return [
    ...commonActions,
    {
      to: '/attendance',
      title: 'Моя посещаемость',
      description: 'Личный журнал и история присутствия.',
    },
    {
      to: '/achievements',
      title: 'Мои достижения',
      description: 'Результаты, награды и прогресс.',
    },
  ]
}

export function ProfilePage() {
  const {
    currentRole,
    currentUser,
    isSyncingData,
    managedParticipantIds,
    participantsById,
    profileFeedback,
    stats,
    updateProfile,
  } = useAppState()

  const managedNames = managedParticipantIds
    .map((participantId) => participantsById[participantId]?.name)
    .filter(Boolean)

  const actions = getRoleActions(currentRole)

  return (
    <>
      <PageHeader
        eyebrow="Личный кабинет"
        title={
          <>
            Профиль
            <span className="accent-text"> пользователя</span>
          </>
        }
        description="Управление личными данными, контактной информацией и быстрый доступ к основным разделам платформы."
      />

      <div className="page-grid page-grid--two">
        <Reveal delay={0}>
          <ProfileFormCard
            key={`${currentUser.email}-${currentUser.fullName}-${currentUser.phone}`}
            currentUser={currentUser}
            isSyncingData={isSyncingData}
            profileFeedback={profileFeedback}
            updateProfile={updateProfile}
          />
        </Reveal>

        <Reveal className="card" delay={50}>
          <div className="card__header">
            <div>
              <h2 className="card__title">Информация об аккаунте</h2>
              <p className="card__description">
                Текущая роль и доступные возможности в системе.
              </p>
            </div>
            <StatusPill tone="success">{roleLabels[currentRole]}</StatusPill>
          </div>

          <div className="summary-list">
            <div className="summary-list__item">
              <span className="summary-list__label">E-mail</span>
              <span className="summary-list__value">{currentUser.email}</span>
            </div>
            <div className="summary-list__item">
              <span className="summary-list__label">Должность</span>
              <span className="summary-list__value">{currentUser.position}</span>
            </div>
            <div className="summary-list__item">
              <span className="summary-list__label">Телефон</span>
              <span className="summary-list__value">{currentUser.phone}</span>
            </div>
            <div className="summary-list__item">
              <span className="summary-list__label">Экстренная связь</span>
              <span className="summary-list__value">{currentUser.emergencyContact}</span>
            </div>
            {managedNames.length > 0 && (
              <div className="summary-list__item">
                <span className="summary-list__label">Привязанные спортсмены</span>
                <span className="summary-list__value">{managedNames.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="divider" />

          <div className="quick-links">
            {actions.map((action) => (
              <Link key={action.to} className="quick-link" to={action.to}>
                <strong className="quick-link__title">{action.title}</strong>
                <span className="quick-link__description">{action.description}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal className="stats-grid" delay={100}>
        <StatCard
          label="Секций"
          value={stats.sectionCount}
          hint="Доступны для просмотра и записи"
        />
        <StatCard
          label="Тренировок сегодня"
          value={stats.trainingsToday}
          hint="По текущему расписанию"
        />
        <StatCard
          label="Участников"
          value={stats.participantCount}
          hint="Общее число спортсменов"
        />
        <StatCard
          label="Тренеров"
          value={stats.coachCount}
          hint="Активные тренеры секций"
        />
      </Reveal>
    </>
  )
}

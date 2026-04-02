import { Link } from 'react-router-dom'
import { ProfileFormCard } from '../components/auth/ProfileFormCard'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../context/useAppState'
import { roleLabels } from '../utils/format'

function getRoleActions(currentRole) {
  const commonActions = [
    {
      to: '/sections',
      title: 'Каталог секций',
      description: 'Просмотр доступных направлений, тренеров и свободных мест.',
    },
    {
      to: '/schedule',
      title: 'Расписание',
      description: 'Проверка ближайших тренировок и изменений по залам.',
    },
  ]

  if (currentRole === 'admin') {
    return [
      ...commonActions,
      {
        to: '/admin',
        title: 'Админ-панель',
        description: 'Общая статистика, секции, тренеры и участники.',
      },
      {
        to: '/attendance',
        title: 'Посещаемость',
        description: 'Контроль журналов и статусов по тренировкам.',
      },
    ]
  }

  if (currentRole === 'coach') {
    return [
      ...commonActions,
      {
        to: '/attendance',
        title: 'Журнал посещаемости',
        description: 'Отметка присутствия и работа с участниками групп.',
      },
      {
        to: '/achievements',
        title: 'Достижения',
        description: 'Просмотр результатов спортсменов и прогресса.',
      },
    ]
  }

  return [
    ...commonActions,
    {
      to: '/attendance',
      title: 'Моя посещаемость',
      description: 'Личный журнал и история присутствия на тренировках.',
    },
    {
      to: '/achievements',
      title: 'Мои достижения',
      description: 'Результаты, награды и спортивный прогресс.',
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
        title="Профиль пользователя"
        description="Отдельная страница профиля помогает держать личные данные отдельно от главной панели и делает сценарий работы заметно чище."
      />

      <div className="page-grid page-grid--two">
        <ProfileFormCard
          key={`${currentUser.email}-${currentUser.fullName}-${currentUser.phone}`}
          currentUser={currentUser}
          isSyncingData={isSyncingData}
          profileFeedback={profileFeedback}
          updateProfile={updateProfile}
        />

        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">Сводка по аккаунту</h2>
              <p className="card__description">
                Ключевая информация о текущей роли и доступных возможностях.
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
            {managedNames.length ? (
              <div className="summary-list__item">
                <span className="summary-list__label">Привязанные спортсмены</span>
                <span className="summary-list__value">{managedNames.join(', ')}</span>
              </div>
            ) : null}
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
        </section>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Секций"
          value={stats.sectionCount}
          hint="Доступны в системе для просмотра и записи"
        />
        <StatCard
          label="Тренировок сегодня"
          value={stats.trainingsToday}
          hint="По текущему расписанию"
        />
        <StatCard
          label="Участников"
          value={stats.participantCount}
          hint="Общее число спортсменов в базе"
        />
        <StatCard
          label="Тренеров"
          value={stats.coachCount}
          hint="Активные тренеры спортивных секций"
        />
      </div>
    </>
  )
}

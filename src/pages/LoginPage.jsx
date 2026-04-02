import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LoginFormCard } from '../components/auth/LoginFormCard'
import { PageHeader } from '../components/PageHeader'
import { useAppState } from '../context/useAppState'

function getRedirectPath(location) {
  const nextPath = location.state?.from?.pathname

  if (!nextPath || nextPath === '/login' || nextPath === '/register') {
    return '/'
  }

  return nextPath
}

export function LoginPage() {
  const {
    authFeedback,
    currentRole,
    isAuthenticated,
    isSyncingData,
    profiles,
    roleOptions,
    setRole,
    signIn,
  } = useAppState()
  const location = useLocation()
  const navigate = useNavigate()
  const redirectPath = getRedirectPath(location)

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return (
    <>
      <PageHeader
        eyebrow="Авторизация"
        title="Отдельная страница входа"
        description="Минималистичный сценарий входа без перегруженной главной страницы. Здесь собраны только авторизация и быстрый доступ к демо-аккаунтам."
        action={
          <Link className="button-secondary" to="/register">
            Перейти к регистрации
          </Link>
        }
      />

      <div className="auth-grid">
        <section className="card auth-aside">
          <div className="card__header">
            <div>
              <h2 className="card__title">Что можно сделать после входа</h2>
              <p className="card__description">
                После авторизации система откроет только те разделы, которые доступны для выбранной роли.
              </p>
            </div>
          </div>

          <ul className="auth-page__list">
            <li>Администратор получает статистику, секции, тренеров и контроль расписания.</li>
            <li>Тренер управляет тренировками, составом групп и посещаемостью.</li>
            <li>Спортсмен видит свои достижения, секции и личное расписание.</li>
            <li>Родитель следит за прогрессом ребенка и уведомлениями по расписанию.</li>
          </ul>

          <div className="auth-page__actions">
            <Link className="button" to="/">
              Вернуться на главную
            </Link>
            <Link className="button-ghost" to="/register">
              Создать новый аккаунт
            </Link>
          </div>
        </section>

        <LoginFormCard
          key={currentRole}
          authFeedback={authFeedback}
          currentRole={currentRole}
          isSyncingData={isSyncingData}
          onSuccess={() => navigate(redirectPath, { replace: true })}
          profiles={profiles}
          roleOptions={roleOptions}
          setRole={setRole}
          signIn={signIn}
        />
      </div>
    </>
  )
}

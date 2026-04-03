import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LoginFormCard } from '../components/auth/LoginFormCard'
import { PageHeader } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
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
        title={
          <>
            Вход в
            <span className="accent-text"> SportSpace</span>
          </>
        }
        description="Войдите в систему для доступа к личному кабинету, расписанию и управлению секциями."
        action={
          <Link className="button-secondary" to="/register">
            Создать аккаунт
          </Link>
        }
      />

      <div className="auth-grid">
        <Reveal className="card auth-aside" delay={0}>
          <div className="card__header">
            <div>
              <h2 className="card__title">Возможности после входа</h2>
              <p className="card__description">
                Доступ к разделам зависит от вашей роли в системе.
              </p>
            </div>
          </div>

          <ul className="auth-page__list">
            <li>
              <strong>Администратор</strong> получает полную статистику, управление секциями и контроль расписания.
            </li>
            <li>
              <strong>Тренер</strong> управляет тренировками, составом групп и отмечает посещаемость.
            </li>
            <li>
              <strong>Спортсмен</strong> видит свои достижения, секции и персональное расписание.
            </li>
            <li>
              <strong>Родитель</strong> отслеживает прогресс ребенка и получает уведомления.
            </li>
          </ul>

          <div className="auth-page__actions">
            <Link className="button" to="/">
              На главную
            </Link>
            <Link className="button-ghost" to="/register">
              Регистрация
            </Link>
          </div>
        </Reveal>

        <Reveal delay={100}>
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
        </Reveal>
      </div>
    </>
  )
}

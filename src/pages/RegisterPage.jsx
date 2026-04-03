import { Link, Navigate, useNavigate } from 'react-router-dom'
import { RegistrationFormCard } from '../components/auth/RegistrationFormCard'
import { PageHeader } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
import { useAppState } from '../context/useAppState'

export function RegisterPage() {
  const { authFeedback, isAuthenticated, isSyncingData, registerUser } = useAppState()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />
  }

  return (
    <>
      <PageHeader
        eyebrow="Регистрация"
        title={
          <>
            Создайте аккаунт в
            <span className="accent-text"> SportSpace</span>
          </>
        }
        description="Зарегистрируйтесь для доступа ко всем возможностям платформы управления спортивными секциями."
        action={
          <Link className="button-secondary" to="/login">
            Уже есть аккаунт
          </Link>
        }
      />

      <div className="auth-grid">
        <Reveal className="card auth-aside" delay={0}>
          <div className="card__header">
            <div>
              <h2 className="card__title">Кого можно зарегистрировать</h2>
              <p className="card__description">
                Публичная регистрация доступна для спортсменов и родителей.
              </p>
            </div>
          </div>

          <ul className="auth-page__list">
            <li>
              <strong>Спортсмен</strong> получает личный кабинет, отслеживание достижений и возможность записи в секции.
            </li>
            <li>
              <strong>Родитель</strong> получает кабинет с привязанной карточкой ребенка и уведомлениями.
            </li>
            <li>
              Контактные данные можно уточнить сразу при регистрации или изменить позже в профиле.
            </li>
            <li>
              После успешной регистрации вы автоматически войдете в систему.
            </li>
          </ul>

          <div className="auth-page__actions">
            <Link className="button" to="/login">
              Перейти ко входу
            </Link>
            <Link className="button-ghost" to="/">
              На главную
            </Link>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <RegistrationFormCard
            authFeedback={authFeedback}
            isSyncingData={isSyncingData}
            onSuccess={() => navigate('/profile', { replace: true })}
            registerUser={registerUser}
          />
        </Reveal>
      </div>
    </>
  )
}

import { Link, Navigate, useNavigate } from 'react-router-dom'
import { RegistrationFormCard } from '../components/auth/RegistrationFormCard'
import { PageHeader } from '../components/PageHeader'
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
        title="Отдельная страница создания аккаунта"
        description="Регистрация вынесена в самостоятельный экран, чтобы сценарий был понятнее и чище: пользователь заполняет только нужные поля без лишнего шума."
        action={
          <Link className="button-secondary" to="/login">
            Уже есть аккаунт
          </Link>
        }
      />

      <div className="auth-grid">
        <section className="card auth-aside">
          <div className="card__header">
            <div>
              <h2 className="card__title">Кого можно зарегистрировать</h2>
              <p className="card__description">
                Публичная регистрация открыта только для спортсмена и родителя. Тренер и администратор создаются отдельно.
              </p>
            </div>
          </div>

          <ul className="auth-page__list">
            <li>Спортсмен получает личный кабинет, достижения и возможность записи в секции.</li>
            <li>Родитель получает кабинет и привязанную карточку ребенка.</li>
            <li>Контакты и заметки можно сразу уточнить и потом изменить в профиле.</li>
            <li>После успешной регистрации пользователь автоматически входит в систему.</li>
          </ul>

          <div className="auth-page__actions">
            <Link className="button" to="/login">
              Перейти ко входу
            </Link>
            <Link className="button-ghost" to="/">
              На главную
            </Link>
          </div>
        </section>

        <RegistrationFormCard
          authFeedback={authFeedback}
          isSyncingData={isSyncingData}
          onSuccess={() => navigate('/profile', { replace: true })}
          registerUser={registerUser}
        />
      </div>
    </>
  )
}

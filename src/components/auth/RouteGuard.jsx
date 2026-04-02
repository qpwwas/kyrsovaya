import { Link, Outlet } from 'react-router-dom'
import { StatusPill } from '../StatusPill'
import { useAppState } from '../../context/useAppState'
import { roleLabels } from '../../utils/format'

export function RouteGuard({ allowedRoles }) {
  const { currentRole, isAuthenticated, isBootstrapping } = useAppState()

  if (isBootstrapping) {
    return (
      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Проверка доступа</h2>
            <p className="card__description">
              Система восстанавливает сессию и проверяет права пользователя.
            </p>
          </div>
          <StatusPill tone="info">Загрузка</StatusPill>
        </div>
      </section>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Нужна авторизация</h2>
            <p className="card__description">
              Этот раздел открывается только после входа в систему.
            </p>
          </div>
          <StatusPill tone="warning">Доступ закрыт</StatusPill>
        </div>

        <div className="actions-row">
          <Link className="button" to="/">
            Перейти на главную
          </Link>
        </div>
      </section>
    )
  }

  if (allowedRoles?.length && !allowedRoles.includes(currentRole)) {
    return (
      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Недостаточно прав</h2>
            <p className="card__description">
              Для этого раздела требуется другая роль. Сейчас активен кабинет "
              {roleLabels[currentRole]}".
            </p>
          </div>
          <StatusPill tone="warning">Ограничение по роли</StatusPill>
        </div>

        <div className="actions-row">
          <Link className="button-secondary" to="/">
            Вернуться на главную
          </Link>
        </div>
      </section>
    )
  }

  return <Outlet />
}

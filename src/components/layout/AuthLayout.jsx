import { Link, Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-shell__frame">
        <header className="auth-shell__header">
          <Link className="auth-shell__brand" to="/">
            SportSpace Manager
          </Link>

          <div className="actions-row">
            <Link className="button-secondary" to="/">
              Главная
            </Link>
            <Link className="button-secondary" to="/sections">
              Секции
            </Link>
          </div>
        </header>

        <main className="auth-shell__body">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

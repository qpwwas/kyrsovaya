import { Link, Outlet } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'

export function AuthLayout() {
  return (
    <div className="auth-shell">
      <header className="topbar topbar--auth">
        <div className="topbar__row">
          <Link className="brand brand--compact" to="/">
            <span className="brand__eyebrow">SportSpace</span>
            <span className="brand__title">Manager</span>
          </Link>

          <nav className="shell-nav" aria-label="Навигация авторизации">
            <Link className="shell-nav__link" to="/">
              Главная
            </Link>
            <Link className="shell-nav__link" to="/sections">
              Секции
            </Link>
            <Link className="shell-nav__link" to="/schedule">
              Расписание
            </Link>
          </nav>

          <div className="topbar__controls">
            <Link className="button-secondary" to="/login">
              Вход
            </Link>
            <Link className="button" to="/register">
              Регистрация
            </Link>
          </div>
        </div>
      </header>

      <main className="auth-shell__body">
        <div className="page-stack">
          <Outlet />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

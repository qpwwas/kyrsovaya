import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAppState } from '../../context/useAppState'
import { roleLabels } from '../../utils/format'
import { StatusPill } from '../StatusPill'
import { SiteFooter } from './SiteFooter'

function getNavItems(isAuthenticated, currentRole) {
  const items = [
    { to: '/', label: 'Главная' },
    { to: '/sections', label: 'Секции' },
    { to: '/schedule', label: 'Расписание' },
  ]

  if (isAuthenticated) {
    items.push({ to: '/achievements', label: 'Достижения' })
    items.push({ to: '/attendance', label: 'Посещаемость' })
    items.push({ to: '/profile', label: 'Профиль' })

    if (currentRole === 'admin') {
      items.push({ to: '/admin', label: 'Дашборд' })
    }
  }

  return items
}

export function AppLayout() {
  const { currentRole, isAuthenticated, isBootstrapping, isSyncingData, signOut } = useAppState()
  const navItems = getNavItems(isAuthenticated, currentRole)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__row">
          <Link className="brand brand--compact" to="/">
            <span className="brand__eyebrow">SportSpace</span>
            <span className="brand__title">Manager</span>
          </Link>

          <nav className="shell-nav" aria-label="Основная навигация">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `shell-nav__link${isActive ? ' shell-nav__link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="topbar__controls">
            <StatusPill tone={isSyncingData || isBootstrapping ? 'info' : 'success'}>
              {isBootstrapping ? 'Загрузка' : isSyncingData ? 'Синхронизация' : 'Онлайн'}
            </StatusPill>

            {isAuthenticated ? (
              <>
                <StatusPill tone="neutral">{roleLabels[currentRole]}</StatusPill>
                <Link className="button-secondary" to="/profile">
                  Профиль
                </Link>
                <button className="button" type="button" onClick={signOut}>
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link className="button-secondary" to="/login">
                  Вход
                </Link>
                <Link className="button" to="/register">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="app-shell__body">
        <div className="page-stack">
          <Outlet />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

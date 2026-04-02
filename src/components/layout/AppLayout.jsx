import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAppState } from '../../context/useAppState'
import { roleLabels } from '../../utils/format'
import { NotificationList } from '../NotificationList'
import { StatCard } from '../StatCard'
import { StatusPill } from '../StatusPill'

function getNavItems(isAuthenticated, currentRole) {
  const items = [
    { to: '/', label: 'Главная' },
    { to: '/sections', label: 'Секции' },
    { to: '/schedule', label: 'Расписание' },
  ]

  if (isAuthenticated) {
    items.push({ to: '/profile', label: 'Профиль' })
    items.push({ to: '/attendance', label: 'Посещаемость' })
    items.push({ to: '/achievements', label: 'Достижения' })

    if (currentRole === 'admin') {
      items.push({ to: '/admin', label: 'Админ-панель' })
    }
  } else {
    items.push({ to: '/login', label: 'Вход' })
    items.push({ to: '/register', label: 'Регистрация' })
  }

  return items
}

export function AppLayout() {
  const {
    currentRole,
    currentUser,
    isAuthenticated,
    isBootstrapping,
    isSyncingData,
    notifications,
    signOut,
    stats,
  } = useAppState()

  const navItems = getNavItems(isAuthenticated, currentRole)

  return (
    <div className="app-shell">
      <div className="app-shell__frame">
        <header className="topbar">
          <div className="topbar__row">
            <div className="brand">
              <span className="brand__eyebrow">Курсовой проект</span>
              <h1 className="brand__title">SportSpace Manager</h1>
              <p className="brand__subtitle">
                Система управления спортивными секциями, расписанием тренировок,
                посещаемостью и личными кабинетами пользователей.
              </p>
            </div>

            <div className="topbar__controls">
              <StatusPill tone={isAuthenticated ? 'success' : 'neutral'}>
                {isAuthenticated ? roleLabels[currentRole] : 'Публичный режим'}
              </StatusPill>
              <StatusPill tone={isSyncingData || isBootstrapping ? 'info' : 'neutral'}>
                {isBootstrapping ? 'Загрузка' : isSyncingData ? 'Синхронизация' : 'Готово'}
              </StatusPill>

              {isAuthenticated ? (
                <button className="button-secondary" type="button" onClick={signOut}>
                  Выйти
                </button>
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
        </header>

        <div className="app-shell__body">
          <main className="page-stack">
            <Outlet />
          </main>

          <aside className="sidebar">
            <section className="sidebar-panel">
              <div className="sidebar-panel__header">
                <div>
                  <h2 className="sidebar-panel__title">
                    {isAuthenticated ? 'Аккаунт' : 'Публичный доступ'}
                  </h2>
                  <p className="sidebar-panel__description">
                    {isAuthenticated
                      ? currentUser.fullName
                      : 'Каталог секций и расписание доступны без входа.'}
                  </p>
                </div>
                <StatusPill tone={isAuthenticated ? 'success' : 'neutral'}>
                  {isAuthenticated ? currentUser.position : 'Гость'}
                </StatusPill>
              </div>

              {isAuthenticated ? (
                <div className="summary-list">
                  <div className="summary-list__item">
                    <span className="summary-list__label">E-mail</span>
                    <span className="summary-list__value">{currentUser.email}</span>
                  </div>
                  <div className="summary-list__item">
                    <span className="summary-list__label">Телефон</span>
                    <span className="summary-list__value">{currentUser.phone}</span>
                  </div>
                  <div className="summary-list__item">
                    <span className="summary-list__label">Экстренная связь</span>
                    <span className="summary-list__value">{currentUser.emergencyContact}</span>
                  </div>
                </div>
              ) : (
                <ul className="mini-list">
                  <li>Отдельные страницы входа и регистрации вынесены из главной панели.</li>
                  <li>Личные разделы открываются только после авторизации.</li>
                  <li>Публичные секции и расписание доступны всем посетителям.</li>
                </ul>
              )}
            </section>

            <section className="sidebar-panel">
              <div className="sidebar-panel__header">
                <div>
                  <h2 className="sidebar-panel__title">Ключевые показатели</h2>
                  <p className="sidebar-panel__description">
                    Быстрая сводка по секциям, тренировкам и участникам.
                  </p>
                </div>
              </div>

              <div className="sidebar-metrics">
                <StatCard
                  label="Тренировок сегодня"
                  value={stats.trainingsToday}
                  hint="По текущему расписанию"
                />
                <StatCard
                  label="Секций"
                  value={stats.sectionCount}
                  hint="Доступны в каталоге"
                />
                <StatCard
                  label="Тренеров"
                  value={stats.coachCount}
                  hint="Активные специалисты"
                />
              </div>
            </section>

            <section className="sidebar-panel">
              <div className="sidebar-panel__header">
                <div>
                  <h2 className="sidebar-panel__title">Уведомления</h2>
                  <p className="sidebar-panel__description">
                    Последние изменения по расписанию, секциям и профилям.
                  </p>
                </div>
              </div>

              <NotificationList notifications={notifications.slice(0, 4)} />
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

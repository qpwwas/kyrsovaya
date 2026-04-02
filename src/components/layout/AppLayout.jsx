import { NavLink, Outlet } from 'react-router-dom'
import { useAppState } from '../../context/useAppState'
import { roleLabels } from '../../utils/format'
import { NotificationList } from '../NotificationList'
import { StatCard } from '../StatCard'
import { StatusPill } from '../StatusPill'

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/sections', label: 'Секции' },
  { to: '/schedule', label: 'Расписание' },
  { to: '/attendance', label: 'Посещаемость' },
  { to: '/achievements', label: 'Достижения' },
  { to: '/admin', label: 'Админ-панель' },
]

export function AppLayout() {
  const {
    currentRole,
    currentUser,
    isAuthenticated,
    isBootstrapping,
    isSyncingData,
    notifications,
    roleOptions,
    setRole,
    signOut,
    stats,
  } = useAppState()

  return (
    <div className="app-shell">
      <div className="app-shell__frame">
        <header className="topbar">
          <div className="topbar__row">
            <div className="brand">
              <span className="brand__eyebrow">Курсовой проект</span>
              <h1 className="brand__title">SportSpace Manager</h1>
              <p className="brand__subtitle">
                Управление спортивными секциями, тренировками, залами и личными
                кабинетами с реальными данными из backend API.
              </p>
            </div>

            <div className="topbar__controls">
              <StatusPill tone={isAuthenticated ? 'success' : 'warning'}>
                {isAuthenticated ? roleLabels[currentRole] : 'Гостевой режим'}
              </StatusPill>
              <StatusPill tone={isSyncingData || isBootstrapping ? 'info' : 'neutral'}>
                {isBootstrapping
                  ? 'загрузка'
                  : isSyncingData
                    ? 'синхронизация'
                    : 'готово'}
              </StatusPill>

              {isAuthenticated ? (
                <button className="button-secondary" type="button" onClick={signOut}>
                  Выйти
                </button>
              ) : (
                <div className="field role-switch">
                  <label htmlFor="role-mode">Демо-режим</label>
                  <select
                    id="role-mode"
                    value={currentRole}
                    onChange={(event) => setRole(event.target.value)}
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                    {isAuthenticated ? 'Активный профиль' : 'Гостевой режим'}
                  </h2>
                  <p className="sidebar-panel__description">
                    {isAuthenticated ? currentUser.fullName : roleLabels[currentRole]}
                  </p>
                </div>
                <StatusPill tone={isAuthenticated ? 'success' : 'warning'}>
                  {isAuthenticated ? currentUser.position : 'Без авторизации'}
                </StatusPill>
              </div>

              {isAuthenticated ? (
                <ul className="mini-list">
                  <li>{currentUser.email}</li>
                  <li>{currentUser.phone}</li>
                  <li>{currentUser.emergencyContact}</li>
                </ul>
              ) : (
                <ul className="mini-list">
                  <li>доступны публичные секции и расписание тренировок</li>
                  <li>личные разделы открываются после входа или регистрации</li>
                  <li>демо-роль можно переключить в верхней панели</li>
                </ul>
              )}
            </section>

            <section className="sidebar-panel">
              <div className="sidebar-panel__header">
                <div>
                  <h2 className="sidebar-panel__title">Быстрая статистика</h2>
                  <p className="sidebar-panel__description">
                    Сводка по секциям, тренировкам и тренерскому составу
                  </p>
                </div>
              </div>

              <div className="sidebar-metrics">
                <StatCard
                  label="Тренировок сегодня"
                  value={stats.trainingsToday}
                  hint="По текущему расписанию из API"
                />
                <StatCard
                  label="Секций в системе"
                  value={stats.sectionCount}
                  hint="Доступны для просмотра и записи"
                />
                <StatCard
                  label="Тренеров"
                  value={stats.coachCount}
                  hint="Учитываются по активным секциям"
                />
              </div>
            </section>

            <section className="sidebar-panel">
              <div className="sidebar-panel__header">
                <div>
                  <h2 className="sidebar-panel__title">Уведомления</h2>
                  <p className="sidebar-panel__description">
                    События интерфейса и результаты последних действий
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

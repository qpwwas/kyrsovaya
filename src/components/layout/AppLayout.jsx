import { NavLink, Outlet } from 'react-router-dom'
import { NotificationList } from '../NotificationList'
import { StatCard } from '../StatCard'
import { StatusPill } from '../StatusPill'
import { useAppState } from '../../context/useAppState'
import { roleLabels } from '../../utils/format'

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
    notifications,
    roleOptions,
    setRole,
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
                кабинетами с разными ролями пользователей.
              </p>
            </div>

            <div className="topbar__controls">
              <StatusPill tone="info">{roleLabels[currentRole]}</StatusPill>
              <div className="field role-switch">
                <label htmlFor="role-mode">Режим просмотра</label>
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
                  <h2 className="sidebar-panel__title">Активный профиль</h2>
                  <p className="sidebar-panel__description">
                    {currentUser.fullName}
                  </p>
                </div>
                <StatusPill tone="success">{currentUser.position}</StatusPill>
              </div>

              <ul className="mini-list">
                <li>{currentUser.email}</li>
                <li>{currentUser.phone}</li>
                <li>{currentUser.emergencyContact}</li>
              </ul>
            </section>

            <section className="sidebar-panel">
              <div className="sidebar-panel__header">
                <div>
                  <h2 className="sidebar-panel__title">Быстрая статистика</h2>
                  <p className="sidebar-panel__description">
                    Сводка для администратора и тренерского штаба
                  </p>
                </div>
              </div>

              <div className="sidebar-metrics">
                <StatCard
                  label="Тренировок сегодня"
                  value={stats.trainingsToday}
                  hint="Все активные слоты на текущий день"
                />
                <StatCard
                  label="Секций в системе"
                  value={stats.sectionCount}
                  hint="Доступны для просмотра и записи"
                />
                <StatCard
                  label="Тренеров"
                  value={stats.coachCount}
                  hint="Под контролем административной панели"
                />
              </div>
            </section>

            <section className="sidebar-panel">
              <div className="sidebar-panel__header">
                <div>
                  <h2 className="sidebar-panel__title">Уведомления</h2>
                  <p className="sidebar-panel__description">
                    Изменения расписания и статус важных действий
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

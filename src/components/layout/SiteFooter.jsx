import { Link } from 'react-router-dom'

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <span className="site-footer__eyebrow">SportSpace Manager</span>
          <p className="site-footer__copy">
            Современная платформа для управления спортивными секциями, расписанием тренировок
            и отслеживания достижений спортсменов.
          </p>
          <span className="inline-note" style={{ marginTop: 8 }}>
            {currentYear} SportSpace. Все права защищены.
          </span>
        </div>

        <div className="site-footer__links">
          <span className="site-footer__title">Навигация</span>
          <Link to="/">Главная</Link>
          <Link to="/sections">Секции</Link>
          <Link to="/schedule">Расписание</Link>
          <Link to="/achievements">Достижения</Link>
        </div>

        <div className="site-footer__links">
          <span className="site-footer__title">Аккаунт</span>
          <Link to="/login">Вход</Link>
          <Link to="/register">Регистрация</Link>
          <Link to="/profile">Профиль</Link>
          <Link to="/admin">Панель управления</Link>
        </div>
      </div>
    </footer>
  )
}

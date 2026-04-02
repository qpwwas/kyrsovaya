import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <span className="site-footer__eyebrow">SportSpace Manager</span>
          <p className="site-footer__copy">
            Курсовой проект по управлению спортивными секциями, расписанием тренировок
            и личными кабинетами пользователей.
          </p>
        </div>

        <div className="site-footer__links">
          <span className="site-footer__title">Навигация</span>
          <Link to="/">Главная</Link>
          <Link to="/sections">Секции</Link>
          <Link to="/schedule">Расписание</Link>
          <Link to="/login">Вход</Link>
        </div>

        <div className="site-footer__links">
          <span className="site-footer__title">Соцсети</span>
          <a href="https://github.com/qpwwas/kyrsovaya" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://t.me" target="_blank" rel="noreferrer">
            Telegram
          </a>
          <a href="https://vk.com" target="_blank" rel="noreferrer">
            VK
          </a>
        </div>
      </div>
    </footer>
  )
}

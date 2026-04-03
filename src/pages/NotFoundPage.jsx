import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Страница не найдена</h1>
        <p className="not-found-description">
          Запрашиваемая страница не существует или была перемещена. 
          Вернитесь на главную и продолжите работу с системой.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="button button--primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            На главную
          </Link>
          <Link to="/sections" className="button button--secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Секции
          </Link>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="not-found-decoration">
        <div className="decoration-circle decoration-circle--1"></div>
        <div className="decoration-circle decoration-circle--2"></div>
        <div className="decoration-circle decoration-circle--3"></div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'

export function NotFoundPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ошибка маршрута"
        title="Страница не найдена"
        description="Для курсовой это отдельный обязательный сценарий. Пользователь получает понятную навигацию вместо пустого экрана."
      />

      <section className="card">
        <div className="empty-state">
          Неверный адрес страницы. Вернитесь в основной интерфейс и продолжите
          работу с секциями и расписанием.
          <div className="actions-row" style={{ justifyContent: 'center', marginTop: 18 }}>
            <Link className="button" to="/">
              На главную
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

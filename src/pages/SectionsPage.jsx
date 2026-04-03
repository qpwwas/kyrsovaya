import { useDeferredValue, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
import { SectionCard } from '../components/SectionCard'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../context/useAppState'

export function SectionsPage() {
  const { currentRole, enrollInSection, managedParticipantIds, sections } = useAppState()
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase())

  const filteredSections = sections.filter((section) => {
    const matchesQuery =
      !deferredQuery ||
      section.name.toLowerCase().includes(deferredQuery) ||
      section.description.toLowerCase().includes(deferredQuery) ||
      section.coach.toLowerCase().includes(deferredQuery)
    const matchesLevel =
      levelFilter === 'all' || section.level.toLowerCase().includes(levelFilter)
    const matchesAvailability =
      !onlyAvailable || section.participantIds.length < section.capacity

    return matchesQuery && matchesLevel && matchesAvailability
  })

  return (
    <>
      <PageHeader
        eyebrow="Каталог секций"
        title={
          <>
            Спортивные направления
            <span className="accent-text"> для всех возрастов</span>
          </>
        }
        description="Выбирайте секцию, изучайте информацию о тренерах и залах, записывайте спортсменов прямо через интерфейс платформы."
        action={
          <StatusPill tone={['athlete', 'parent'].includes(currentRole) ? 'success' : 'warning'}>
            {['athlete', 'parent'].includes(currentRole)
              ? 'Запись доступна'
              : 'Режим просмотра'}
          </StatusPill>
        }
      />

      <Reveal className="card" delay={0}>
        <div className="card__header">
          <div>
            <h2 className="card__title">Поиск и фильтры</h2>
            <p className="card__description">
              Найдите подходящую секцию по названию, тренеру или уровню подготовки.
            </p>
          </div>
        </div>

        <div className="form-grid form-grid--two">
          <div className="field">
            <label htmlFor="section-search">Поиск по секциям</label>
            <input
              id="section-search"
              value={searchQuery}
              placeholder="Название секции или имя тренера..."
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="section-level">Уровень подготовки</label>
            <select
              id="section-level"
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
            >
              <option value="all">Все уровни</option>
              <option value="начальный">Начальный</option>
              <option value="средний">Средний</option>
              <option value="продвинутый">Продвинутый</option>
            </select>
          </div>
        </div>

        <div className="actions-row" style={{ marginTop: 16 }}>
          <label className="inline-note" htmlFor="available-only" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              id="available-only"
              type="checkbox"
              checked={onlyAvailable}
              onChange={(event) => setOnlyAvailable(event.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            Только секции со свободными местами
          </label>
        </div>
      </Reveal>

      <section className="section-list">
        {filteredSections.length ? (
          filteredSections.map((section, index) => {
            const isEnrolled = managedParticipantIds.some((participantId) =>
              section.participantIds.includes(participantId),
            )
            const canEnroll =
              ['athlete', 'parent'].includes(currentRole) &&
              !isEnrolled &&
              section.participantIds.length < section.capacity

            return (
              <Reveal key={section.id} delay={50 + index * 30}>
                <SectionCard
                  section={section}
                  participantsCount={section.participantIds.length}
                  isEnrolled={isEnrolled}
                  canEnroll={canEnroll}
                  onEnroll={enrollInSection}
                />
              </Reveal>
            )
          })
        ) : (
          <div className="empty-state">
            По выбранным фильтрам секций не найдено. Попробуйте изменить параметры поиска.
          </div>
        )}
      </section>
    </>
  )
}

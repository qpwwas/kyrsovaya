import { useDeferredValue, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
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
        title="Выбор спортивной секции и запись участника"
        description="На странице можно искать направления, просматривать тренеров и залы, а также оформлять запись спортсмена или ребенка прямо из интерфейса."
        action={
          <StatusPill tone={['athlete', 'parent'].includes(currentRole) ? 'success' : 'warning'}>
            {['athlete', 'parent'].includes(currentRole)
              ? 'Запись доступна'
              : 'Только просмотр'}
          </StatusPill>
        }
      />

      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Фильтры</h2>
            <p className="card__description">
              Поиск по названию секции, тренеру и уровню подготовки.
            </p>
          </div>
        </div>

        <div className="form-grid form-grid--two">
          <div className="field">
            <label htmlFor="section-search">Поиск</label>
            <input
              id="section-search"
              value={searchQuery}
              placeholder="Например, плавание или Артем Новиков"
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="section-level">Уровень</label>
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

        <div className="actions-row">
          <label className="inline-note" htmlFor="available-only">
            <input
              id="available-only"
              type="checkbox"
              checked={onlyAvailable}
              onChange={(event) => setOnlyAvailable(event.target.checked)}
              style={{ marginRight: 8 }}
            />
            показывать только секции со свободными местами
          </label>
        </div>
      </section>

      <section className="section-list">
        {filteredSections.length ? (
          filteredSections.map((section) => {
            const isEnrolled = managedParticipantIds.some((participantId) =>
              section.participantIds.includes(participantId),
            )
            const canEnroll =
              ['athlete', 'parent'].includes(currentRole) &&
              !isEnrolled &&
              section.participantIds.length < section.capacity

            return (
              <SectionCard
                key={section.id}
                section={section}
                participantsCount={section.participantIds.length}
                isEnrolled={isEnrolled}
                canEnroll={canEnroll}
                onEnroll={enrollInSection}
              />
            )
          })
        ) : (
          <div className="empty-state">
            По выбранным фильтрам секций не найдено. Попробуйте изменить запрос.
          </div>
        )}
      </section>
    </>
  )
}

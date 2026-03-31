export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="page-header">
      <div className="page-header__content">
        {eyebrow ? <span className="page-header__eyebrow">{eyebrow}</span> : null}
        <h1 className="page-header__title">{title}</h1>
        {description ? (
          <p className="page-header__description">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  )
}

import { useState } from 'react'

const registrationRoleOptions = [
  {
    value: 'athlete',
    label: 'Спортсмен',
    summary: 'Создает личный профиль и получает возможность записываться в секции.',
  },
  {
    value: 'parent',
    label: 'Родитель',
    summary: 'Создает кабинет и сразу добавляет ребенка в систему.',
  },
]

function createRegistrationForm(role = 'athlete') {
  return {
    role,
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    password: '',
    note: '',
    parentName: '',
    athleteAge: '',
    athleteLevel: '',
    athleteFocus: '',
    childName: '',
    childAge: '',
    childLevel: '',
    childFocus: '',
  }
}

export function RegistrationFormCard({ authFeedback, isSyncingData, onSuccess, registerUser }) {
  const [registrationForm, setRegistrationForm] = useState(createRegistrationForm())

  function updateField(field, value) {
    setRegistrationForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function handleRoleChange(nextRole) {
    setRegistrationForm((previous) => ({
      ...createRegistrationForm(nextRole),
      fullName: previous.fullName,
      email: previous.email,
      phone: previous.phone,
      emergencyContact: previous.emergencyContact,
      password: previous.password,
      note: previous.note,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const result = await registerUser(registrationForm)

    if (result?.ok) {
      onSuccess?.(result)
    }
  }

  return (
    <section className="card auth-panel">
      <div className="card__header">
        <div>
          <h2 className="card__title">Регистрация</h2>
          <p className="card__description">
            Новый аккаунт можно создать для спортсмена или родителя.
          </p>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className={`alert alert--${authFeedback.type}`}>{authFeedback.message}</div>

        <div className="field">
          <label htmlFor="register-role">Кого регистрируем</label>
          <select
            id="register-role"
            value={registrationForm.role}
            onChange={(event) => handleRoleChange(event.target.value)}
          >
            {registrationRoleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <span className="inline-note">
            {
              registrationRoleOptions.find((role) => role.value === registrationForm.role)
                ?.summary
            }
          </span>
        </div>

        <div className="form-grid form-grid--two">
          <div className="field">
            <label htmlFor="register-full-name">ФИО</label>
            <input
              id="register-full-name"
              value={registrationForm.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="register-email">E-mail</label>
            <input
              id="register-email"
              type="email"
              value={registrationForm.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </div>
        </div>

        <div className="form-grid form-grid--two">
          <div className="field">
            <label htmlFor="register-phone">Телефон</label>
            <input
              id="register-phone"
              value={registrationForm.phone}
              onChange={(event) => updateField('phone', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="register-password">Пароль</label>
            <input
              id="register-password"
              type="password"
              value={registrationForm.password}
              onChange={(event) => updateField('password', event.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="register-contact">Экстренная связь</label>
          <input
            id="register-contact"
            value={registrationForm.emergencyContact}
            placeholder="Контакт на случай переноса тренировки или ЧС"
            onChange={(event) => updateField('emergencyContact', event.target.value)}
          />
        </div>

        {registrationForm.role === 'athlete' ? (
          <div className="form-grid">
            <div className="form-grid form-grid--two">
              <div className="field">
                <label htmlFor="register-parent-name">Родитель или представитель</label>
                <input
                  id="register-parent-name"
                  value={registrationForm.parentName}
                  onChange={(event) => updateField('parentName', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="register-athlete-age">Возраст спортсмена</label>
                <input
                  id="register-athlete-age"
                  type="number"
                  min="5"
                  max="25"
                  value={registrationForm.athleteAge}
                  onChange={(event) => updateField('athleteAge', event.target.value)}
                />
              </div>
            </div>

            <div className="form-grid form-grid--two">
              <div className="field">
                <label htmlFor="register-athlete-level">Уровень подготовки</label>
                <input
                  id="register-athlete-level"
                  value={registrationForm.athleteLevel}
                  placeholder="Начальный, средний, продвинутый"
                  onChange={(event) => updateField('athleteLevel', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="register-athlete-focus">Спортивный фокус</label>
                <input
                  id="register-athlete-focus"
                  value={registrationForm.athleteFocus}
                  placeholder="Например: плавание на короткие дистанции"
                  onChange={(event) => updateField('athleteFocus', event.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="form-grid">
            <div className="form-grid form-grid--two">
              <div className="field">
                <label htmlFor="register-child-name">Имя ребенка</label>
                <input
                  id="register-child-name"
                  value={registrationForm.childName}
                  onChange={(event) => updateField('childName', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="register-child-age">Возраст ребенка</label>
                <input
                  id="register-child-age"
                  type="number"
                  min="5"
                  max="25"
                  value={registrationForm.childAge}
                  onChange={(event) => updateField('childAge', event.target.value)}
                />
              </div>
            </div>

            <div className="form-grid form-grid--two">
              <div className="field">
                <label htmlFor="register-child-level">Уровень ребенка</label>
                <input
                  id="register-child-level"
                  value={registrationForm.childLevel}
                  placeholder="Начальный, средний, продвинутый"
                  onChange={(event) => updateField('childLevel', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="register-child-focus">Направление подготовки</label>
                <input
                  id="register-child-focus"
                  value={registrationForm.childFocus}
                  placeholder="Например: гимнастика и координация"
                  onChange={(event) => updateField('childFocus', event.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="register-note">Комментарий</label>
          <textarea
            id="register-note"
            value={registrationForm.note}
            placeholder="Медицинские пометки, цели на сезон, пожелания по расписанию"
            onChange={(event) => updateField('note', event.target.value)}
          />
        </div>

        <div className="actions-row">
          <button className="button" type="submit" disabled={isSyncingData}>
            Создать аккаунт
          </button>
        </div>
      </form>
    </section>
  )
}

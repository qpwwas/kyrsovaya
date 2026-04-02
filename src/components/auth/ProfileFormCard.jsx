import { useState } from 'react'
import { StatusPill } from '../StatusPill'

export function ProfileFormCard({
  currentUser,
  isSyncingData,
  profileFeedback,
  updateProfile,
}) {
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser.fullName,
    phone: currentUser.phone,
    emergencyContact: currentUser.emergencyContact,
    note: currentUser.note,
  })

  async function handleProfileSubmit(event) {
    event.preventDefault()
    await updateProfile(profileForm)
  }

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Личный кабинет</h2>
          <p className="card__description">
            Редактирование контактных данных, заметок и экстренной связи.
          </p>
        </div>
        <StatusPill tone="info">{currentUser.position}</StatusPill>
      </div>

      <form className="form-grid" onSubmit={handleProfileSubmit}>
        <div className={`alert alert--${profileFeedback.type}`}>{profileFeedback.message}</div>

        <div className="form-grid form-grid--two">
          <div className="field">
            <label htmlFor="profile-name">ФИО</label>
            <input
              id="profile-name"
              value={profileForm.fullName}
              onChange={(event) =>
                setProfileForm((previous) => ({
                  ...previous,
                  fullName: event.target.value,
                }))
              }
            />
          </div>

          <div className="field">
            <label htmlFor="profile-phone">Телефон</label>
            <input
              id="profile-phone"
              value={profileForm.phone}
              onChange={(event) =>
                setProfileForm((previous) => ({
                  ...previous,
                  phone: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="profile-contact">Экстренная связь</label>
          <input
            id="profile-contact"
            value={profileForm.emergencyContact}
            onChange={(event) =>
              setProfileForm((previous) => ({
                ...previous,
                emergencyContact: event.target.value,
              }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="profile-note">Заметка профиля</label>
          <textarea
            id="profile-note"
            value={profileForm.note}
            onChange={(event) =>
              setProfileForm((previous) => ({
                ...previous,
                note: event.target.value,
              }))
            }
          />
        </div>

        <div className="actions-row">
          <button className="button" type="submit" disabled={isSyncingData}>
            Сохранить изменения
          </button>
        </div>
      </form>
    </section>
  )
}

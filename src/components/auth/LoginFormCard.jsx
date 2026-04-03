import { useState } from 'react'

function getEmailError(email) {
  const normalizedEmail = email.trim()

  if (!normalizedEmail) {
    return 'Укажите e-mail.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return 'Введите корректный e-mail, например name@example.com.'
  }

  return ''
}

export function LoginFormCard({
  authFeedback,
  currentRole,
  isSyncingData,
  onSuccess,
  profiles,
  roleOptions,
  setRole,
  signIn,
}) {
  const [loginForm, setLoginForm] = useState({
    role: currentRole,
    email: '',
    password: '',
  })
  const [emailError, setEmailError] = useState('')

  function handleEmailChange(value) {
    setLoginForm((previous) => ({
      ...previous,
      email: value,
    }))

    if (emailError) {
      setEmailError(getEmailError(value))
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault()

    const nextEmailError = getEmailError(loginForm.email)
    setEmailError(nextEmailError)

    if (nextEmailError) {
      return
    }

    const result = await signIn(loginForm)

    if (result?.ok) {
      onSuccess?.(result)
    }
  }

  function applyDemoCredentials(role) {
    const profile = profiles[role]

    setRole?.(role)
    setEmailError('')
    setLoginForm({
      role,
      email: profile.email,
      password: profile.password,
    })
  }

  return (
    <section className="card auth-panel">
      <div className="card__header">
        <div>
          <h2 className="card__title">Вход в систему</h2>
          <p className="card__description">
            Авторизация по ролям администратора, тренера, спортсмена и родителя.
          </p>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleLoginSubmit} noValidate>
        <div className={`alert alert--${authFeedback.type}`}>{authFeedback.message}</div>

        <div className="form-grid form-grid--two">
          <div className="field">
            <label htmlFor="login-role">Роль</label>
            <select
              id="login-role"
              value={loginForm.role}
              onChange={(event) => {
                const nextRole = event.target.value
                setRole?.(nextRole)
                setLoginForm((previous) => ({
                  ...previous,
                  role: nextRole,
                }))
              }}
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              value={loginForm.email}
              placeholder="user@sport.local"
              autoComplete="email"
              aria-invalid={Boolean(emailError)}
              onChange={(event) => handleEmailChange(event.target.value)}
              onBlur={() => setEmailError(getEmailError(loginForm.email))}
            />
            {emailError ? <span className="field__error">{emailError}</span> : null}
          </div>
        </div>

        <div className="field">
          <label htmlFor="login-password">Пароль</label>
          <input
            id="login-password"
            type="password"
            value={loginForm.password}
            placeholder="Не менее 6 символов"
            autoComplete="current-password"
            onChange={(event) =>
              setLoginForm((previous) => ({
                ...previous,
                password: event.target.value,
              }))
            }
          />
        </div>

        <div className="actions-row">
          <button className="button" type="submit" disabled={isSyncingData}>
            Войти
          </button>
        </div>
      </form>

      <div className="divider" />

      <div className="auth-meta-grid">
        {roleOptions.map((role) => (
          <article key={role.value} className="meta-box">
            <span className="meta-box__label">{role.label}</span>
            <strong className="meta-box__value">{profiles[role.value].email}</strong>
            <p className="inline-note">Пароль: {profiles[role.value].password}</p>
            <button
              className="button-ghost"
              type="button"
              onClick={() => applyDemoCredentials(role.value)}
            >
              Подставить данные
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

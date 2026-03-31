export const roleLabels = {
  admin: 'Администратор',
  coach: 'Тренер',
  athlete: 'Спортсмен',
  parent: 'Родитель',
}

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDateTime(value) {
  if (!value) {
    return 'Дата не указана'
  }

  return dateTimeFormatter.format(new Date(value))
}

export function toDateTimeInputValue(value) {
  if (!value) {
    return ''
  }

  return value.slice(0, 16)
}

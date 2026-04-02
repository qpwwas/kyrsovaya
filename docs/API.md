# SportSpace Manager API

## Base URL

```text
http://localhost:3001/api
```

## Аутентификация

Защищенные маршруты используют Bearer token:

```http
Authorization: Bearer <token>
```

## Демо-аккаунты

Общий пароль:

```text
sport2026
```

- `admin@sport.local`
- `coach@sport.local`
- `athlete@sport.local`
- `parent@sport.local`

## Маршруты

### `GET /health`

Проверка, что API запущен.

Пример ответа:

```json
{
  "status": "ok",
  "service": "sportspace-api"
}
```

### `POST /auth/login`

Авторизация пользователя.

Пример запроса:

```json
{
  "email": "admin@sport.local",
  "password": "sport2026"
}
```

Пример ответа:

```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "role": "admin",
    "fullName": "Екатерина Смирнова",
    "email": "admin@sport.local",
    "phone": "+7 (701) 555-10-01",
    "emergencyContact": "Дежурный администратор, +7 (701) 555-10-99",
    "note": "Контролирует загрузку залов и публикует срочные объявления.",
    "position": "Администратор комплекса",
    "athleteId": null,
    "managedAthletes": []
  }
}
```

### `POST /auth/register`

Публичная регистрация нового пользователя.

Разрешенные роли:

- `athlete`
- `parent`

Пример регистрации спортсмена:

```json
{
  "role": "athlete",
  "fullName": "Илья Петров",
  "email": "petrov@sport.local",
  "phone": "+7 (900) 123-45-67",
  "emergencyContact": "Ольга Петрова, +7 (900) 111-22-33",
  "password": "secret12",
  "note": "Готовится к сезону",
  "parentName": "Ольга Петрова",
  "athleteAge": 12,
  "athleteLevel": "Начальный",
  "athleteFocus": "Плавание"
}
```

Пример регистрации родителя:

```json
{
  "role": "parent",
  "fullName": "Марина Соколова",
  "email": "sokolova@sport.local",
  "phone": "+7 (900) 765-43-21",
  "emergencyContact": "Резервный контакт, +7 (900) 999-88-77",
  "password": "secret12",
  "note": "Просит уведомлять о переносах",
  "childName": "Есения Соколова",
  "childAge": 10,
  "childLevel": "Начальный",
  "childFocus": "Гимнастика"
}
```

Успешный ответ:

```json
{
  "message": "Аккаунт успешно создан.",
  "token": "<jwt>",
  "user": {
    "id": 5,
    "role": "athlete"
  }
}
```

### `GET /auth/me`

Возвращает текущего авторизованного пользователя.

### `PATCH /auth/me`

Обновляет профиль текущего пользователя.

Пример тела запроса:

```json
{
  "fullName": "Екатерина Смирнова",
  "phone": "+7 (701) 555-10-01",
  "emergencyContact": "Дежурный администратор, +7 (701) 555-10-99",
  "note": "Контроль занятости залов и уведомлений."
}
```

### `GET /sections`

Возвращает список спортивных секций с вместимостью и количеством участников.

### `POST /sections/:sectionId/enroll`

Запись в секцию.

Доступ:

- `athlete` может записывать только самого себя;
- `parent` может записывать только привязанного ребенка.

Пример тела:

```json
{
  "participantIds": ["ath-04"]
}
```

### `GET /schedule`

Возвращает расписание тренировок.

### `PATCH /schedule/:sessionId`

Изменяет время и зал тренировки.

Доступ:

- `admin`
- `coach`

Пример тела:

```json
{
  "dateTime": "2026-04-03T18:00",
  "hall": "Игровой зал"
}
```

API проверяет конфликты по тренеру и залу.

### `GET /participants`

Возвращает участников в зависимости от роли:

- `admin` и `coach` получают полный список;
- `athlete` получает только свой профиль;
- `parent` получает только привязанного ребенка.

### `GET /attendance`

Возвращает журнал посещаемости с учетом роли пользователя.

### `PATCH /attendance/:sessionId`

Обновляет статус посещаемости одного участника.

Доступ:

- `admin`
- `coach`

Допустимые статусы:

- `present`
- `late`
- `absent`

Пример тела:

```json
{
  "participantId": "ath-01",
  "status": "present"
}
```

### `GET /achievements`

Возвращает достижения спортсменов с фильтрацией по роли пользователя.

### `GET /dashboard/stats`

Возвращает административную статистику:

- количество секций;
- количество тренеров;
- количество участников;
- количество тренировок на текущую дату;
- список тренировок на день;
- нагрузку по тренерам.

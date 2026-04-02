# SportSpace Manager API

## Base URL

```text
http://localhost:3001/api
```

## Authentication

Protected endpoints use Bearer token authentication.

Example header:

```http
Authorization: Bearer <token>
```

## Demo credentials

All demo users use the same password:

```text
sport2026
```

- `admin@sport.local`
- `coach@sport.local`
- `athlete@sport.local`
- `parent@sport.local`

## Endpoints

### `GET /health`

Checks that the API is running.

Response:

```json
{
  "status": "ok",
  "service": "sportspace-api"
}
```

### `POST /auth/login`

Authorizes a user and returns a JWT token.

Request:

```json
{
  "email": "admin@sport.local",
  "password": "sport2026"
}
```

Response:

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

### `GET /auth/me`

Returns the current authenticated user.

### `PATCH /auth/me`

Updates the current authenticated user profile.

Request body:

```json
{
  "fullName": "Екатерина Смирнова",
  "phone": "+7 (701) 555-10-01",
  "emergencyContact": "Дежурный администратор, +7 (701) 555-10-99",
  "note": "Контролирует загрузку залов и публикует срочные объявления."
}
```

### `GET /sections`

Returns all sports sections with capacity and participant counters.

### `POST /sections/:sectionId/enroll`

Creates a section enrollment for an athlete or a parent account.

Request body:

```json
{
  "participantIds": ["ath-04"]
}
```

Notes:

- `athlete` can enroll only their own athlete profile
- `parent` can enroll only managed children

### `GET /schedule`

Returns the training schedule with hall, coach, and occupancy data.

### `PATCH /schedule/:sessionId`

Moves a training session to a new slot.

Request body:

```json
{
  "dateTime": "2026-04-03T18:00",
  "hall": "Игровой зал"
}
```

Allowed roles:

- `admin`
- `coach`

The API checks conflicts by hall and by coach.

### `GET /participants`

Returns participants available for the current role.

Visibility rules:

- `admin` and `coach` receive the full list
- `athlete` receives only their own profile
- `parent` receives only linked children

### `GET /attendance`

Returns attendance registers.

Visibility rules:

- `admin` and `coach` see all registers
- `athlete` sees only their own attendance
- `parent` sees only linked children attendance

### `PATCH /attendance/:sessionId`

Updates attendance status for one athlete.

Request body:

```json
{
  "participantId": "ath-01",
  "status": "present"
}
```

Allowed statuses:

- `present`
- `late`
- `absent`

Allowed roles:

- `admin`
- `coach`

### `GET /achievements`

Returns achievements filtered by user role.

### `GET /dashboard/stats`

Returns administrative statistics:

- total sections
- total coaches
- total participants
- trainings today
- today sessions
- coach load

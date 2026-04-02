# SportSpace Manager

Курсовой проект на тему: **разработка системы управления спортивными секциями и расписанием тренировок**.

На текущем этапе проект уже состоит из двух частей:

- frontend на React с ролями, кабинетами, секциями, расписанием, посещаемостью, достижениями и административной панелью;
- backend на Node.js + Express с REST API, SQLite и хешированием паролей через `bcryptjs`.

Frontend уже начал работать с реальным API: авторизация, загрузка секций, расписания, участников, посещаемости, достижений и обновление профиля идут через backend.

## Реализовано

- роли пользователей: администратор, тренер, спортсмен, родитель;
- авторизация по ролям через API;
- личный кабинет пользователя;
- просмотр списка секций и запись в секцию;
- просмотр и изменение расписания тренировок;
- контроль занятости залов и тренеров;
- журнал посещаемости;
- достижения спортсменов;
- административная статистика;
- база данных SQLite с автоматическим сидированием демо-данных.

## Стек

- React 19
- Vite 8
- React Router DOM 7
- Node.js
- Express 5
- SQLite (`better-sqlite3`)
- JSON Web Token
- bcryptjs
- ESLint 9

## Запуск проекта

1. Установить зависимости:

```bash
npm install
```

2. Запустить backend:

```bash
npm run server
```

Для режима разработки backend:

```bash
npm run dev:server
```

3. В отдельном терминале запустить frontend:

```bash
npm run dev
```

4. Проверить production-сборку frontend:

```bash
npm run build
```

5. Проверить линтер:

```bash
npm run lint
```

## API

- Health check: `GET /api/health`
- Авторизация: `POST /api/auth/login`
- Текущий пользователь: `GET /api/auth/me`
- Обновление профиля: `PATCH /api/auth/me`
- Секции: `GET /api/sections`
- Запись в секцию: `POST /api/sections/:sectionId/enroll`
- Расписание: `GET /api/schedule`
- Изменение расписания: `PATCH /api/schedule/:sessionId`
- Участники: `GET /api/participants`
- Посещаемость: `GET /api/attendance`
- Изменение посещаемости: `PATCH /api/attendance/:sessionId`
- Достижения: `GET /api/achievements`
- Статистика: `GET /api/dashboard/stats`

Подробное описание запросов и ответов: [docs/API.md](docs/API.md)

## Демо-аккаунты

Все роли используют один демо-пароль: `sport2026`

- Администратор: `admin@sport.local`
- Тренер: `coach@sport.local`
- Спортсмен: `athlete@sport.local`
- Родитель: `parent@sport.local`

## Структура проекта

```text
src/
  components/      UI-компоненты и layout
  context/         состояние frontend-приложения
  data/            общие демо-данные для клиента
  pages/           страницы интерфейса
  routes/          маршрутизация React Router
  utils/           форматирование и helpers

server/
  db/              подключение и инициализация SQLite
  middleware/      auth и обработка ошибок
  routes/          REST API маршруты
  services/        бизнес-логика и работа с БД
  index.js         точка входа backend
```

## Что делать дальше

Следующий этап для развития курсовой:

1. Полностью перевести все страницы frontend на единый API-слой без остаточных mock-сценариев.
2. Добавить регистрацию новых пользователей через API.
3. Реализовать загрузку медиафайлов и аватаров.
4. Подготовить деплой frontend и backend.
5. Добавить ручные сценарии тестирования и Postman-коллекцию.

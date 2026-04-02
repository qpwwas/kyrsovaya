# SportSpace Manager

Курсовой проект на тему: **разработка системы управления спортивными секциями и расписанием тренировок**.

Проект реализует единое веб-приложение для работы со спортивными секциями, расписанием, участниками и ролями пользователей. Frontend построен на React, backend на Node.js + Express, данные хранятся в SQLite.

## Что реализовано

- регистрация и авторизация пользователей;
- роли: администратор, тренер, спортсмен, родитель;
- личный кабинет с редактированием профиля;
- просмотр списка спортивных секций и информации о них;
- запись в секции;
- просмотр и изменение расписания тренировок;
- контроль занятости залов и тренеров;
- список участников;
- учет посещаемости;
- просмотр достижений спортсменов;
- уведомления в интерфейсе о ключевых действиях;
- административная панель с общей статистикой;
- защита маршрутов по авторизации и ролям.

## Технологии

- React 19
- Vite 8
- React Router DOM 7
- Node.js
- Express 5
- SQLite через `better-sqlite3`
- JWT
- `bcryptjs`
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

4. Проверить production-сборку:

```bash
npm run build
```

5. Проверить код линтером:

```bash
npm run lint
```

## Демо-аккаунты

Все демо-пользователи используют пароль:

```text
sport2026
```

- администратор: `admin@sport.local`
- тренер: `coach@sport.local`
- спортсмен: `athlete@sport.local`
- родитель: `parent@sport.local`

Дополнительно в интерфейсе доступна публичная регистрация новых аккаунтов для ролей `athlete` и `parent`.

## Основные API-маршруты

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `GET /api/sections`
- `POST /api/sections/:sectionId/enroll`
- `GET /api/schedule`
- `PATCH /api/schedule/:sessionId`
- `GET /api/participants`
- `GET /api/attendance`
- `PATCH /api/attendance/:sessionId`
- `GET /api/achievements`
- `GET /api/dashboard/stats`

Подробно:

- [API.md](/C:/Users/llllt/kyrsovaya/docs/API.md)
- [TESTING.md](/C:/Users/llllt/kyrsovaya/docs/TESTING.md)

## Структура проекта

```text
src/
  components/      UI-компоненты и layout
  context/         глобальное состояние frontend
  data/            демо-данные и справочники
  pages/           страницы приложения
  routes/          маршрутизация
  services/        API-клиент
  utils/           форматирование и helper-функции

server/
  db/              подключение и инициализация SQLite
  middleware/      JWT-аутентификация и обработка ошибок
  routes/          REST API
  services/        бизнес-логика и работа с БД
  index.js         точка входа backend
```

## Текущее состояние

Проект доведен до состояния, в котором его можно демонстрировать и сдавать как курсовую: есть рабочий frontend, backend API, база данных, регистрация, личные кабинеты и ролевой доступ.

# SportSpace Manager

Курсовой проект на тему: **разработка системы управления спортивными секциями и расписанием тренировок**.

Проект представляет собой единое веб-приложение для работы с пользователями, секциями, расписанием, посещаемостью и достижениями спортсменов. Frontend построен на React, backend на Node.js + Express, данные хранятся в SQLite.

## Реализованный функционал

- регистрация и авторизация пользователей;
- разделение ролей на администратора, тренера, спортсмена и родителя;
- личный кабинет пользователя;
- просмотр и редактирование данных профиля;
- отображение спортивных секций и информации о них;
- запись в секции;
- просмотр и изменение расписания тренировок;
- контроль занятости залов и тренеров;
- ведение списка участников;
- учет посещаемости;
- просмотр результатов и достижений спортсменов;
- уведомления в интерфейсе;
- административная панель с общей статистикой;
- защита маршрутов по роли и авторизации.

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

## Запуск в режиме разработки

1. Установить зависимости:

```bash
npm install
```

2. Запустить backend:

```bash
npm run server
```

Для режима с автоперезапуском:

```bash
npm run dev:server
```

3. В отдельном терминале запустить frontend:

```bash
npm run dev
```

## Production-запуск

Собрать frontend:

```bash
npm run build
```

Запустить приложение:

```bash
npm start
```

После сборки Express автоматически раздает frontend из `dist/`, поэтому приложение можно запускать как единый сервис.

## Проверка качества

```bash
npm run lint
npm run build
```

## Демо-аккаунты

Общий пароль:

```text
sport2026
```

- администратор: `admin@sport.local`
- тренер: `coach@sport.local`
- спортсмен: `athlete@sport.local`
- родитель: `parent@sport.local`

Дополнительно доступна публичная регистрация новых аккаунтов для ролей `athlete` и `parent`.

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

## Документация

- [Описание API](/C:/Users/llllt/kyrsovaya/docs/API.md)
- [Ручные сценарии тестирования](/C:/Users/llllt/kyrsovaya/docs/TESTING.md)
- [Архитектура проекта](/C:/Users/llllt/kyrsovaya/docs/ARCHITECTURE.md)
- [Инструкция по деплою](/C:/Users/llllt/kyrsovaya/docs/DEPLOY.md)
- [Краткое пояснение для защиты](/C:/Users/llllt/kyrsovaya/docs/DEFENSE.md)

## Структура проекта

```text
src/
  components/      UI-компоненты и layout
  context/         глобальное состояние frontend
  data/            демо-данные и справочники
  pages/           страницы приложения
  routes/          маршрутизация
  services/        API-клиент
  utils/           helper-функции

server/
  db/              подключение и инициализация SQLite
  middleware/      аутентификация и обработка ошибок
  routes/          REST API
  services/        бизнес-логика
  index.js         точка входа backend
```

## Итоговое состояние

Проект доведен до состояния, в котором его можно демонстрировать, запускать локально, проверять по тестовым сценариям и разворачивать как единое Node.js приложение.

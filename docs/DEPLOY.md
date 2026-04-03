# Деплой проекта

## Локальный production-запуск

1. Установить зависимости:

```bash
npm install
```

2. Поднять MongoDB локально или получить внешний URI.

3. Создать `.env` на основе `.env.example` и указать:

```env
PORT=3001
HOST=0.0.0.0
JWT_SECRET=change-me-in-production
MONGO_URI=mongodb://127.0.0.1:27017/sportspace
```

4. Собрать frontend:

```bash
npm run build
```

5. Запустить приложение:

```bash
npm start
```

После этого Express будет:

- обслуживать API по `/api/*`;
- раздавать собранный frontend из `dist/`;
- открывать SPA-маршруты через один сервер.

## Deploy на Render

В репозитории уже добавлен файл `render.yaml`.

### Что нужно задать в окружении

- `JWT_SECRET`
- `MONGO_URI`

### Что важно

Render поднимет Node.js сервис, но сам MongoDB не создает. Поэтому базу нужно подключать отдельно, например через:

- MongoDB Atlas
- Render Managed MongoDB, если доступен в тарифе
- другой внешний MongoDB-hosting

## Deploy на Railway или аналогичный Node-hosting

Подходит тот же сценарий:

- build: `npm install && npm run build`
- start: `npm start`
- env: `JWT_SECRET`, `MONGO_URI`

## Проверка после деплоя

1. Открывается главная страница приложения.
2. Работает `GET /api/health`.
3. Выполняется вход в демо-аккаунт.
4. Открываются разделы `Секции` и `Расписание`.
5. Защищенные маршруты ограничены по ролям.
6. Сервер успешно подключается к MongoDB.

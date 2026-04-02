export function errorHandler(error, _request, response, _next) {
  void _request
  void _next

  const statusCode =
    error.statusCode ??
    (error?.code === 11000 ? 409 : error?.name === 'ValidationError' ? 400 : 500)
  const message =
    statusCode >= 500
      ? 'Внутренняя ошибка сервера.'
      : error?.code === 11000
        ? 'Документ с такими уникальными данными уже существует.'
        : error.message

  response.status(statusCode).json({
    message,
  })
}

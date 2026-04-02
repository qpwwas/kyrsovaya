export function errorHandler(error, _request, response, _next) {
  void _request
  void _next

  const statusCode = error.statusCode ?? 500
  const message =
    statusCode >= 500 ? 'Внутренняя ошибка сервера.' : error.message

  response.status(statusCode).json({
    message,
  })
}

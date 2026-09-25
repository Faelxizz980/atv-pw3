export class HttpError extends Error {
  constructor(status, message, details = []) {
    super(message);
    this.status = status;
    this.details = details;
  }

  static badRequest(message = 'Dados inválidos', details = []) {
    return new HttpError(400, message, details);
  }

  static notFound(message = 'Recurso não encontrado') {
    return new HttpError(404, message);
  }

  static conflict(message = 'Conflito') {
    return new HttpError(409, message);
  }
}

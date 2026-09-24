export class HttpError extends Error {
    constructor(status, message, details = []) {
        super(message);
        this.status = status;
        this.details = details;
    }

    static badRequest(message = 'Dados inválidos', details = []) {
        return new HttpError(400, message, details);
    }

    static unauthorized(message = 'Não autenticado') {
        return new HttpError(401, message);
    }

    static forbidden(message = 'Sem permissão para este recurso') {
        return new HttpError(403, message);
    }

    static notFound(message = 'Recurso não encontrado') {
        return new HttpError(404, message);
    }

    static conflict(message = 'Conflito com um registro existente') {
        return new HttpError(409, message);
    }
}

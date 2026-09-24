import { HttpError } from '../utils/http-error.js';

export function notFoundHandler(_req, res) {
    return res.status(404).json({ error: 'Rota não encontrada', details: [] });
}

// Middleware de erro centralizado: todo `next(error)` cai aqui.
export function errorHandler(error, _req, res, _next) {
    if (res.headersSent) {
        return;
    }

    if (error instanceof HttpError) {
        return res.status(error.status).json({ error: error.message, details: error.details });
    }

    if (error?.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido no corpo da requisição', details: [] });
    }

    // O detalhe interno fica apenas no log do servidor, nunca na resposta.
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor', details: [] });
}

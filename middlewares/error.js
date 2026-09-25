import { HttpError } from '../utils/http-error.js';

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Rota não encontrada', details: [] });
}

export function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return;

  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message, details: error.details });
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido', details: [] });
  }

  console.error(error);
  res.status(500).json({ error: 'Erro interno do servidor', details: [] });
}

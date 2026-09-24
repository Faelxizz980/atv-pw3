import { HttpError } from '../utils/http-error.js';
import { verificarToken } from '../utils/token.js';

export function exigirAutenticacao(req, _res, next) {
    const header = req.headers.authorization ?? '';
    const [tipo, token] = header.split(' ');

    if (tipo !== 'Bearer' || !token) {
        return next(HttpError.unauthorized('Token de autenticação ausente'));
    }

    try {
        req.user = verificarToken(token);
        next();
    } catch {
        next(HttpError.unauthorized('Token inválido ou expirado'));
    }
}

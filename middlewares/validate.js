import { HttpError } from '../utils/http-error.js';

// Valida a fonte com Zod; apenas o body é substituído pelos dados validados
// (os extras são descartados), params/query só são conferidos.
export function validate(schema, source = 'body') {
    return (req, _res, next) => {
        const resultado = schema.safeParse(req[source]);

        if (!resultado.success) {
            const details = resultado.error.issues.map((issue) => ({
                campo: issue.path.join('.') || source,
                mensagem: issue.message
            }));
            return next(HttpError.badRequest('Dados inválidos', details));
        }

        if (source === 'body') {
            req.body = resultado.data;
        }

        next();
    };
}

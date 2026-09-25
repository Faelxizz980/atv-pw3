import { HttpError } from '../utils/http-error.js';

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        campo: i.path.join('.') || source,
        mensagem: i.message,
      }));
      return next(HttpError.badRequest('Dados inválidos', details));
    }
    if (source === 'body') req.body = result.data;
    next();
  };
}

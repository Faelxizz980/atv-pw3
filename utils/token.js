import jwt from 'jsonwebtoken';

// Segredo e expiração vêm do ambiente; o fallback é apenas para desenvolvimento local.
const JWT_SECRET = process.env.JWT_SECRET ?? 'gerenciador-tarefas-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

export function criarToken(usuario) {
    return jwt.sign(
        {
            sub: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

export function verificarToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

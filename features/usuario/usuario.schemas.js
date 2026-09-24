import { z } from 'zod';

const nome = z.string().trim().min(1, 'Informe o nome').max(100, 'O nome deve ter no máximo 100 caracteres');
const email = z.string().trim().toLowerCase().email('E-mail inválido').max(100, 'O e-mail deve ter no máximo 100 caracteres');
const senha = z.string().min(6, 'A senha deve ter ao menos 6 caracteres').max(72, 'A senha deve ter no máximo 72 caracteres');

export const criarUsuarioSchema = z.object({
    nome,
    email,
    senha
});

export const loginSchema = z.object({
    email,
    senha: z.string().min(1, 'Informe a senha').max(72, 'A senha deve ter no máximo 72 caracteres')
});

export const atualizarUsuarioSchema = z
    .object({
        nome: nome.optional(),
        email: email.optional(),
        senha: senha.optional()
    })
    .refine((dados) => Object.keys(dados).length > 0, {
        message: 'Informe ao menos um campo para atualizar'
    });

export const idParamsSchema = z.object({
    id: z.coerce.number().int().positive('Id inválido')
});

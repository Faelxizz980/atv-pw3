import { z } from 'zod';

const nome = z.string().trim().min(1, 'Informe o nome').max(100, 'Máximo 100 caracteres');
const email = z.string().trim().toLowerCase().email('E-mail inválido').max(100, 'Máximo 100 caracteres');
const senha = z.string().min(6, 'Mínimo 6 caracteres').max(72, 'Máximo 72 caracteres');

export const criarUsuarioSchema = z.object({ nome, email, senha });

export const atualizarUsuarioSchema = z
  .object({ nome: nome.optional(), email: email.optional(), senha: senha.optional() })
  .refine((d) => Object.keys(d).length > 0, { message: 'Informe ao menos um campo' });

export const idParamsSchema = z.object({ id: z.coerce.number().int().positive('Id inválido') });

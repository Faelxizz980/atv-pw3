import { z } from 'zod';

const titulo = z.string().trim().min(1, 'Informe o título').max(100, 'O título deve ter no máximo 100 caracteres');
const descricao = z.string().max(2000, 'A descrição deve ter no máximo 2000 caracteres').nullish();
const status = z.enum(['PENDENTE', 'CONCLUIDA'], { message: 'Status deve ser PENDENTE ou CONCLUIDA' });

export const criarTarefaSchema = z.object({
    titulo,
    descricao,
    status: status.optional()
});

export const atualizarTarefaSchema = z
    .object({
        titulo: titulo.optional(),
        descricao,
        status: status.optional()
    })
    .refine((dados) => Object.keys(dados).length > 0, {
        message: 'Informe ao menos um campo para atualizar'
    });

export const idParamsSchema = z.object({
    id: z.coerce.number().int().positive('Id inválido')
});

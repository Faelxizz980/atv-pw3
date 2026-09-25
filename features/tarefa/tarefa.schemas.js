import { z } from 'zod';

const titulo = z.string().trim().min(1, 'Informe o título').max(100, 'Máximo 100 caracteres');
const descricao = z.string().max(2000, 'Máximo 2000 caracteres').nullish();
const status = z.enum(['PENDENTE', 'CONCLUIDA'], { message: 'Status deve ser PENDENTE ou CONCLUIDA' });
const usuarioId = z.coerce.number().int().positive('Usuário inválido');

export const criarTarefaSchema = z.object({
  titulo,
  descricao,
  status: status.optional().default('PENDENTE'),
  usuarioId,
});

export const atualizarTarefaSchema = z
  .object({ titulo: titulo.optional(), descricao, status: status.optional(), usuarioId: usuarioId.optional() })
  .refine((d) => {
    const { usuarioId: _u, ...resto } = d;
    return Object.keys(resto).length > 0;
  }, { message: 'Informe ao menos um campo' });

export const idParamsSchema = z.object({ id: z.coerce.number().int().positive('Id inválido') });

export const filtroTarefaSchema = z.object({ usuarioId: usuarioId.optional() });
export const filtroObrigatorioSchema = z.object({ usuarioId: usuarioId });
export const ownerQuerySchema = z.object({ usuarioId: usuarioId.optional() });

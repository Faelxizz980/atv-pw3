import express from 'express';
import * as tarefa from './tarefa.service.js';
import { exigirAutenticacao } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import {
    criarTarefaSchema,
    atualizarTarefaSchema,
    idParamsSchema
} from './tarefa.schemas.js';

const router = express.Router();

// Toda rota de tarefas exige token; as tarefas são sempre do usuário logado.
router.use(exigirAutenticacao);

router.get('/', async (req, res, next) => {
    try {
        const tarefas = await tarefa.getAllByUser(req.user.sub);

        return res.status(200).json({ message: 'Tarefas encontradas', tarefas });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', validate(idParamsSchema, 'params'), async (req, res, next) => {
    try {
        const tarefaEncontrada = await tarefa.getById(Number(req.params.id), req.user.sub);

        if (!tarefaEncontrada) {
            return res.status(404).json({ error: 'Tarefa não encontrada', details: [] });
        }

        return res.status(200).json({ message: 'Tarefa consultada', tarefa: tarefaEncontrada });
    } catch (error) {
        next(error);
    }
});

router.post('/', validate(criarTarefaSchema), async (req, res, next) => {
    try {
        // O dono vem do token, nunca do body.
        const tarefaCriada = await tarefa.create(req.user.sub, req.body);

        return res.status(201).json({ message: 'Tarefa criada com sucesso', tarefa: tarefaCriada });
    } catch (error) {
        next(error);
    }
});

router.put(
    '/:id',
    validate(idParamsSchema, 'params'),
    validate(atualizarTarefaSchema),
    async (req, res, next) => {
        try {
            const tarefaAtualizada = await tarefa.update(
                Number(req.params.id),
                req.user.sub,
                req.body
            );

            return res.status(200).json({
                message: 'Tarefa atualizada com sucesso',
                tarefa: tarefaAtualizada
            });
        } catch (error) {
            next(error);
        }
    }
);

router.delete('/:id', validate(idParamsSchema, 'params'), async (req, res, next) => {
    try {
        await tarefa.remove(Number(req.params.id), req.user.sub);

        return res.status(200).json({ message: 'Tarefa deletada com sucesso' });
    } catch (error) {
        next(error);
    }
});

export default router;

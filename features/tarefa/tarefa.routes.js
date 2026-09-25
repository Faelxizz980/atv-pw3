import express from 'express';
import * as tarefa from './tarefa.service.js';
import { validate } from '../../middlewares/validate.js';
import { criarTarefaSchema, atualizarTarefaSchema, idParamsSchema, filtroObrigatorioSchema, ownerQuerySchema } from './tarefa.schemas.js';

const router = express.Router();

// Listar: exige usuarioId -> cada usuário vê só suas tarefas
router.get('/', validate(filtroObrigatorioSchema, 'query'), (req, res, next) => {
  try {
    const usuarioId = Number(req.query.usuarioId);
    res.json({ tarefas: tarefa.getAll({ usuarioId }) });
  } catch (e) {
    next(e);
  }
});

// Buscar por id: se passar ?usuarioId= verifica dono, senão 404 para outro usuário
router.get('/:id', validate(idParamsSchema, 'params'), validate(ownerQuerySchema, 'query'), (req, res, next) => {
  try {
    const item = tarefa.getById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: 'Tarefa não encontrada', details: [] });
    if (req.query.usuarioId && Number(req.query.usuarioId) !== item.usuarioId) {
      return res.status(404).json({ error: 'Tarefa não encontrada', details: [] });
    }
    res.json({ tarefa: item });
  } catch (e) {
    next(e);
  }
});

router.post('/', validate(criarTarefaSchema), (req, res, next) => {
  try {
    const nova = tarefa.create(req.body);
    res.status(201).json({ message: 'Tarefa criada', tarefa: nova });
  } catch (e) {
    next(e);
  }
});

router.put('/:id', validate(idParamsSchema, 'params'), validate(ownerQuerySchema, 'query'), validate(atualizarTarefaSchema), (req, res, next) => {
  try {
    const id = Number(req.params.id);
    // se informar dono na query ou no body, verifica que é o dono
    const dono = req.query.usuarioId ?? req.body.usuarioId;
    if (dono) {
      const item = tarefa.getById(id);
      if (item && Number(dono) !== item.usuarioId) {
        return res.status(404).json({ error: 'Tarefa não encontrada', details: [] });
      }
    }
    const atualizada = tarefa.update(id, req.body);
    res.json({ message: 'Tarefa atualizada', tarefa: atualizada });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', validate(idParamsSchema, 'params'), validate(ownerQuerySchema, 'query'), (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dono = req.query.usuarioId;
    if (dono) {
      const item = tarefa.getById(id);
      if (item && Number(dono) !== item.usuarioId) {
        return res.status(404).json({ error: 'Tarefa não encontrada', details: [] });
      }
    }
    tarefa.remove(id);
    res.json({ message: 'Tarefa removida' });
  } catch (e) {
    next(e);
  }
});

export default router;

import express from 'express';
import * as usuario from './usuario.service.js';
import * as tarefa from '../tarefa/tarefa.service.js';
import { validate } from '../../middlewares/validate.js';
import { criarUsuarioSchema, atualizarUsuarioSchema, idParamsSchema } from './usuario.schemas.js';

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ usuarios: usuario.getAll() });
});

router.get('/:id', validate(idParamsSchema, 'params'), (req, res, next) => {
  try {
    const u = usuario.getById(Number(req.params.id));
    if (!u) return res.status(404).json({ error: 'Usuário não encontrado', details: [] });
    res.json({ usuario: u });
  } catch (e) {
    next(e);
  }
});

// Lista tarefas de um usuário específico: cada usuário tem suas tarefas
router.get('/:id/tarefas', validate(idParamsSchema, 'params'), (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!usuario.getById(id)) return res.status(404).json({ error: 'Usuário não encontrado', details: [] });
    res.json({ tarefas: tarefa.getAll({ usuarioId: id }) });
  } catch (e) {
    next(e);
  }
});

router.post('/', validate(criarUsuarioSchema), (req, res, next) => {
  try {
    const novo = usuario.create(req.body);
    res.status(201).json({ message: 'Usuário criado', usuario: novo });
  } catch (e) {
    next(e);
  }
});

router.put('/:id', validate(idParamsSchema, 'params'), validate(atualizarUsuarioSchema), (req, res, next) => {
  try {
    const atualizado = usuario.update(Number(req.params.id), req.body);
    res.json({ message: 'Usuário atualizado', usuario: atualizado });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', validate(idParamsSchema, 'params'), (req, res, next) => {
  try {
    const id = Number(req.params.id);
    usuario.remove(id);
    tarefa.removeByUsuarioId(id);
    res.json({ message: 'Usuário removido' });
  } catch (e) {
    next(e);
  }
});

export default router;

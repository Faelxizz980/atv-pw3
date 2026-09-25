import { HttpError } from '../../utils/http-error.js';
import * as usuarioService from '../usuario/usuario.service.js';

let tarefas = [];
let nextId = 1;

export function getAll(filtro = {}) {
  if (filtro.usuarioId) return tarefas.filter((t) => t.usuarioId === filtro.usuarioId);
  return tarefas;
}

export function getById(id) {
  return tarefas.find((t) => t.id === id) ?? null;
}

export function create(dados) {
  const usuario = usuarioService.getById(dados.usuarioId);
  if (!usuario) throw HttpError.notFound('Usuário não encontrado');

  const tarefa = {
    id: nextId++,
    usuarioId: dados.usuarioId,
    titulo: dados.titulo,
    descricao: dados.descricao ?? null,
    status: dados.status ?? 'PENDENTE',
  };
  tarefas.push(tarefa);
  return tarefa;
}

export function update(id, dados) {
  const tarefa = getById(id);
  if (!tarefa) throw HttpError.notFound('Tarefa não encontrada');

  if (tarefa.status === 'CONCLUIDA') {
    throw HttpError.badRequest('Tarefa já concluída e não pode ser editada');
  }

  if (dados.titulo !== undefined) tarefa.titulo = dados.titulo;
  if (dados.descricao !== undefined) tarefa.descricao = dados.descricao;
  if (dados.status !== undefined) tarefa.status = dados.status;
  return tarefa;
}

export function remove(id) {
  const idx = tarefas.findIndex((t) => t.id === id);
  if (idx === -1) throw HttpError.notFound('Tarefa não encontrada');
  tarefas.splice(idx, 1);
  return true;
}

export function removeByUsuarioId(usuarioId) {
  tarefas = tarefas.filter((t) => t.usuarioId !== usuarioId);
}

export function _reset() {
  tarefas = [];
  nextId = 1;
}

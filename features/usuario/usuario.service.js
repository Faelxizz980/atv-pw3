import { HttpError } from '../../utils/http-error.js';

let usuarios = [];
let nextId = 1;

export function getAll() {
  return usuarios.map(toPublic);
}

export function getById(id) {
  const u = usuarios.find((x) => x.id === id);
  return u ? toPublic(u) : null;
}

function findRawById(id) {
  return usuarios.find((x) => x.id === id);
}

function findRawByEmail(email) {
  return usuarios.find((x) => x.email === email);
}

export function create(dados) {
  if (findRawByEmail(dados.email)) {
    throw HttpError.conflict('E-mail já cadastrado');
  }
  const usuario = { id: nextId++, nome: dados.nome, email: dados.email, senha: dados.senha };
  usuarios.push(usuario);
  return toPublic(usuario);
}

export function update(id, dados) {
  const usuario = findRawById(id);
  if (!usuario) throw HttpError.notFound('Usuário não encontrado');

  if (dados.email && dados.email !== usuario.email && findRawByEmail(dados.email)) {
    throw HttpError.conflict('E-mail já cadastrado');
  }

  if (dados.nome !== undefined) usuario.nome = dados.nome;
  if (dados.email !== undefined) usuario.email = dados.email;
  if (dados.senha !== undefined) usuario.senha = dados.senha;

  return toPublic(usuario);
}

export function remove(id) {
  const idx = usuarios.findIndex((x) => x.id === id);
  if (idx === -1) throw HttpError.notFound('Usuário não encontrado');
  usuarios.splice(idx, 1);
  return true;
}

export function toPublic(usuario) {
  if (!usuario) return null;
  const { senha, ...pub } = usuario;
  return pub;
}

export function _reset() {
  usuarios = [];
  nextId = 1;
}

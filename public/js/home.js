import { api, formatarErro } from './api.js';

const form = document.getElementById('form-tarefa');
const campoTitulo = document.getElementById('titulo');
const campoDescricao = document.getElementById('descricao');
const campoStatus = document.getElementById('status');
const botaoSalvar = document.getElementById('botao-salvar');
const botaoCancelar = document.getElementById('botao-cancelar');
const campoErro = document.getElementById('mensagem-erro');
const campoErroLista = document.getElementById('mensagem-lista');
const lista = document.getElementById('lista-tarefas');
const listaVazia = document.getElementById('lista-vazia');
const contador = document.getElementById('contador-tarefas');
const tituloForm = document.getElementById('titulo-formulario');
const usuarioNome = document.getElementById('usuario-nome');
const template = document.getElementById('template-tarefa');

const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
if (!usuario) {
  window.location.href = '/';
}
usuarioNome.textContent = usuario?.nome ?? '';

document.getElementById('botao-sair').addEventListener('click', () => {
  localStorage.removeItem('usuario');
  window.location.href = '/';
});

let tarefas = [];
let editandoId = null;

function entrarEdicao(tarefa) {
  if (tarefa.status === 'CONCLUIDA') return;
  editandoId = tarefa.id;
  campoTitulo.value = tarefa.titulo;
  campoDescricao.value = tarefa.descricao ?? '';
  campoStatus.value = tarefa.status;
  tituloForm.textContent = 'Editar tarefa';
  botaoSalvar.textContent = 'Salvar';
  botaoCancelar.hidden = false;
  campoTitulo.focus();
}

function sairEdicao() {
  editandoId = null;
  form.reset();
  tituloForm.textContent = 'Nova tarefa';
  botaoSalvar.textContent = 'Criar tarefa';
  botaoCancelar.hidden = true;
  campoErro.hidden = true;
}

botaoCancelar.addEventListener('click', sairEdicao);

function criarItem(tarefa) {
  const item = template.content.firstElementChild.cloneNode(true);
  const check = item.querySelector('.tarefa__checkbox');
  const titulo = item.querySelector('.tarefa__titulo');
  const desc = item.querySelector('.tarefa__descricao');
  const status = item.querySelector('.tarefa__status');
  const btnEditar = item.querySelector('.botao--editar');

  const concluida = tarefa.status === 'CONCLUIDA';
  check.checked = concluida;
  check.id = `t-${tarefa.id}`;
  // Se já concluída, bloqueia o checkbox (não permite desfazer)
  check.disabled = concluida;
  check.title = concluida ? 'Tarefa concluída - bloqueada' : '';
  if (!concluida) check.addEventListener('change', () => alternarStatus(tarefa.id, check.checked));

  titulo.htmlFor = check.id;
  titulo.textContent = tarefa.titulo;
  titulo.classList.toggle('tarefa__titulo--concluida', concluida);

  desc.textContent = tarefa.descricao ?? '';
  desc.hidden = !tarefa.descricao;

  status.textContent = concluida ? 'Concluída (bloqueada)' : 'Pendente';
  status.classList.toggle('tarefa__status--concluida', concluida);
  item.classList.toggle('tarefa--concluida', concluida);

  if (concluida) {
    btnEditar.disabled = true;
    btnEditar.title = 'Tarefa concluída não pode ser editada';
    btnEditar.style.opacity = '0.4';
  } else {
    btnEditar.addEventListener('click', () => entrarEdicao(tarefa));
  }
  item.querySelector('.botao--excluir').addEventListener('click', () => excluir(tarefa));

  return item;
}

function renderizar() {
  lista.replaceChildren(...tarefas.map(criarItem));
  listaVazia.hidden = tarefas.length > 0;
  contador.textContent = tarefas.length ? `${tarefas.length} tarefa(s)` : '';
}

async function carregar() {
  try {
    const res = await api(`/tarefas?usuarioId=${usuario.id}`);
    tarefas = res.tarefas;
    renderizar();
  } catch (e) {
    campoErroLista.textContent = formatarErro(e);
    campoErroLista.hidden = false;
  }
}

async function alternarStatus(id, concluida) {
  try {
    const res = await api(`/tarefas/${id}?usuarioId=${usuario.id}`, { metodo: 'PUT', corpo: { status: concluida ? 'CONCLUIDA' : 'PENDENTE' } });
    tarefas = tarefas.map((t) => (t.id === id ? res.tarefa : t));
    renderizar();
  } catch (e) {
    campoErroLista.textContent = formatarErro(e);
    campoErroLista.hidden = false;
    renderizar();
  }
}

async function excluir(tarefa) {
  if (!confirm(`Excluir "${tarefa.titulo}"?`)) return;
  try {
    await api(`/tarefas/${tarefa.id}?usuarioId=${usuario.id}`, { metodo: 'DELETE' });
    tarefas = tarefas.filter((t) => t.id !== tarefa.id);
    if (editandoId === tarefa.id) sairEdicao();
    renderizar();
  } catch (e) {
    campoErroLista.textContent = formatarErro(e);
    campoErroLista.hidden = false;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (editandoId) {
    const orig = tarefas.find((t) => t.id === editandoId);
    if (orig?.status === 'CONCLUIDA') {
      campoErro.textContent = 'Tarefa já concluída e não pode ser editada';
      campoErro.hidden = false;
      return;
    }
  }
  campoErro.hidden = true;
  const corpo = {
    titulo: campoTitulo.value.trim(),
    descricao: campoDescricao.value.trim() || null,
    status: campoStatus.value,
    usuarioId: usuario.id,
  };
  // Ao criar, garante que começa pendente se não for edição
  botaoSalvar.disabled = true;
  botaoSalvar.textContent = editandoId ? 'Salvando...' : 'Criando...';
  try {
    if (editandoId) {
      const res = await api(`/tarefas/${editandoId}?usuarioId=${usuario.id}`, { metodo: 'PUT', corpo: { titulo: corpo.titulo, descricao: corpo.descricao, status: corpo.status } });
      tarefas = tarefas.map((t) => (t.id === editandoId ? res.tarefa : t));
    } else {
      const res = await api('/tarefas', { metodo: 'POST', corpo });
      tarefas.unshift(res.tarefa);
    }
    sairEdicao();
    renderizar();
  } catch (err) {
    campoErro.textContent = formatarErro(err);
    campoErro.hidden = false;
  } finally {
    botaoSalvar.disabled = false;
    botaoSalvar.textContent = editandoId ? 'Salvar' : 'Criar tarefa';
  }
});

carregar();

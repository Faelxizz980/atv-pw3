import { api, formatarErro, obterUsuario, sair } from './api.js';

const usuario = obterUsuario();
if (!usuario) {
    sair();
}

document.getElementById('usuario-nome').textContent = usuario?.nome ?? '';
document.getElementById('botao-sair').addEventListener('click', sair);

const form = document.getElementById('form-tarefa');
const campoTitulo = document.getElementById('titulo');
const campoDescricao = document.getElementById('descricao');
const campoStatus = document.getElementById('status');
const tituloFormulario = document.getElementById('titulo-formulario');
const botaoSalvar = document.getElementById('botao-salvar');
const botaoCancelar = document.getElementById('botao-cancelar');
const campoErro = document.getElementById('mensagem-erro');
const campoErroLista = document.getElementById('mensagem-lista');
const lista = document.getElementById('lista-tarefas');
const listaVazia = document.getElementById('lista-vazia');
const contador = document.getElementById('contador-tarefas');
const template = document.getElementById('template-tarefa');

let tarefas = [];
let editandoId = null;

function mostrarErro(campo, texto) {
    campo.textContent = texto;
    campo.hidden = false;
}

function esconderErro() {
    campoErro.hidden = true;
}

function entrarEmEdicao(tarefa) {
    editandoId = tarefa.id;
    campoTitulo.value = tarefa.titulo ?? '';
    campoDescricao.value = tarefa.descricao ?? '';
    campoStatus.value = tarefa.status ?? 'PENDENTE';
    tituloFormulario.textContent = 'Editar tarefa';
    botaoSalvar.textContent = 'Salvar alterações';
    botaoCancelar.hidden = false;
    campoTitulo.focus();
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function sairDeEdicao() {
    editandoId = null;
    form.reset();
    tituloFormulario.textContent = 'Nova tarefa';
    botaoSalvar.textContent = 'Criar tarefa';
    botaoCancelar.hidden = true;
    esconderErro();
}

botaoCancelar.addEventListener('click', sairDeEdicao);

function criarItem(tarefa) {
    const item = template.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector('.tarefa__checkbox');
    const rotuloTitulo = item.querySelector('.tarefa__titulo');
    const descricao = item.querySelector('.tarefa__descricao');
    const status = item.querySelector('.tarefa__status');
    const botaoEditar = item.querySelector('.botao--editar');
    const botaoExcluir = item.querySelector('.botao--excluir');
    const concluida = tarefa.status === 'CONCLUIDA';

    item.dataset.id = tarefa.id;
    checkbox.checked = concluida;
    checkbox.id = `concluir-${tarefa.id}`;
    checkbox.addEventListener('change', () => alternarStatus(tarefa.id, checkbox.checked));

    rotuloTitulo.htmlFor = checkbox.id;
    rotuloTitulo.textContent = tarefa.titulo;
    rotuloTitulo.classList.toggle('tarefa__titulo--concluida', concluida);

    descricao.textContent = tarefa.descricao ?? '';
    descricao.hidden = !tarefa.descricao;

    status.textContent = concluida ? 'Concluída' : 'Pendente';
    status.classList.toggle('tarefa__status--concluida', concluida);
    item.classList.toggle('tarefa--concluida', concluida);

    botaoEditar.addEventListener('click', () => entrarEmEdicao(tarefa));
    botaoExcluir.addEventListener('click', () => excluirTarefa(tarefa));

    return item;
}

function renderizar() {
    lista.replaceChildren(...tarefas.map(criarItem));
    listaVazia.hidden = tarefas.length > 0;
    contador.textContent = tarefas.length
        ? `${tarefas.length} ${tarefas.length === 1 ? 'tarefa' : 'tarefas'}`
        : '';
}

async function carregarTarefas() {
    campoErroLista.hidden = true;
    try {
        const resposta = await api('/tarefas');
        tarefas = resposta.tarefas;
        renderizar();
    } catch (erro) {
        mostrarErro(campoErroLista, formatarErro(erro));
    }
}

// Update parcial: muda só o status, sem tocar nos demais campos.
async function alternarStatus(id, concluida) {
    try {
        const resposta = await api(`/tarefas/${id}`, {
            metodo: 'PUT',
            corpo: { status: concluida ? 'CONCLUIDA' : 'PENDENTE' }
        });
        tarefas = tarefas.map((tarefa) => (tarefa.id === id ? resposta.tarefa : tarefa));
        renderizar();
    } catch (erro) {
        mostrarErro(campoErroLista, formatarErro(erro));
        renderizar();
    }
}

async function excluirTarefa(tarefa) {
    if (!window.confirm(`Excluir a tarefa "${tarefa.titulo}"?`)) {
        return;
    }

    try {
        await api(`/tarefas/${tarefa.id}`, { metodo: 'DELETE' });
        tarefas = tarefas.filter((item) => item.id !== tarefa.id);
        if (editandoId === tarefa.id) sairDeEdicao();
        renderizar();
    } catch (erro) {
        mostrarErro(campoErroLista, formatarErro(erro));
    }
}

form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    esconderErro();

    const corpo = {
        titulo: campoTitulo.value.trim(),
        descricao: campoDescricao.value.trim() || null,
        status: campoStatus.value
    };

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = editandoId ? 'Salvando...' : 'Criando...';

    try {
        if (editandoId) {
            const resposta = await api(`/tarefas/${editandoId}`, { metodo: 'PUT', corpo });
            tarefas = tarefas.map((tarefa) => (tarefa.id === editandoId ? resposta.tarefa : tarefa));
        } else {
            const resposta = await api('/tarefas', { metodo: 'POST', corpo });
            tarefas = [resposta.tarefa, ...tarefas];
        }
        sairDeEdicao();
        renderizar();
    } catch (erro) {
        mostrarErro(campoErro, formatarErro(erro));
    } finally {
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = editandoId ? 'Salvar alterações' : 'Criar tarefa';
    }
});

carregarTarefas();

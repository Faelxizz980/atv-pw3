import { api, formatarErro, guardarSessao, obterToken } from './api.js';

// Já logado? Pula direto para a home.
if (obterToken()) {
    window.location.replace('/home.html');
}

const form = document.getElementById('form-login');
const botao = document.getElementById('botao-entrar');
const campoErro = document.getElementById('mensagem-erro');
const campoAviso = document.getElementById('mensagem-aviso');

if (new URLSearchParams(window.location.search).has('criado')) {
    campoAviso.textContent = 'Conta criada com sucesso! Faça login para continuar.';
    campoAviso.hidden = false;
}

function mostrarErro(texto) {
    campoErro.textContent = texto;
    campoErro.hidden = false;
}

function esconderErro() {
    campoErro.hidden = true;
}

form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    esconderErro();
    campoAviso.hidden = true;

    const dados = Object.fromEntries(new FormData(form).entries());

    botao.disabled = true;
    botao.textContent = 'Entrando...';

    try {
        const resposta = await api('/usuarios/login', { metodo: 'POST', corpo: dados });
        guardarSessao(resposta.token, resposta.usuario);
        window.location.href = '/home.html';
    } catch (erro) {
        mostrarErro(formatarErro(erro));
        botao.disabled = false;
        botao.textContent = 'Entrar';
    }
});

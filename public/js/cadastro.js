import { api, formatarErro } from './api.js';

const form = document.getElementById('form-cadastro');
const botao = document.getElementById('botao-cadastrar');
const campoErro = document.getElementById('mensagem-erro');

function mostrarErro(texto) {
    campoErro.textContent = texto;
    campoErro.hidden = false;
}

form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    campoErro.hidden = true;

    const dados = Object.fromEntries(new FormData(form).entries());

    botao.disabled = true;
    botao.textContent = 'Cadastrando...';

    try {
        await api('/usuarios', { metodo: 'POST', corpo: dados });
        window.location.href = '/?criado=1';
    } catch (erro) {
        mostrarErro(formatarErro(erro));
        botao.disabled = false;
        botao.textContent = 'Cadastrar';
    }
});

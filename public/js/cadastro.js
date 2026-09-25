import { api, formatarErro } from './api.js';

const form = document.getElementById('form-cadastro');
const campoErro = document.getElementById('mensagem-erro');
const botao = document.getElementById('botao-cadastrar');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  campoErro.hidden = true;
  botao.disabled = true;
  botao.textContent = 'Cadastrando...';

  const dados = Object.fromEntries(new FormData(form).entries());

  try {
    await api('/usuarios', { metodo: 'POST', corpo: dados });
    window.location.href = '/?criado=1';
  } catch (erro) {
    campoErro.textContent = formatarErro(erro);
    campoErro.hidden = false;
    botao.disabled = false;
    botao.textContent = 'Cadastrar';
  }
});

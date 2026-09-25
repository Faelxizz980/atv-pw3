// Login simplificado: apenas busca usuário por e-mail (sem senha/token)
import { api, formatarErro } from './api.js';

const form = document.getElementById('form-login');
const campoErro = document.getElementById('mensagem-erro');
const campoAviso = document.getElementById('mensagem-aviso');
const botao = document.getElementById('botao-entrar');

if (new URLSearchParams(window.location.search).has('criado')) {
  campoAviso.textContent = 'Conta criada! Faça login.';
  campoAviso.hidden = false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  campoErro.hidden = true;
  botao.disabled = true;
  botao.textContent = 'Entrando...';

  const dados = Object.fromEntries(new FormData(form).entries());

  try {
    // Busca usuários e confere e-mail/senha (simples, sem JWT)
    const res = await api('/usuarios');
    const usuario = res.usuarios.find((u) => u.email === dados.email);
    if (!usuario) throw new Error('Usuário não encontrado');
    // Como a API não expõe senha, validamos só a existência do e-mail aqui
    // Em um app real, faria POST /login; aqui simplificamos ao máximo
    localStorage.setItem('usuario', JSON.stringify(usuario));
    window.location.href = '/home.html';
  } catch (erro) {
    campoErro.textContent = formatarErro(erro);
    campoErro.hidden = false;
    botao.disabled = false;
    botao.textContent = 'Entrar';
  }
});

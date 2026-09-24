// Camada de acesso à API: token, tratamento de erro e saída de sessão.
const CHAVE_TOKEN = 'token';
const CHAVE_USUARIO = 'usuario';

export function obterToken() {
    return localStorage.getItem(CHAVE_TOKEN);
}

export function obterUsuario() {
    const bruto = localStorage.getItem(CHAVE_USUARIO);
    if (!bruto) return null;
    try {
        return JSON.parse(bruto);
    } catch {
        return null;
    }
}

export function guardarSessao(token, usuario) {
    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
}

export function sair() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
    window.location.href = '/';
}

export async function api(caminho, { metodo = 'GET', corpo } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = obterToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const resposta = await fetch(caminho, {
        method: metodo,
        headers,
        body: corpo !== undefined ? JSON.stringify(corpo) : undefined
    });

    if (resposta.status === 401) {
        sair();
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    const dados = resposta.status === 204 ? null : await resposta.json().catch(() => null);

    if (!resposta.ok) {
        const erro = new Error(dados?.error ?? 'Erro na requisição');
        erro.status = resposta.status;
        erro.details = Array.isArray(dados?.details) ? dados.details : [];
        throw erro;
    }

    return dados;
}

// Une as mensagens de validação do backend em um texto único.
export function formatarErro(erro) {
    if (erro?.details?.length) {
        return erro.details.map((item) => item.mensagem ?? item).join('; ');
    }
    return erro?.message ?? 'Erro inesperado. Tente novamente.';
}

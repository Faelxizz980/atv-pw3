// Função simples para chamar a API
export async function api(caminho, { metodo = 'GET', corpo } = {}) {
  const res = await fetch(caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const dados = await res.json().catch(() => null);

  if (!res.ok) {
    const erro = new Error(dados?.error ?? 'Erro na requisição');
    erro.status = res.status;
    erro.details = dados?.details ?? [];
    throw erro;
  }
  return dados;
}

export function formatarErro(erro) {
  if (erro.details?.length) return erro.details.map((d) => d.mensagem ?? d).join('; ');
  return erro.message ?? 'Erro inesperado';
}

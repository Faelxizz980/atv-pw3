// Suíte de testes da API — roda contra http://localhost:3000 (backend no ar)
const BASE = process.env.BASE ?? 'http://localhost:3000';
const results = [];

async function t(nome, metodo, caminho, { body, token, esperado } = {}) {
  try {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(BASE + caminho, {
      method: metodo,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const txt = await res.text();
    let json;
    try { json = JSON.parse(txt); } catch { json = null; }

    const ok = res.status === esperado;
    results.push({ ok, nome, metodo, caminho, status: res.status, esperado, resp: txt.slice(0, 250) });
    console.log(`${ok ? 'PASS' : 'FAIL'} | ${metodo} ${caminho} | esperado ${esperado}, obtido ${res.status} | ${txt.slice(0, 160)}`);
    return { status: res.status, body: json };
  } catch (e) {
    results.push({ ok: false, nome, metodo, caminho, erro: String(e) });
    console.log(`ERRO | ${metodo} ${caminho} | ${e}`);
    return { status: 0, body: null };
  }
}

function verifica(condicao, descricao) {
  const ok = Boolean(condicao);
  results.push({ ok, nome: descricao });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ASSERT | ${descricao}`);
}

const carimbo = Date.now();
const emailA = `alice${carimbo}@teste.com`;
const emailB = `bob${carimbo}@teste.com`;

let r;
let tokenA;
let tokenB;
let idA;
let idB;
let tarefaId;

console.log('== SAÚDE ==');
await t('health', 'GET', '/health', { esperado: 200 });

console.log('\n== CADASTRO ==');
r = await t('criar usuário A', 'POST', '/usuarios', { body: { nome: 'Alice', email: emailA, senha: 'senha123' }, esperado: 201 });
idA = r.body?.id;
await t('criar usuário A duplicado', 'POST', '/usuarios', { body: { nome: 'Alice2', email: emailA, senha: 'senha123' }, esperado: 409 });
r = await t('criar usuário B', 'POST', '/usuarios', { body: { nome: 'Bob', email: emailB, senha: 'senha123' }, esperado: 201 });
idB = r.body?.id;
await t('cadastro sem senha', 'POST', '/usuarios', { body: { nome: 'X', email: `x${carimbo}@t.com` }, esperado: 400 });
await t('cadastro email inválido', 'POST', '/usuarios', { body: { nome: 'X', email: 'nao-e-email', senha: 'senha123' }, esperado: 400 });
await t('cadastro senha curta', 'POST', '/usuarios', { body: { nome: 'X', email: `y${carimbo}@t.com`, senha: '123' }, esperado: 400 });

console.log('\n== LOGIN ==');
r = await t('login A', 'POST', '/usuarios/login', { body: { email: emailA, senha: 'senha123' }, esperado: 200 });
tokenA = r.body?.token;
verifica(tokenA, 'login A retorna token');
await t('login senha errada', 'POST', '/usuarios/login', { body: { email: emailA, senha: 'errada99' }, esperado: 401 });
await t('login e-mail inexistente', 'POST', '/usuarios/login', { body: { email: `none${carimbo}@t.com`, senha: 'senha123' }, esperado: 401 });
await t('login sem campos', 'POST', '/usuarios/login', { body: {}, esperado: 400 });
r = await t('login B', 'POST', '/usuarios/login', { body: { email: emailB, senha: 'senha123' }, esperado: 200 });
tokenB = r.body?.token;

console.log('\n== AUTENTICAÇÃO ==');
await t('listar tarefas sem token', 'GET', '/tarefas', { esperado: 401 });
await t('listar tarefas token inválido', 'GET', '/tarefas', { token: 'abc.def.ghi', esperado: 401 });
await t('criar tarefa sem token', 'POST', '/tarefas', { body: { titulo: 'X' }, esperado: 401 });
await t('listar usuários sem token', 'GET', '/usuarios', { esperado: 401 });

console.log('\n== USUÁRIOS (logado) ==');
await t('listar usuários', 'GET', '/usuarios', { token: tokenA, esperado: 200 });
r = await t('consultar próprio usuário', 'GET', `/usuarios/${idA}`, { token: tokenA, esperado: 200 });
verifica(r.body?.usuario?.email === emailA, 'retorna o usuário certo');
await t('consultar outro usuário (B)', 'GET', `/usuarios/${idB}`, { token: tokenA, esperado: 403 });
await t('id inválido nos params', 'GET', '/usuarios/abc', { token: tokenA, esperado: 400 });
r = await t('update parcial (só nome)', 'PUT', `/usuarios/${idA}`, { token: tokenA, body: { nome: 'Alice Editada' }, esperado: 200 });
verifica(r.body?.usuario?.nome === 'Alice Editada', 'update parcial aplica e retorna usuário');
await t('update campos vazios', 'PUT', `/usuarios/${idA}`, { token: tokenA, body: {}, esperado: 400 });
await t('update de outro usuário', 'PUT', `/usuarios/${idB}`, { token: tokenA, body: { nome: 'Hackeado' }, esperado: 403 });
await t('update usuário inexistente', 'PUT', '/usuarios/999999', { token: tokenA, body: { nome: 'Ghost' }, esperado: 403 });
await t('login com senha inalterada', 'POST', '/usuarios/login', { body: { email: emailA, senha: 'senha123' }, esperado: 200 });

console.log('\n== TAREFAS: CRIAR ==');
r = await t('criar tarefa', 'POST', '/tarefas', { token: tokenA, body: { titulo: 'Estudar Express', descricao: 'Revisar middlewares' }, esperado: 201 });
tarefaId = r.body?.tarefa?.id;
verifica(tarefaId, 'criar retorna id da tarefa');
verifica(r.body?.tarefa?.status === 'PENDENTE', 'status default PENDENTE');
verifica(r.body?.tarefa?.fk_usuario_id === idA, 'dono vem do token');
await t('criar tarefa sem título', 'POST', '/tarefas', { token: tokenA, body: { descricao: 'sem titulo' }, esperado: 400 });
await t('criar tarefa status inválido', 'POST', '/tarefas', { token: tokenA, body: { titulo: 'X', status: 'VOADO' }, esperado: 400 });
await t('criar tarefa tentando forjar dono', 'POST', '/tarefas', { token: tokenA, body: { titulo: 'Forged', fk_usuario_id: idB }, esperado: 201 });
r = await t('criar tarefa B', 'POST', '/tarefas', { token: tokenB, body: { titulo: 'Tarefa do Bob' }, esperado: 201 });
const tarefaIdB = r.body?.tarefa?.id;

console.log('\n== TAREFAS: LISTAR/CONSULTAR ==');
r = await t('listar minhas tarefas', 'GET', '/tarefas', { token: tokenA, esperado: 200 });
verifica(Array.isArray(r.body?.tarefas), 'retorna lista de tarefas');
verifica(r.body?.tarefas.every((x) => x.fk_usuario_id === idA), 'lista só tarefas do dono logado');
await t('consultar minha tarefa', 'GET', `/tarefas/${tarefaId}`, { token: tokenA, esperado: 200 });
await t('consultar tarefa de outro usuário', 'GET', `/tarefas/${tarefaIdB}`, { token: tokenA, esperado: 404 });
await t('consultar tarefa inexistente', 'GET', '/tarefas/999999', { token: tokenA, esperado: 404 });
await t('id tarefa inválido', 'GET', '/tarefas/abc', { token: tokenA, esperado: 400 });

console.log('\n== TAREFAS: ATUALIZAR (update melhorado) ==');
r = await t('update completo', 'PUT', `/tarefas/${tarefaId}`, { token: tokenA, body: { titulo: 'Estudar Express 5', descricao: 'OK', status: 'CONCLUIDA' }, esperado: 200 });
verifica(r.body?.tarefa?.titulo === 'Estudar Express 5', 'update retorna título novo');
verifica(r.body?.tarefa?.status === 'CONCLUIDA', 'update retorna status novo');
r = await t('update parcial (só status)', 'PUT', `/tarefas/${tarefaId}`, { token: tokenA, body: { status: 'PENDENTE' }, esperado: 200 });
verifica(r.body?.tarefa?.titulo === 'Estudar Express 5', 'update parcial não apaga os outros campos');
verifica(r.body?.tarefa?.status === 'PENDENTE', 'update parcial altera só o status');
await t('update vazio', 'PUT', `/tarefas/${tarefaId}`, { token: tokenA, body: {}, esperado: 400 });
await t('update status inválido', 'PUT', `/tarefas/${tarefaId}`, { token: tokenA, body: { status: 'XPTO' }, esperado: 400 });
await t('update tarefa inexistente', 'PUT', '/tarefas/999999', { token: tokenA, body: { titulo: 'Ghost' }, esperado: 404 });
await t('update tarefa de outro usuário', 'PUT', `/tarefas/${tarefaIdB}`, { token: tokenA, body: { titulo: 'Hacked' }, esperado: 404 });

console.log('\n== TAREFAS: DELETAR ==');
await t('deletar tarefa inexistente', 'DELETE', '/tarefas/999999', { token: tokenA, esperado: 404 });
await t('deletar tarefa de outro usuário', 'DELETE', `/tarefas/${tarefaIdB}`, { token: tokenA, esperado: 404 });
await t('deletar minha tarefa', 'DELETE', `/tarefas/${tarefaId}`, { token: tokenA, esperado: 200 });
await t('deletar de novo (já removida)', 'DELETE', `/tarefas/${tarefaId}`, { token: tokenA, esperado: 404 });

console.log('\n== ROTA DESCONHECIDA ==');
await t('rota inexistente', 'GET', '/nao-existe', { esperado: 404 });

console.log('\n== USUÁRIO COM TAREFAS: DELETAR ==');
await t('criar tarefa p/ delete', 'POST', '/tarefas', { token: tokenA, body: { titulo: 'Vai morrer junto' }, esperado: 201 });
await t('deletar usuário com tarefas', 'DELETE', `/usuarios/${idA}`, { token: tokenA, esperado: 200 });
await t('login após delete falha', 'POST', '/usuarios/login', { body: { email: emailA, senha: 'senha123' }, esperado: 401 });

// limpeza: remove usuário B (e tarefas)
if (tokenB && idB) {
  await t('limpeza: deletar B', 'DELETE', `/usuarios/${idB}`, { token: tokenB, esperado: 200 });
}

console.log('\n== RESUMO ==');
const passados = results.filter((x) => x.ok).length;
console.log(`${passados}/${results.length} verificações passaram`);
const falhas = results.filter((x) => !x.ok);
if (falhas.length) {
  console.log('Falhas:');
  falhas.forEach((x) => console.log(` - [${x.nome}] ${x.metodo ?? 'ASSERT'} ${x.caminho ?? ''} -> ${x.erro ?? `status ${x.status}, esperado ${x.esperado}`}`));
}
process.exit(falhas.length ? 1 : 0);

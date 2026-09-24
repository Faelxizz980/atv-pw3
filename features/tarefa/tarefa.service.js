import pool from '../../db/conect.js';
import { HttpError } from '../../utils/http-error.js';

const COLUNAS = 'id, fk_usuario_id, titulo, descricao, status, created_at, updated_at';

// Todas as consultas são escopadas ao usuário dono das tarefas.
export async function getAllByUser(usuarioId) {
    const [rows] = await pool.query(
        `SELECT ${COLUNAS} FROM tarefas WHERE fk_usuario_id = ? ORDER BY created_at DESC`,
        [usuarioId]
    );
    return rows;
}

export async function getById(id, usuarioId) {
    const [rows] = await pool.execute(
        `SELECT ${COLUNAS} FROM tarefas WHERE id = ? AND fk_usuario_id = ?`,
        [id, usuarioId]
    );
    return rows[0];
}

export async function create(usuarioId, dados) {
    const [resultado] = await pool.execute(
        'INSERT INTO tarefas (fk_usuario_id, titulo, descricao, status) VALUES (?, ?, ?, ?)',
        [usuarioId, dados.titulo, dados.descricao ?? null, dados.status ?? 'PENDENTE']
    );

    return getById(resultado.insertId, usuarioId);
}

// Update parcial: apenas os campos enviados entram no SET; retorna a tarefa atualizada.
export async function update(id, usuarioId, dados) {
    const tarefaExistente = await getById(id, usuarioId);

    if (!tarefaExistente) {
        throw HttpError.notFound('Tarefa não encontrada');
    }

    const campos = [];
    const valores = [];

    if (dados.titulo !== undefined) {
        campos.push('titulo = ?');
        valores.push(dados.titulo);
    }

    if (dados.descricao !== undefined) {
        campos.push('descricao = ?');
        valores.push(dados.descricao);
    }

    if (dados.status !== undefined) {
        campos.push('status = ?');
        valores.push(dados.status);
    }

    if (campos.length === 0) {
        throw HttpError.badRequest('Informe ao menos um campo para atualizar');
    }

    valores.push(id, usuarioId);
    await pool.execute(
        `UPDATE tarefas SET ${campos.join(', ')} WHERE id = ? AND fk_usuario_id = ?`,
        valores
    );

    return getById(id, usuarioId);
}

export async function remove(id, usuarioId) {
    const [resultado] = await pool.execute(
        'DELETE FROM tarefas WHERE id = ? AND fk_usuario_id = ?',
        [id, usuarioId]
    );

    if (resultado.affectedRows === 0) {
        throw HttpError.notFound('Tarefa não encontrada');
    }

    return true;
}

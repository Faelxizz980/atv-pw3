import pool from '../../db/conect.js';
import bcrypt from 'bcrypt';

export async function getAll() {
    const [rows] = await pool.query(
        'SELECT id, email, nome FROM usuarios'
    );

    return rows;
}

export async function getById(id) {
    const [rows] = await pool.query(
        'SELECT id, email, nome FROM usuarios WHERE id = ?',
        [id]
    );

    return rows[0];
}

export async function getByEmail(email) {
    const [rows] = await pool.query(
        'SELECT id, email, nome FROM usuarios WHERE email = ?',
        [email]
    );

    return rows[0];
}

export async function create(dados) {
    const usuarioExistente = await getByEmail(dados.email);

    if (usuarioExistente) {
        return false;
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const [resultado] = await pool.execute(
        'INSERT INTO usuarios (email, nome, senha) VALUES (?, ?, ?)',
        [dados.email, dados.nome, senhaHash]
    );

    return resultado.insertId;
}
export async function update(dados) {
    const usuarioExistente = await getById(dados.id);

    if (!usuarioExistente) {
        return false;
    }

    let query;
    let valores;

    if (dados.senha) {
        const senhaHash = await bcrypt.hash(dados.senha, 10);

        query = `
            UPDATE usuarios
            SET email = ?, nome = ?, senha = ?
            WHERE id = ?
        `;

        valores = [
            dados.email,
            dados.nome,
            senhaHash,
            dados.id
        ];
    } else {
        query = `
            UPDATE usuarios
            SET email = ?, nome = ?
            WHERE id = ?
        `;

        valores = [
            dados.email,
            dados.nome,
            dados.id
        ];
    }

    const [resultado] = await pool.execute(query, valores);

    return resultado.affectedRows > 0;
    
}


export async function remove(id) {

    const usuarioExistente = await getById(id);

    if (!usuarioExistente) {
        return false;
    }

    const [resultado] = await pool.execute(
        'DELETE FROM usuarios WHERE id = ?',
        [id]
    );

    return resultado.affectedRows > 0;
}
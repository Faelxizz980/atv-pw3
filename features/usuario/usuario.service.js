import pool from '../../db/conect.js';
import bcrypt from 'bcrypt';
import { HttpError } from '../../utils/http-error.js';

const COLUNAS_PUBLICAS = 'id, email, nome';

export async function getAll() {
    const [rows] = await pool.query(`SELECT ${COLUNAS_PUBLICAS} FROM usuarios`);
    return rows;
}

export async function getById(id) {
    const [rows] = await pool.query(
        `SELECT ${COLUNAS_PUBLICAS} FROM usuarios WHERE id = ?`,
        [id]
    );
    return rows[0];
}

export async function getByEmail(email) {
    const [rows] = await pool.query(
        `SELECT ${COLUNAS_PUBLICAS} FROM usuarios WHERE email = ?`,
        [email]
    );
    return rows[0];
}

export async function login(email, senha) {
    const [rows] = await pool.query(
        'SELECT id, email, nome, senha FROM usuarios WHERE email = ?',
        [email]
    );
    const usuario = rows[0];

    // Mesma mensagem para e-mail inexistente e senha errada, para não revelar cadastros.
    const senhaCorreta = usuario ? await bcrypt.compare(senha, usuario.senha) : false;
    if (!senhaCorreta) {
        throw HttpError.unauthorized('E-mail ou senha inválidos');
    }

    return { id: usuario.id, email: usuario.email, nome: usuario.nome };
}

export async function create(dados) {
    const usuarioExistente = await getByEmail(dados.email);

    if (usuarioExistente) {
        throw HttpError.conflict('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    try {
        const [resultado] = await pool.execute(
            'INSERT INTO usuarios (email, nome, senha) VALUES (?, ?, ?)',
            [dados.email, dados.nome, senhaHash]
        );
        return resultado.insertId;
    } catch (error) {
        // Corrida entre duas requisições com o mesmo e-mail ainda pode estourar a unique key.
        if (error.code === 'ER_DUP_ENTRY') {
            throw HttpError.conflict('E-mail já cadastrado');
        }
        throw error;
    }
}

// Update parcial: apenas os campos enviados entram no SET.
export async function update(id, dados) {
    const usuarioExistente = await getById(id);

    if (!usuarioExistente) {
        throw HttpError.notFound('Usuário não encontrado');
    }

    const campos = [];
    const valores = [];

    if (dados.email !== undefined) {
        const donoDoEmail = await getByEmail(dados.email);
        if (donoDoEmail && donoDoEmail.id !== Number(id)) {
            throw HttpError.conflict('E-mail já cadastrado');
        }
        campos.push('email = ?');
        valores.push(dados.email);
    }

    if (dados.nome !== undefined) {
        campos.push('nome = ?');
        valores.push(dados.nome);
    }

    if (dados.senha !== undefined) {
        campos.push('senha = ?');
        valores.push(await bcrypt.hash(dados.senha, 10));
    }

    if (campos.length === 0) {
        throw HttpError.badRequest('Informe ao menos um campo para atualizar');
    }

    valores.push(id);
    await pool.execute(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);

    return getById(id);
}

export async function remove(id) {
    const usuarioExistente = await getById(id);

    if (!usuarioExistente) {
        throw HttpError.notFound('Usuário não encontrado');
    }

    // Sem ON DELETE CASCADE no schema, remove as tarefas junto na mesma transação.
    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();
        await conexao.execute('DELETE FROM tarefas WHERE fk_usuario_id = ?', [id]);
        await conexao.execute('DELETE FROM usuarios WHERE id = ?', [id]);
        await conexao.commit();
        return true;
    } catch (error) {
        await conexao.rollback();
        throw error;
    } finally {
        conexao.release();
    }
}

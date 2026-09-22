import pool from '../../db/conect.js';

export const tarefa = {
    async getAll(){
        const [rows] = await pool.query('SELECT * FROM tarefas');
        return rows;
    },

    async getById(id){
        const [rows] = await pool.query(
            'SELECT id, fk_usuario_id, titulo, descricao, status FROM tarefas WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    async create(dados){
        const [result] = await pool.execute(
            'INSERT INTO tarefas (fk_usuario_id, titulo, descricao, status) VALUES (?, ?, ?, ?)',
            [dados.fk_usuario_id, dados.titulo, dados.descricao, dados.status]
        );
        return result.insertId;
    },

    async update(id, dados){
        const tarefaExistente = await this.getById(id);
        if (!tarefaExistente) return false;

        await pool.execute(
            'UPDATE tarefas SET fk_usuario_id = ?, titulo = ?, descricao = ?, status = ? WHERE id = ?',
            [dados.fk_usuario_id, dados.titulo, dados.descricao, dados.status, id]
        );
        return true;
    },

    async delete(id){
        const tarefaExistente = await this.getById(id);
        if (!tarefaExistente) return false;

        await pool.execute('DELETE FROM tarefas WHERE id = ?', [id]);
        return true;
    }
};
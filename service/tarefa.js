import pool from '../db/conect.js';




export const tarefa = {
    async getAll(){
    const [rows] = await pool.query('SELECT * FROM tarefas');
    return rows;
    },

    async getById(id){
        const [rows] = await pool.query('SELECT id, fk_usuario_id, titulo, descricao, status FROM tarefas WHERE id = ?', [id]);
        return rows[0];
    },

    async create(tarefa){
        const [result] = await pool.query('INSERT INTO tarefas (fk_usuario_id, titulo, descricao, status) VALUES (?, ?, ?, ?)',
        [tarefa.fk_usuario_id, tarefa.titulo, tarefa.descricao, tarefa.status]);
        return result;
    },

    async update(id, tarefa){
        const tarefaExistente = await this.getById(id)
        if (!tarefaExistente) return false;

        await pool.execute('UPDATE tarefas SET fk_usuario_id = ?, titulo = ?, descricao = ?, status = ? WHERE id = ?',
        [tarefa.fk_usuario_id, tarefa.titulo, tarefa.descricao, tarefa.status, id]);
        return true   
    },

    async delete(id){

        const tarefaExistente = await this.getById(id)
        if (!tarefaExistente) return false;

        await pool.execute('DELETE * FROM tarefas WHERE id= ?', [id])
        return true
    }
    
};


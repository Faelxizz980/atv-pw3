import pool from '../db/conect.js';

export const usuario ={

    async getAll(){
        const [rows] = await pool.query('SELECT * FROM usuarios');
        return rows;
    },

    async getById(id){
        const [rows] = await pool.query('SELECT id, email,nome FROM usuarios WHERE id=?', [id]);
        return rows[0];
        
    }
}
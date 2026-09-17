import pool from '../db/conect.js';
import bcrypt from 'bcrypt';

export const usuario = {

    async getAll(){
        const [rows] = await pool.query('SELECT id, email, nome FROM usuarios');
        return rows;
    },

    async getById(id){
        const [rows] = await pool.query('SELECT id, email, nome FROM usuarios WHERE id=?', [id]);
        return rows[0];
    },

    async getByEmail(email){
        const [rows] = await pool.query('SELECT id, email, nome FROM usuarios WHERE email=?', [email]);
        return rows[0];
    },

    async create(dados){
        const usuarioExistente = await usuario.getByEmail(dados.email);
        if (usuarioExistente) return false; // já existe, não cria de novo

        const senhaHash = await bcrypt.hash(dados.senha, 10);

        await pool.execute(
            'INSERT INTO usuarios(email, nome, senha) VALUES (?,?,?)',
            [dados.email, dados.nome, senhaHash]
        );
        return true;
    }
}
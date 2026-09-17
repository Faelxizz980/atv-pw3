import mysql from 'mysql2/promise';

const pool = await mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gerenciador_tarefas',
  waitforConnections: true,
  connectionLimit: 10,
  queueLimit: 10
});

export default pool;
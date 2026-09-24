import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = await mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'gerenciador_tarefas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 10
});

export default pool;

import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getDatabase() {
  if (!pool) {
    const config: mysql.PoolOptions = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'pizza_pos',
      port: parseInt(process.env.DB_PORT || '3306'),
      socketPath: process.env.DB_SOCKET || undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    pool = mysql.createPool(config);
  }
  return pool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const db = getDatabase();
  const [rows] = await db.execute(sql, params);
  return rows as T[];
}

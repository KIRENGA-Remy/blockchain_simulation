import { Pool } from 'pg';
import { config } from 'dotenv';
config();

export const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'blockchain_simulation',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
})

export async function initDatabase() : Promise<void> {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS blocks(
          id SERIAL PRIMARY KEY,
          nonce INTEGER NOT NULL DEFAULT 0,
          data TEXT NOT NULL DEFAULT '',
          prev_hash TEXT NOT NULL DEFAULT '',
          hash TEXT NOT NULL DEFAULT '',
          mined BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )`)

          // Check if the table is completely empty, and if so, insert the genesis block

          const { rows } = await pool.query('SELECT COUNT(*) AS cnt FROM blocks');

          const count = parseInt(rows[0].cnt, 10);

          if(count === 0) {
            await pool.query(`
                INSERT INTO blocks (nonce, data, prev_hash, hash, mined) 
                VALUES (0, 'Genesis Block', '', '', false)`);
                console.log('[DB] Genesis block seeded.');
                
          }
          console.log('[DB] Database initiated successfully.');
          
}
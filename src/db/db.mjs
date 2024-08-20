import pg from 'pg'
import dotenv from 'dotenv';
const { Pool } = pg
dotenv.config()

export const pool = new Pool({
    user: 'yusufkarback',
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.DB_PORT
})
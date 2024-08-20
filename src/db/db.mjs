import pg from 'pg'
const { Pool } = pg

export const pool = new Pool({
    user: 'yusufkarback',
    host: '34.28.122.219',
    database: 'sagara',
    password: 'sagaraYusuf',
    port: 5432
})
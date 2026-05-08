const fs = require('fs');
const path = require('path');

let pool;

async function getPool() {
    if (!pool) {
        const { createPool } = await import('mariadb');
        pool = createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            port: process.env.DB_PORT || 3306,
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'myapp',
            connectionLimit: 5
        });
    }
    return pool;
}

async function initDb() {
    const { createPool } = await import('mariadb');

    const dbName = process.env.DB_NAME || 'theater_go';

    const tempPool = createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        port: process.env.DB_PORT || 3306,
        password: process.env.DB_PASSWORD || '',
        connectionLimit: 1,
    });

    let conn;
    try {
        conn = await tempPool.getConnection();

        // Create DB if it doesn't exist
        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await conn.query(`USE \`${dbName}\``);

        // Check if tables already exist
        const tables = await conn.query(
            `SELECT COUNT(*) AS cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
            [dbName]
        );

        if (Number(tables[0].cnt) === 0) {
            console.log('No tables found. Running schema.sql...');
            const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

            // Strip comment-only lines and /*!...*/ conditional lines, split on ;
            const statements = schema
                .split('\n')
                .filter(line => {
                    const t = line.trim();
                    return t.length > 0 && !t.startsWith('--') && !t.startsWith('/*!');
                })
                .join('\n')
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const statement of statements) {
                await conn.query(statement);
            }
            console.log('Schema applied successfully.');
        } else {
            console.log(`Database "${dbName}" is ready.`);
        }
    } finally {
        if (conn) conn.release();
        await tempPool.end();
    }

    pool = createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        port: process.env.DB_PORT || 3306,
        password: process.env.DB_PASSWORD || '',
        database: dbName,
        connectionLimit: 5,
    });
}

module.exports = {
    initDb,
    getConnection: async () => (await getPool()).getConnection(),
    query: async (...args) => (await getPool()).query(...args),
};
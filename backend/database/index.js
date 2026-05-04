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

module.exports = {
    getConnection: async () => (await getPool()).getConnection(),
    query: async (...args) => (await getPool()).query(...args),
};
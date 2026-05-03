let pool;

async function getPool() {
    console.log("host is", process.env.DB_HOST, "user is", process.env.DB_USER, "password is", process.env.DB_PASSWORD, "database is", process.env.DB_NAME);
    if (!pool) {
        const { createPool } = await import('mariadb');
        pool = createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
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
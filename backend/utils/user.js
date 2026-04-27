const db = require("../database");

async function userAlreadyExists(email) {
    const conn = await db.getConnection();
    const result = await conn.query(
        "SELECT id,name,email,password FROM users WHERE email = ?",
        [email.trim().toLowerCase()],
    );
    conn.release();
    return result;
}

module.exports = { userAlreadyExists };

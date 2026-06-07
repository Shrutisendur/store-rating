const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function main() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Manager',
    database: 'storedb'
  });

  const hash = await bcrypt.hash('Admin@1234', 10);
  await db.query('DELETE FROM users WHERE email=?', ['admin@test.com']);
  await db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
    ['Administrator User Account', 'admin@test.com', hash, 'admin']
  );
  console.log('Admin created successfully!');
  process.exit();
}

main();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// ---- AUTH ROUTES ----

// Register
app.post('/register', async (req, res) => {
  const { name, email, password, address } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    'INSERT INTO users (name,email,password,address,role) VALUES (?,?,?,?,?)',
    [name, email, hash, address, 'user']
  );
  res.json({ message: 'Registered successfully' });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [[user]] = await db.query('SELECT * FROM users WHERE email=?', [email]);
  if (!user || !await bcrypt.compare(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.json({ token, role: user.role });
});

// ---- AUTH MIDDLEWARE ----
const auth = (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (roles.length && !roles.includes(user.role))
      return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// ---- ADMIN ROUTES ----
app.get('/admin/dashboard', auth(['admin']), async (req, res) => {
  const [[{ users }]] = await db.query('SELECT COUNT(*) as users FROM users');
  const [[{ stores }]] = await db.query('SELECT COUNT(*) as stores FROM stores');
  const [[{ ratings }]] = await db.query('SELECT COUNT(*) as ratings FROM ratings');
  res.json({ users, stores, ratings });
});

app.get('/admin/users', auth(['admin']), async (req, res) => {
  const [rows] = await db.query('SELECT id,name,email,address,role FROM users');
  res.json(rows);
});

app.post('/admin/users', auth(['admin']), async (req, res) => {
  const { name, email, password, address, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    'INSERT INTO users (name,email,password,address,role) VALUES (?,?,?,?,?)',
    [name, email, hash, address, role]
  );
  res.json({ message: 'User created' });
});

app.get('/admin/stores', auth(['admin']), async (req, res) => {
  const [rows] = await db.query(`
    SELECT s.*, AVG(r.rating) as avg_rating
    FROM stores s LEFT JOIN ratings r ON s.id=r.store_id
    GROUP BY s.id`);
  res.json(rows);
});

app.post('/admin/stores', auth(['admin']), async (req, res) => {
  const { name, email, address, owner_id } = req.body;
  await db.query(
    'INSERT INTO stores (name,email,address,owner_id) VALUES (?,?,?,?)',
    [name, email, address, owner_id]
  );
  res.json({ message: 'Store created' });
});

// ---- USER ROUTES ----
app.get('/stores', auth(['user']), async (req, res) => {
  const [rows] = await db.query(`
    SELECT s.*,
    AVG(r.rating) as avg_rating,
    (SELECT rating FROM ratings WHERE user_id=? AND store_id=s.id) as my_rating
    FROM stores s LEFT JOIN ratings r ON s.id=r.store_id
    GROUP BY s.id`, [req.user.id]);
  res.json(rows);
});

app.post('/ratings', auth(['user']), async (req, res) => {
  const { store_id, rating } = req.body;
  await db.query(
    `INSERT INTO ratings (user_id,store_id,rating) VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE rating=?`,
    [req.user.id, store_id, rating, rating]
  );
  res.json({ message: 'Rating saved' });
});

// Update password (all roles)
app.put('/password', auth(), async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  await db.query('UPDATE users SET password=? WHERE id=?', [hash, req.user.id]);
  res.json({ message: 'Password updated' });
});

// ---- STORE OWNER ROUTES ----
app.get('/owner/dashboard', auth(['store_owner']), async (req, res) => {
  const [[store]] = await db.query(
    'SELECT * FROM stores WHERE owner_id=?', [req.user.id]
  );
  const [raters] = await db.query(`
    SELECT u.name, u.email, r.rating
    FROM ratings r JOIN users u ON r.user_id=u.id
    WHERE r.store_id=?`, [store.id]
  );
  const [[{ avg }]] = await db.query(
    'SELECT AVG(rating) as avg FROM ratings WHERE store_id=?', [store.id]
  );
  res.json({ store, raters, avg_rating: avg });
});

app.listen(5000, () => console.log('Backend running on port 5000'));
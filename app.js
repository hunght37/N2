const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();
const port = 3000;
const db = require('./database');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Route chính
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Route đăng ký người dùng
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    // Kiểm tra xem dữ liệu có đầy đủ không
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

    db.run(query, [name, email, hashedPassword], function (err) {
        if (err) {
            console.error('Error inserting user:', err.message);
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Route đăng nhập
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM users WHERE email = ?`;

    db.get(query, [email], (err, user) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.json({ message: 'Login successful', userId: user.id });
    });
});

// Route thêm người dùng mới
app.post('/users', (req, res) => {
    const { name, email } = req.body;
    const query = `INSERT INTO users (name, email) VALUES (?, ?)`;
    db.run(query, [name, email], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Route lấy danh sách người dùng
app.get('/users', (req, res) => {
    const query = `SELECT * FROM users`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ users: rows });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

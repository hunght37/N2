const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();
const port = 3000;
const db = require('./database');

// Cấu hình express để sử dụng thư mục public cho các tệp tĩnh
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Đảm bảo phục vụ các tệp tĩnh từ thư mục 'public'

// Thêm thư mục 'private' cho các tệp bảo mật
app.use('/private', express.static(path.join(__dirname, 'private')));

// Route chính
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route đăng ký người dùng
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

    db.run(query, [name, email, hashedPassword], function (err) {
        if (err) {
            console.error('Error inserting user:', err.message);
            return res.status(400).json({ error: err.message });
        }
        // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
        res.json({ redirect: '/auth/login.html' });
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
        // Chuyển hướng đến trang chào mừng sau khi đăng nhập thành công
        res.json({ redirect: '/private/welcome.html' });
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

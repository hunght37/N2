const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000; // Sử dụng biến môi trường PORT
const db = require('./database');

// Cấu hình express để sử dụng thư mục public cho các tệp tĩnh
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Đảm bảo phục vụ các tệp tĩnh từ thư mục 'public'

// Thêm thư mục 'private' cho các tệp bảo mật
app.use('/private', express.static(path.join(__dirname, 'private')));

// Cài đặt session
app.use(session({
    secret: 'your-secret-key', // Đổi 'your-secret-key' thành một khóa bí mật mạnh
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Sử dụng true nếu triển khai trên HTTPS
}));

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

        // Lưu thông tin phiên làm việc
        req.session.userId = user.id;

        // Chuyển hướng đến trang chào mừng sau khi đăng nhập thành công
        res.json({ redirect: '/private/welcome.html' });
    });
});

// Route đăng xuất
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.json({ redirect: '/auth/login.html' });
    });
});

// Route lấy thông tin người dùng hiện tại
app.get('/current-user', (req, res) => {
    const userId = req.session.userId; // Lấy ID người dùng từ session

    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const query = `SELECT name FROM users WHERE id = ?`;
    db.get(query, [userId], (err, user) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ name: user.name });
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

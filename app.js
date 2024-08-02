const express = require('express');
const app = express();
const port = 3000;
const db = require('./database');

// Middleware để xử lý JSON và URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware để phục vụ các tệp tĩnh từ thư mục 'public'
app.use(express.static('public'));

// Route chính để gửi tệp HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Route để thêm người dùng mới
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

// Route để lấy danh sách người dùng
app.get('/users', (req, res) => {
    const query = `SELECT * FROM users`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ users: rows });
    });
});

// Khởi động server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

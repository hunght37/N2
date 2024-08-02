const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Tạo kết nối đến cơ sở dữ liệu SQLite
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

// Tạo bảng người dùng nếu chưa tồn tại
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);
});

module.exports = db;

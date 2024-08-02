const sqlite3 = require('sqlite3').verbose();

// Tạo và kết nối đến cơ sở dữ liệu SQLite trong bộ nhớ
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

db.serialize(() => {
    // Tạo bảng users nếu chưa tồn tại
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);
});

module.exports = db;

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Mở cơ sở dữ liệu SQLite
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

// Truy vấn danh sách người dùng
db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
        throw err;
    }

    // Chuyển đổi danh sách người dùng thành JSON
    const usersJson = JSON.stringify(rows, null, 2);

    // Lưu danh sách người dùng vào tệp
    fs.writeFile('usersList.json', usersJson, (err) => {
        if (err) {
            throw err;
        }
        console.log('User list has been saved to usersList.json');
    });
});

// Đóng cơ sở dữ liệu
db.close();

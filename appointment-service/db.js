const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'appointment_db',
    port: 3306
});

db.connect(err => {
    if (err) {
        console.error('Gagal konek database:', err);
    } else {
        console.log('Berhasil konek ke appointment_db');
    }
});

module.exports = db;
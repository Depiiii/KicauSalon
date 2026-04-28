const mysql = require('mysql2');
require('dotenv').config();

// Koneksi ke Database Kamu
const db1 = mysql.createConnection({
    host: process.env.DB1_HOST,
    user: process.env.DB1_USER,
    password: process.env.DB1_PASSWORD,
    database: process.env.DB1_NAME,
    port: process.env.DB1_PORT
});

// Koneksi ke Database Teman
const db2 = mysql.createConnection({
    host: process.env.DB2_HOST,
    user: process.env.DB2_USER,
    password: process.env.DB2_PASSWORD,
    database: process.env.DB2_NAME,
    port: process.env.DB2_PORT
});

db1.connect(err => {
    if (err) console.error('Gagal konek ke DB1:', err);
    else console.log('Berhasil konek ke DB1 (Punya Kamu)');
});

db2.connect(err => {
    if (err) console.error('Gagal konek ke DB2:', err);
    else console.log('Berhasil konek ke DB2 (Punya Teman)');
});

module.exports = { db1, db2 };
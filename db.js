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

const db3 = mysql.createConnection({
    host: process.env.DB3_HOST,
    user: process.env.DB3_USER,
    password: process.env.DB3_PASSWORD,
    database: process.env.DB3_NAME,
    port: process.env.DB3_PORT
});

const db4 = mysql.createConnection({
    host: process.env.DB4_HOST,
    user: process.env.DB4_USER,
    password: process.env.DB4_PASSWORD,
    database: process.env.DB4_NAME,
    port: process.env.DB4_PORT
});

db1.connect(err => {
    if (err) console.error('Gagal konek ke DB1:', err);
    else console.log('Berhasil konek ke DB1 (Punya Kamu)');
});

db2.connect(err => {
    if (err) console.error('Gagal konek ke DB2:', err);
    else console.log('Berhasil konek ke DB2 (Punya Teman)');
});

db3.connect(err => {
    if (err) console.error('Gagal konek ke DB3:', err);
    else console.log('Berhasil konek ke DB3 (Punya Teman)');
});
db4.connect(err => {
    if (err) console.error('Gagal konek ke DB4:', err);
    else console.log('Berhasil konek ke DB4 (Appoinment)');
});
module.exports = { db1, db2, db3, db4 };
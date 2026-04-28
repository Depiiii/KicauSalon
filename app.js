const express = require('express');
const app = express();
// Perhatikan: sekarang kita ambil db1 dan db2 dari file db.js
const { db1, db2 } = require('./db'); 

app.use(express.json()); 

// --- FITUR KATALOG ---
app.get('/api/catalog', (req, res) => {
    // Menggunakan db2 karena tabel katalog ada di sana
    db2.query('SELECT * FROM catalogs', (err, results) => {
        if (err) {
            console.error('Error DB2:', err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});




// --- FITUR STYLISH ---
app.get('/api/stylish', (req, res) => {
    // Menggunakan db1
    db1.query('SELECT * FROM stylish', (err, results) => {
        if (err) {
            console.error('Error DB1:', err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// --- FITUR APPOINTMENT ---
app.post('/api/appointment', (req, res) => {
    const { id_user, id_catalog, id_stylish, tanggal, jam } = req.body;
    const query = 'INSERT INTO appointments (id_user, id_catalog, id_stylish, tanggal, jam) VALUES (?, ?, ?, ?, ?)';
    
    db1.query(query, [id_user, id_catalog, id_stylish, tanggal, jam], (err, result) => {
        if (err) {
            console.error('Error DB1 saat insert:', err);
            return res.status(500).send(err);
        }
        res.json({ message: 'Booking berhasil dibuat di DB1!', id: result.insertId });
    });
});

// --- 4. JALANKAN SERVER ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server KicauSalon jalan di http://localhost:${PORT}`);
    console.log('Terkoneksi ke dua database Railway sekaligus!');
});
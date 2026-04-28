const express = require('express');
const app = express();

const { db1, db2 } = require('./db'); 

app.use(express.json()); 

// --- FITUR KATALOG ---
app.get('/api/catalog', (req, res) => {

    db2.query('SELECT * FROM katalog', (err, results) => {
        if (err) {
            console.error('Error DB2 katalog :', err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});




// --- FITUR STYLIST ---
app.get('/api/stylist', (req, res) => {
    // Menggunakan db1
    db1.query('SELECT * FROM Stylist', (err, results) => {
        if (err) {
            console.error('Error DB1 stylist :', err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// --- FITUR APPOINTMENT(BLOM FIX YAK SI JOIN NYA BELOMM) ---
app.post('/api/appointment', (req, res) => {
    const {id_appointment, tanggal, no_telp, layanan, harga, status, jam, id_user, id_stylist, nama_stylist, nama_user} = req.body;
    const query = 'INSERT INTO appointment (id_appointment, tanggal, no_telp, layanan, harga, status, jam, id_user, id_stylist, nama_stylist, nama_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    
    db1.query(query, [id_appointment, tanggal, no_telp, layanan, harga, status, jam, id_user, id_stylist, nama_stylist, nama_user], (err, result) => {
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
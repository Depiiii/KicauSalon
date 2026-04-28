const express = require('express');
const app = express();

const { db1, db2 } = require('./db'); 

app.use(express.json()); 

app.post('/api/register', (req, res) => {
    const { nama, email, password, no_telepon } = req.body;
    const query = 'INSERT INTO users (nama, email, password, no_telepon) VALUES (?, ?, ?, ?)';
    
    db1.query(query, [nama, email, password, no_telepon], (err, result) => {
        if (err) {
            console.error('Error saat register:', err);
            return res.status(500).send(err);
        }
        res.json({ message: 'User berhasil register!', id: result.insertId });
    });
});

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
    //make db2 punya depipit
    db2.query('SELECT * FROM Stylist', (err, results) => {
        if (err) {
            console.error('Error DB2 stylist :', err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

//MASIH NYOBA NYOBA
app.post('/api/appointment', (req, res) => {
    const {
        tanggal, 
        no_telepon, 
        layanan, 
        harga, 
        status, 
        jam, 
        id_user, 
        id_stylist, 
        nama_stylist, 
        nama_user
    } = req.body;

    // Sekarang kolom no_telepon sudah sama antara DB dan Kode
    const query = `
        INSERT INTO appointment 
        (tanggal, no_telepon, layanan, harga, status, jam, id_user, id_stylist, nama_stylist, nama_user) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [tanggal, no_telepon, layanan, harga, status, jam, id_user, id_stylist, nama_stylist, nama_user];

    db1.query(query, values, (err, result) => {
        if (err) {
            console.error('Error DB1 saat insert appointment:', err);
            return res.status(500).send(err);
        }
        res.json({ message: 'Booking berhasil dibuat di DB1!', id: result.insertId });
    });
});


//JALANKAN SERVER
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server KicauSalon jalan di http://localhost:${PORT}`);
    console.log('Terkoneksi ke DB1 (User/Booking) dan DB2 (Katalog/Stylist)');
});
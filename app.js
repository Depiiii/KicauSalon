const express = require('express');
const app = express();

const { db1, db2, db3 } = require('./db'); 

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
app.put('/api/users/:id_user', (req, res) => {
const id = parseInt(req.params.id_user);
    const { nama, email, password, no_telepon } = req.body;

        console.log('ID:', id);
    console.log('Body:', req.body);

    if (!id) {
        return res.status(400).json({ message: 'ID tidak valid' });
    }
    const query = `
        UPDATE users 
        SET nama = ?, email = ?, password = ?, no_telepon = ?
        WHERE id_user = ?
    `;

    db1.query(query, [nama, email, password, no_telepon, id], (err, result) => {
        if (err) {
            console.error('Error saat update user:', err);
            return res.status(500).send(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        res.json({ message: 'User berhasil diupdate!' });
    });
});

app.get('/api/users', (req, res) => {
    const id = parseInt(req.params.id_user);
    const query = 'SELECT * FROM users';
    db1.query(query, (err, results) => {
        if (err) {
            console.error('Error saat mengambil user:', err);
            return res.status(500).send
        }(err);
        res.json(results);
    });
});

// --- FITUR GET KATALOG (Sudah JOIN dengan Stylist) ---
app.get('/api/catalog', async (req, res) => {
    try {
        // 1. Ambil data katalog dari DB2
        const [katalogRows] = await db2.promise().query('SELECT * FROM katalog');
        
        // 2. Ambil data stylist dari DB3
        const [stylistRows] = await db3.promise().query('SELECT * FROM Stylist');

        // 3. Gabungkan datanya di JavaScript
        const hasilGabungan = katalogRows.map(kt => {
            // Cari data stylist yang ID-nya cocok dengan id_stylist di katalog
            const st = stylistRows.find(s => s.id_stylist === kt.id_stylist);
            
            return {
                id_katalog: kt.id_katalog,
                nama_layanan: kt.nama_layanan,
                nama_stylist: st ? st.nama : 'Tidak diketahui',
                status: st ? st.status : '-',
                harga: st ? st.harga : 0
            };
        });

        res.json(hasilGabungan);

    } catch (err) {
        console.error('Error gabung DB2 & DB3:', err);
        res.status(500).send('Gagal mengambil data dari dua database');
    }
});

// --- FITUR GET KATALOG (Tambah Layanan Baru) ---
app.get('/api/catalog', (req, res) => {
    // SEMUA NAMA TABEL PAKAI HURUF KECIL
    const query = `
        SELECT 
            kt.id_katalog, 
            kt.nama_layanan, 
            st.nama AS nama_stylist, 
            st.status, 
            st.harga 
        FROM katalog kt 
        JOIN stylist st ON kt.id_stylist = st.id_stylist
    `;

    db2.query(query, (err, results) => {
        if (err) {
            console.error('Error DB2 ambil katalog:', err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// --- FITUR POST KATALOG (Dengan Validasi ID Stylist dari DB3) ---
app.post('/api/katalog', (req, res) => {
    const { id_stylist, nama_layanan } = req.body;

    // 1. Validasi awal: pastikan data tidak kosong
    if (!id_stylist || !nama_layanan) {
        return res.status(400).json({ message: 'ID Stylist dan nama layanan harus diisi' });
    }

    // 2. Cek apakah id_stylist ada di DB3 (Tabel Stylist)
    const checkStylistQuery = 'SELECT id_stylist FROM Stylist WHERE id_stylist = ?';
    
    db3.query(checkStylistQuery, [id_stylist], (err, results) => {
        if (err) {
            console.error('Error saat validasi stylist di DB3:', err);
            return res.status(500).json({ message: 'Gagal memvalidasi stylist', error: err });
        }

        // Jika hasil query kosong, berarti ID tidak ditemukan
        if (results.length === 0) {
            return res.status(404).json({ 
                message: `Gagal tambah katalog. Stylist dengan ID ${id_stylist} tidak ditemukan!` 
            });
        }

        // 3. Jika ID ditemukan, baru jalankan INSERT ke DB2
        const insertQuery = 'INSERT INTO katalog (id_stylist, nama_layanan) VALUES (?, ?)';
        db2.query(insertQuery, [id_stylist, nama_layanan], (err, result) => {
            if (err) {
                console.error('Error saat tambah katalog ke DB2:', err);
                return res.status(500).json({ message: 'Gagal input ke database katalog', error: err });
            }
            res.json({ 
                message: 'Katalog berhasil ditambah!', 
                id_katalog: result.insertId 
            });
        });
    });
});

/// --- FITUR STYLIST ---
app.get('/api/stylist', (req, res) => {
    db3.query('SELECT * FROM Stylist', (err, results) =>
{
    if (err) {
        console.error('Error DB stylist :', err);
        return res.status(500).json({
            message: 'Gagal mengambil data stylist', error: err }); }
            res.json(results); }); 
        });

app.post('/api/stylist', (req, res) => { 
    const {id_stylist, nama, status, harga} = req.body;      

    const sql = "INSERT INTO Stylist (id_stylist, nama, status, harga) VALUES (?, ?, ?, ?)";

    db3.query(sql, [id_stylist, nama, status, harga], (err, result) => {
        if (err) { console.error('Error insert stylist :', err); return res.status(500).json
            ({ message: "Database error", error: err 
            }); 
        }
        res.json({ message: "Insert berhasil", id_disimpan: id_stylist 

        }); 
    }); 
});

app.delete('/api/stylist/:id', (req, res) => {
    const id = req.params.id; 
    const sql = "DELETE FROM Stylist WHERE id_stylist = ?";

    db3.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error delete stylist:', err);
            return res.status(500).json({ 
                message: "Gagal menghapus data", 
                error: err 
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: "Data stylist tidak ditemukan" 
            });
        }

        res.json({ 
            message: "Data stylist berhasil dihapus", 
            id_terhapus: id 
        });
    });
});

//  --FITUR DELETE KATALOG --
app.delete('/katalog/:id', (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM katalog WHERE id_katalog = ?";

    db2.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Data tidak ditemukan"
            });
        }

        res.json({
            message: "Data berhasil dihapus",
            id
        });
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
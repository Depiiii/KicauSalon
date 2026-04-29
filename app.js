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
/*app.get('/api/catalog', (req, res) => {
    // Kita gabungkan tabel katalog dan Stylist berdasarkan id_stylist
    const query = `
        SELECT katalog.*, Stylist.nama_stylist 
        FROM katalog 
        JOIN Stylist ON katalog.id_stylist = Stylist.id_stylist
    `;

    db2.query(query, (err, results) => {
        if (err) {
            console.error('Error DB2 ambil katalog:', err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
}); 
*/

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

// --- FITUR POST KATALOG (Tambah Layanan Baru) ---
app.post('/api/catalog', (req, res) => {
    const { id_stylist, layanan } = req.body; // Ambil cuma 2 data

    // Pastikan di sini cuma ada 2 kolom: id_stylist dan nama_layanan
    const query = 'INSERT INTO katalog (id_stylist, nama_layanan) VALUES (?, ?)';

    db2.query(query, [id_stylist, layanan], (err, result) => {
        if (err) {
            console.error('Error saat tambah katalog:', err);
            return res.status(500).send(err);
        }
        res.json({ message: 'Katalog berhasil ditambah!', id: result.insertId });
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
const express = require('express');
const app = express();

const { db1, db2, db3, db4 } = require('./db'); 

app.use(express.json()); 
// -------------------------------------------------------- USER AREA --------------------------------------------------------
// FITUR REGISTER USER
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
// FITUR UPDATE USER
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

// FITUR GET USER
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

// -------------------------------------------------------- KATALOG AREA --------------------------------------------------------
//GET KATALOG (INI UDH DETAIL JADI GAPERLU DETAIL KATALOG)
app.get('/api/katalog', async (req, res) => {
    try {
        const [katalogRows] = await db2.promise().query('SELECT * FROM katalog');
        const [stylistRows] = await db3.promise().query('SELECT * FROM Stylist');
        const hasilGabungan = katalogRows.map(kt => {
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

// --- FITUR GET KATALOG ---
app.get('/api/katalog', (req, res) => {
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

// --- FITUR TAMBAH KATALOG ---
app.post('/api/katalog', (req, res) => {
    const { id_stylist, nama_layanan } = req.body;

    if (!id_stylist || !nama_layanan) {
        return res.status(400).json({ message: 'ID Stylist dan nama layanan harus diisi' });
    }
    const checkStylistQuery = 'SELECT id_stylist FROM Stylist WHERE id_stylist = ?';
    db3.query(checkStylistQuery, [id_stylist], (err, results) => {
        if (err) {
            console.error('Error saat validasi stylist di DB3:', err);
            return res.status(500).json({ message: 'Gagal memvalidasi stylist', error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ 
                message: `Gagal tambah katalog. Stylist dengan ID ${id_stylist} tidak ditemukan!` 
            });
        }
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

// --- FITUR EDIT KATALOG ---
app.put('/api/katalog/:id', (req, res) => {
    const id_katalog = req.params.id;
    const { id_stylist, nama_layanan } = req.body;

    if (!id_stylist || !nama_layanan) {
        return res.status(400).json({ message: 'ID Stylist dan nama layanan harus diisi' });
    }

    const checkStylistQuery = 'SELECT id_stylist FROM Stylist WHERE id_stylist = ?';
    
    db3.query(checkStylistQuery, [id_stylist], (err, results) => {
        if (err) {
            console.error('Error saat validasi stylist di DB3:', err);
            return res.status(500).json({ message: 'Gagal memvalidasi stylist', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                message: `Gagal update. Stylist dengan ID ${id_stylist} tidak ditemukan di database!` 
            });
        }
        
        const updateQuery = `
            UPDATE katalog 
            SET id_stylist = ?, nama_layanan = ? 
            WHERE id_katalog = ?
        `;

        db2.query(updateQuery, [id_stylist, nama_layanan, id_katalog], (err, result) => {
            if (err) {
                console.error('Error saat update katalog di DB2:', err);
                return res.status(500).json({ message: 'Gagal update database katalog', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Data katalog tidak ditemukan' });
            }

            res.json({ 
                message: 'Katalog berhasil diperbarui!',
                id_katalog: id_katalog
            });
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

// -------------------------------------------------------- STYLIST AREA --------------------------------------------------------

// --- FITUR GET STYLIST ---
app.get('/api/stylist', (req, res) => {
    db3.query('SELECT * FROM Stylist', (err, results) =>
{
    if (err) {
        console.error('Error DB stylist :', err);
        return res.status(500).json({
            message: 'Gagal mengambil data stylist', error: err }); }
            res.json(results); }); 
        });

// --- FITUR TAMBAH STYLIST ---
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

// --- FITUR HAPUS STYLIST ---
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

// --- FITUR EDIT STYLIST ---
app.put('/api/stylist/:id', (req, res) => {
    const id = req.params.id; 
    const { nama, status, harga } = req.body; 

    const sql = "UPDATE Stylist SET nama = ?, status = ?, harga = ? WHERE id_stylist = ?";

    db3.query(sql, [nama, status, harga, id], (err, result) => {
        if (err) {
            console.error('Error update stylist:', err);
            return res.status(500).json({ 
                message: "Gagal mengubah data", 
                error: err 
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: "Data stylist tidak ditemukan" 
            });
        }

        res.json({ 
            message: "Data stylist berhasil diubah", 
            id_diubah: id 
        });
    });
});


// -------------------------------------------------------- APPOINTMENT AREA --------------------------------------------------------
// --- TAMBAH APPOINTMENT ---
app.post('/api/appointment', async (req, res) => {
    try {
        const { tanggal, jam, id_user, id_katalog } = req.body;

        if (!tanggal || !jam || !id_user || !id_katalog) {
            return res.status(400).json({
                message: "Data tidak lengkap"
            });
        }

        const [userData] = await db1.promise().query(
            'SELECT nama, no_telepon FROM users WHERE id_user = ?',
            [id_user]
        );

        if (userData.length === 0) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        const user = userData[0];

        const [katalogData] = await db2.promise().query(
            'SELECT * FROM katalog WHERE id_katalog = ?',
            [id_katalog]
        );

        if (katalogData.length === 0) {
            return res.status(404).json({
                message: "Katalog tidak ditemukan"
            });
        }

        const katalog = katalogData[0];

        const [stylistData] = await db3.promise().query(
            'SELECT * FROM Stylist WHERE id_stylist = ?',
            [katalog.id_stylist]
        );

        if (stylistData.length === 0) {
            return res.status(404).json({
                message: "Stylist tidak ditemukan"
            });
        }

        const stylist = stylistData[0];

        const query = `
            INSERT INTO appointment
            (tanggal, Jam, status, id_user, id_katalog, no_telepon, layanan, nama_stylist, harga, nama_user)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            tanggal,
            jam,
            'tidak tersedia',
            id_user,
            id_katalog,
            user.no_telepon,
            katalog.nama_layanan,
            stylist.nama,
            stylist.harga,
            user.nama
        ];

        const [result] = await db4.promise().query(query, values);

        res.json({
            message: "Appointment berhasil dibuat",
            id: result.insertId
        });

    } catch (err) {
        console.error('Error appointment:', err);
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
});


//JALANKAN SERVER
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server KicauSalon jalan di http://localhost:${PORT}`);
    console.log('Terkoneksi ke DB1 (User/Booking) dan DB2 (Katalog/Stylist)');
});
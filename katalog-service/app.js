require('dotenv').config();

const express = require('express');
const app = express();

const db = require('./db');

app.use(express.json());
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

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server KicauSalon jalan di http://localhost:${PORT}`);
    console.log('Service Katalog berjalan dengan database katalog_db');
});
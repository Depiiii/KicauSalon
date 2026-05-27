require('dotenv').config();

const express = require('express');
const app = express();

const db = require('./db');

app.use(express.json());
// -------------------------------------------------------- STYLIST AREA --------------------------------------------------------

// --- FITUR GET STYLIST ---
app.get('/api/stylist', (req, res) => {
    db.query('SELECT * FROM Stylist', (err, results) =>
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

    db.query(sql, [id_stylist, nama, status, harga], (err, result) => {
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

    db.query(sql, [id], (err, result) => {
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

    db.query(sql, [nama, status, harga, id], (err, result) => {
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

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server KicauSalon jalan di http://localhost:${PORT}`);
    console.log('Service Stylist berjalan dengan database stylist_db');
});
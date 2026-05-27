require('dotenv').config();

const express = require('express');
const app = express();

const db = require('./db');

app.use(express.json());
// -------------------------------------------------------- USER AREA --------------------------------------------------------
// FITUR REGISTER USER
app.post('/api/register', (req, res) => {
    const { nama, email, password, no_telepon } = req.body;
    const query = 'INSERT INTO users (nama, email, password, no_telepon) VALUES (?, ?, ?, ?)';
    
    db.query(query, [nama, email, password, no_telepon], (err, result) => {
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

    db.query(query, [nama, email, password, no_telepon, id], (err, result) => {
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
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error saat mengambil user:', err);
            return res.status(500).send
        }(err);
        res.json(results);
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server KicauSalon jalan di http://localhost:${PORT}`);
    console.log('Service User berjalan dengan database user_db');
});
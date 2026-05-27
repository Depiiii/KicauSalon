require('dotenv').config();

const express = require('express');
const app = express();

const db = require('./db');

app.use(express.json());

// -------------------------------------------------------- APPOINTMENT AREA --------------------------------------------------------
// --- TAMBAH APPOINTMENT ---
app.post('/api/appointment', async (req, res) => {
    try {
        const { tanggal, jam, id_user, id_katalog } = req.body;

        if (!tanggal || jam === undefined || jam === null || !id_user || !id_katalog) {
            return res.status(400).json({
                message: "Data tidak lengkap"
            });
        }

        //VALIDASI JAM
        const jamInt = parseInt(jam);

        if (isNaN(jamInt) || jamInt < 8 || jamInt > 22) {
            return res.status(400).json({
                message: "Jam tidak valid! Pilih jam antara 8 sampai 22"
            });
        }

        // CEK BENTROK
        const [bookedRows] = await db4.promise().query(
            `SELECT Jam FROM appointment 
             WHERE tanggal = ? AND status != 'Dibatalkan'`,
            [tanggal]
        );

        const jamDibooked = bookedRows.map(r => r.Jam);
        if (jamDibooked.includes(jamInt)) {
            const semuaJam = Array.from({ length: 15 }, (_, i) => i + 8);
            const jamTersedia = semuaJam.filter(j => !jamDibooked.includes(j));
            return res.status(409).json({
                message: `Jam ${jamInt}:00 pada tanggal ${tanggal} sudah dibooking!`,
                jam_tersedia: jamTersedia.length > 0 ? jamTersedia : null,
                saran: jamTersedia.length > 0
                    ? `Pilih jam lain yang tersedia: ${jamTersedia.map(j => j + ':00').join(', ')}`
                    : `Tidak ada jam tersisa pada tanggal ${tanggal}`
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
            jamInt,
            'Belum Bayar',
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
            message: `Appointment berhasil dibuat pada jam ${jamInt}:00`,
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

// --- UPDATE APPOINTMENT ---
app.put('/api/appointment/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { tanggal, jam, id_user, id_katalog, status } = req.body;

        const statusValid = ['Belum Bayar', 'Lunas'];
        if (status && !statusValid.includes(status)) {
        return res.status(400).json({ 
            message: 'Status tidak valid! Pilihan: Belum Bayar / Lunas' 
        });
}

        const [appointmentData] = await db4.promise().query(
            'SELECT * FROM appointment WHERE id_appointment = ?',
            [id]
        );

        if (appointmentData.length === 0) {
            return res.status(404).json({ message: 'Appointment tidak ditemukan' });
        }

        const existing = appointmentData[0];

        let userFields = {
            id_user: existing.id_user,
            nama_user: existing.nama_user,
            no_telepon: existing.no_telepon
        };

        if (id_user) {
            const [userData] = await db1.promise().query(
                'SELECT nama, no_telepon FROM users WHERE id_user = ?',
                [id_user]
            );
            if (userData.length === 0) {
                return res.status(404).json({ message: 'User tidak ditemukan' });
            }
            userFields = {
                id_user,
                nama_user: userData[0].nama,
                no_telepon: userData[0].no_telepon
            };
        }

        let katalogFields = {
            id_katalog: existing.id_katalog,
            layanan: existing.layanan,
            nama_stylist: existing.nama_stylist,
            harga: existing.harga
        };

        if (id_katalog) {
            const [katalogData] = await db2.promise().query(
                'SELECT * FROM katalog WHERE id_katalog = ?',
                [id_katalog]
            );
            if (katalogData.length === 0) {
                return res.status(404).json({ message: 'Katalog tidak ditemukan' });
            }

            const [stylistData] = await db3.promise().query(
                'SELECT * FROM Stylist WHERE id_stylist = ?',
                [katalogData[0].id_stylist]
            );
            if (stylistData.length === 0) {
                return res.status(404).json({ message: 'Stylist tidak ditemukan' });
            }

            katalogFields = {
                id_katalog,
                layanan: katalogData[0].nama_layanan,
                nama_stylist: stylistData[0].nama,
                harga: stylistData[0].harga
            };
        }

        const query = `
            UPDATE appointment
            SET tanggal = ?, Jam = ?, status = ?, id_user = ?, id_katalog = ?,
                no_telepon = ?, layanan = ?, nama_stylist = ?, harga = ?, nama_user = ?
            WHERE id_appointment = ?
        `;

        const values = [
            tanggal      || existing.tanggal,
            jam          || existing.Jam,
            status       || existing.status,
            userFields.id_user,
            katalogFields.id_katalog,
            userFields.no_telepon,
            katalogFields.layanan,
            katalogFields.nama_stylist,
            katalogFields.harga,
            userFields.nama_user,
            id
        ];

        await db4.promise().query(query, values);

        res.json({
            message: 'Appointment berhasil diupdate!',
            id_appointment: id
        });

    } catch (err) {
        console.error('Error update appointment:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

// --- DELETE APPOINTMENT ---
app.delete('/api/appointment/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const [appointmentData] = await db4.promise().query(
            'SELECT * FROM appointment WHERE id_appointment = ?',
            [id]
        );

        if (appointmentData.length === 0) {
            return res.status(404).json({ message: 'Appointment tidak ditemukan' });
        }

        await db4.promise().query(
            'DELETE FROM appointment WHERE id_appointment = ?',
            [id]
        );

        res.json({
            message: 'Appointment berhasil dihapus',
            id_terhapus: id
        });

    } catch (err) {
        console.error('Error delete appointment:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

//JALANKAN SERVER
const PORT = 3004;
app.listen(PORT, () => {
    console.log(`Server KicauSalon jalan di http://localhost:${PORT}`);
    console.log('Service Appointment berjalan dengan database appointment_db');
});
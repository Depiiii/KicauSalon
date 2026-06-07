require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const app = express();

// Import koneksi database sesuai struktur service
const db = require('./db');
const dbUser = require('../user-service/db');
const dbKatalog = require('../katalog-service/db');
const dbStylist = require('../stylist-service/db');

app.use(cors());
app.use(express.json());

// -------------------------------------------------------- APPOINTMENT AREA --------------------------------------------------------

// ================= SCHEMA =================
const schema = buildSchema(`
    type Appointment {
        id_appointment: ID!
        tanggal: String
        Jam: Int
        status: String
        id_user: Int
        id_katalog: Int
        no_telepon: String
        layanan: String
        nama_stylist: String
        harga: Float
        nama_user: String
    }

    type Query {
        getAppointments: [Appointment]
    }

    type Mutation {
        createAppointment(
            tanggal: String!
            jam: Int!
            id_user: Int!
            id_katalog: Int!
        ): String

        updateAppointment(
            id: ID!
            tanggal: String
            jam: Int
            id_user: Int
            id_katalog: Int
            status: String
        ): String

        deleteAppointment(id: ID!): String
    }
`);

const root = {
    // --- FITUR GET ALL APPOINTMENT ---
    getAppointments: () => {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM appointment ORDER BY tanggal DESC, Jam DESC',
                (err, results) => {
                    if (err) reject(new Error('Gagal mengambil data appointment: ' + err.message));
                    resolve(results);
                }
            );
        });
    },

    // --- FITUR TAMBAH APPOINTMENT (LINTAS SERVICE) ---
    createAppointment: ({ tanggal, jam, id_user, id_katalog }) => {
        return new Promise((resolve, reject) => {
            const jamInt = parseInt(jam);
            if (isNaN(jamInt) || jamInt < 8 || jamInt > 22) {
                return reject(new Error('Jam tidak valid! Pilih jam antara 8 sampai 22'));
            }

            // 1. Cek bentrok jam
            db.query(
                `SELECT Jam FROM appointment WHERE tanggal = ? AND status != 'Dibatalkan'`,
                [tanggal],
                (err, bookedRows) => {
                    if (err) return reject(err);

                    const jamDibooked = bookedRows.map(r => r.Jam);
                    if (jamDibooked.includes(jamInt)) {
                        return reject(new Error(`Jam ${jamInt}:00 pada tanggal ${tanggal} sudah dibooking!`));
                    }

                    // 2. Ambil data User dari dbUser
                    dbUser.query('SELECT nama, no_telepon FROM users WHERE id_user = ?', [id_user], (errUser, userData) => {
                        if (errUser) return reject(errUser);
                        if (userData.length === 0) return reject(new Error('User tidak ditemukan'));
                        const user = userData[0];

                        // 3. Ambil data Katalog dari dbKatalog
                        dbKatalog.query('SELECT * FROM katalog WHERE id_katalog = ?', [id_katalog], (errKatalog, katalogData) => {
                            if (errKatalog) return reject(errKatalog);
                            if (katalogData.length === 0) return reject(new Error('Katalog tidak ditemukan'));
                            const katalog = katalogData[0];

                            // 4. Ambil data Stylist dari dbStylist
                            dbStylist.query('SELECT * FROM Stylist WHERE id_stylist = ?', [katalog.id_stylist], (errStylist, stylistData) => {
                                if (errStylist) return reject(errStylist);
                                if (stylistData.length === 0) return reject(new Error('Stylist tidak ditemukan'));
                                const stylist = stylistData[0];

                                // 5. Simpan ke database Appointment (db)
                                const queryInsert = `
                                    INSERT INTO appointment
                                    (tanggal, Jam, status, id_user, id_katalog, no_telepon, layanan, nama_stylist, harga, nama_user)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                `;
                                const values = [
                                    tanggal, jamInt, 'Belum Bayar', id_user, id_katalog,
                                    user.no_telepon, katalog.nama_layanan, stylist.nama, stylist.harga, user.nama
                                ];

                                db.query(queryInsert, values, (errInsert, result) => {
                                    if (errInsert) return reject(errInsert);
                                    resolve(`Appointment berhasil dibuat pada jam ${jamInt}:00 dengan ID: ${result.insertId}`);
                                });
                            });
                        });
                    });
                }
            );
        });
    },

    // --- FITUR UPDATE APPOINTMENT ---
    updateAppointment: ({ id, tanggal, jam, id_user, id_katalog, status }) => {
        return new Promise((resolve, reject) => {
            const statusValid = ['Belum Bayar', 'Lunas'];
            if (status && !statusValid.includes(status)) {
                return reject(new Error('Status tidak valid! Pilihan: Belum Bayar / Lunas'));
            }

            db.query('SELECT * FROM appointment WHERE id_appointment = ?', [id], (errExist, appointmentData) => {
                if (errExist) return reject(errExist);
                if (appointmentData.length === 0) return reject(new Error('Appointment tidak ditemukan'));
                const existing = appointmentData[0];

                // default values pakai yang lama
                let targetUser = { id_user: existing.id_user, nama_user: existing.nama_user, no_telepon: existing.no_telepon };
                let targetKatalog = { id_katalog: existing.id_katalog, layanan: existing.layanan, nama_stylist: existing.nama_stylist, harga: existing.harga };

                const jalankanUpdate = () => {
                    const queryUpdate = `
                        UPDATE appointment
                        SET tanggal = ?, Jam = ?, status = ?, id_user = ?, id_katalog = ?,
                            no_telepon = ?, layanan = ?, nama_stylist = ?, harga = ?, nama_user = ?
                        WHERE id_appointment = ?
                    `;
                    const valuesUpdate = [
                        tanggal || existing.tanggal,
                        jam || existing.Jam,
                        status || existing.status,
                        targetUser.id_user,
                        targetKatalog.id_katalog,
                        targetUser.no_telepon,
                        targetKatalog.layanan,
                        targetKatalog.nama_stylist,
                        targetKatalog.harga,
                        targetUser.nama_user,
                        id
                    ];

                    db.query(queryUpdate, valuesUpdate, (errUp) => {
                        if (errUp) return reject(errUp);
                        resolve(`Appointment ID ${id} berhasil diperbarui!`);
                    });
                };

                // Kondisi cek id_user baru jika dikirim
                if (id_user) {
                    dbUser.query('SELECT nama, no_telepon FROM users WHERE id_user = ?', [id_user], (eUser, rUser) => {
                        if (eUser || rUser.length === 0) return reject(new Error('User tidak ditemukan'));
                        targetUser = { id_user, nama_user: rUser[0].nama, no_telepon: rUser[0].no_telepon };
                        
                        if (id_katalog) {
                            prosesKatalog();
                        } else {
                            jalankanUpdate();
                        }
                    });
                } else if (id_katalog) {
                    prosesKatalog();
                } else {
                    jalankanUpdate();
                }

                function prosesKatalog() {
                    dbKatalog.query('SELECT * FROM katalog WHERE id_katalog = ?', [id_katalog], (eKat, rKat) => {
                        if (eKat || rKat.length === 0) return reject(new Error('Katalog tidak ditemukan'));
                        dbStylist.query('SELECT * FROM Stylist WHERE id_stylist = ?', [rKat[0].id_stylist], (eSty, rSty) => {
                            if (eSty || rSty.length === 0) return reject(new Error('Stylist tidak ditemukan'));
                            targetKatalog = { id_katalog, layanan: rKat[0].nama_layanan, nama_stylist: rSty[0].nama, harga: rSty[0].harga };
                            jalankanUpdate();
                        });
                    });
                }
            });
        });
    },

    // --- FITUR DELETE APPOINTMENT ---
    deleteAppointment: ({ id }) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM appointment WHERE id_appointment = ?', [id], (errCheck, rows) => {
                if (errCheck) return reject(errCheck);
                if (rows.length === 0) return reject(new Error('Appointment tidak ditemukan'));

                db.query('DELETE FROM appointment WHERE id_appointment = ?', [id], (errDel) => {
                    if (errDel) return reject(errDel);
                    resolve(`Appointment dengan ID ${id} berhasil dihapus`);
                });
            });
        });
    }
};

// ================= ENDPOINT GRAPHQL =================
app.use("/graphql", graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true // Ini otomatis menyalakan UI GraphiQL bawaan express-graphql
}));

// ================= RUN SERVER (Port 3004) =================
app.listen(3004, () => {
    console.log("GraphQL Server Appointment berjalan di http://localhost:3004/graphql");
});
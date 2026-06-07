require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

const db = require('./db');
const db1 = require('../stylist-service/db');


app.use(cors());
app.use(express.json());
// -------------------------------------------------------- KATALOG AREA --------------------------------------------------------
const query = (database, sql, params = []) => {
  return new Promise((resolve, reject) => {
    database.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const queryPromise = (database, sql, params = []) => {
  return database.promise().query(sql, params).then(([rows]) => rows);
};

const schema = buildSchema(`

  # Tipe data Katalog (dengan data join Stylist)
  type Katalog {
    id_katalog: ID!
    nama_layanan: String!
    nama_stylist: String
    status: String
    harga: Float
  }

  # Tipe data hasil operasi tambah / edit
  type KatalogMutationResult {
    message: String!
    id_katalog: ID!
    id_stylist: ID
    nama_layanan: String
  }

  # Tipe data hasil operasi delete
  type DeleteResult {
    message: String!
    id_katalog: ID!
  }

  # ---- QUERY ----
  type Query {

  # Ambil semua katalog
  getAllKatalog: [Katalog!]!

  # Ambil katalog berdasarkan ID
  getKatalogById(
    id_katalog: ID!
  ): Katalog
}

  # ---- MUTATION ----
  type Mutation {
    # Tambah katalog baru
    addKatalog(
      id_stylist: ID!
      nama_layanan: String!
    ): KatalogMutationResult!

    # Update katalog berdasarkan id
    updateKatalog(
      id_katalog: ID!
      id_stylist: ID!
      nama_layanan: String!
    ): KatalogMutationResult!

    # Hapus katalog berdasarkan id
    deleteKatalog(
      id_katalog: ID!
    ): DeleteResult!
  }
`);
db.query('SELECT DATABASE() AS db', (err, rows) => {
  console.log('DB katalog:', rows);
});

db1.query('SELECT DATABASE() AS db', (err, rows) => {
  console.log('DB stylist:', rows);
});
const root = {
     getAllKatalog: async () => {
    try {
      const katalogRows = await queryPromise(db, 'SELECT * FROM katalog');
      const stylistRows = await queryPromise(db1, 'SELECT * FROM stylist');

      return katalogRows.map(kt => {
        const st = stylistRows.find(s => s.id_stylist === kt.id_stylist);
       return {
    id_katalog: kt.id_katalog,
    nama_layanan: kt.nama_layanan,
    nama_stylist: st ? st.nama : '-',
    status: st ? st.status : '-',
    harga: st ? st.harga : 0
};
      });
    } catch (err) {
      console.error('Error getAllKatalog:', err);
      throw new Error('Gagal mengambil data katalog');
    }
  },

  getKatalogById: async ({ id_katalog }) => {
  try {

    const katalogRows = await queryPromise(
      db,
      'SELECT * FROM katalog WHERE id_katalog = ?',
      [id_katalog]
    );

    if (katalogRows.length === 0) {
      throw new Error(
        `Katalog dengan ID ${id_katalog} tidak ditemukan`
      );
    }

    const kt = katalogRows[0];

    const stylistRows = await queryPromise(
      db1,
      'SELECT * FROM stylist WHERE id_stylist = ?',
      [kt.id_stylist]
    );

    const st = stylistRows[0];

    return {
      id_katalog: kt.id_katalog,
      nama_layanan: kt.nama_layanan,
      nama_stylist: st ? st.nama : '-',
      status: st ? st.status : '-',
      harga: st ? st.harga : 0
    };

  } catch (err) {
    console.error('Error getKatalogById:', err);
    throw new Error('Gagal mengambil data katalog');
  }
},

    addKatalog: async ({ id_stylist, nama_layanan }) => {
    if (!id_stylist || !nama_layanan) {
      throw new Error('ID Stylist dan nama layanan harus diisi');
    }

    const stylistCheck = await query(
      db1,
      'SELECT id_stylist FROM Stylist WHERE id_stylist = ?',
      [id_stylist]
    );

    if (stylistCheck.length === 0) {
      throw new Error(`Gagal tambah katalog. Stylist dengan ID ${id_stylist} tidak ditemukan!`);
    }

      const result = await query(
      db,
      'INSERT INTO katalog (id_stylist, nama_layanan) VALUES (?, ?)',
      [id_stylist, nama_layanan]
    );

    return {
      message:      'Katalog berhasil ditambah!',
      id_katalog:   result.insertId,
      id_stylist,
      nama_layanan
    };
  },

    updateKatalog: async ({ id_katalog, id_stylist, nama_layanan }) => {
    if (!id_stylist || !nama_layanan) {
      throw new Error('ID Stylist dan nama layanan harus diisi');
    }

    // Validasi stylist ada
    const stylistCheck = await query(
      db1,
      'SELECT id_stylist FROM Stylist WHERE id_stylist = ?',
      [id_stylist]
    );

    if (stylistCheck.length === 0) {
      throw new Error(`Gagal update. Stylist dengan ID ${id_stylist} tidak ditemukan di database!`);
    }

    // Update katalog
    const result = await query(
      db,
      'UPDATE katalog SET id_stylist = ?, nama_layanan = ? WHERE id_katalog = ?',
      [id_stylist, nama_layanan, id_katalog]
    );

    if (result.affectedRows === 0) {
      throw new Error(`Data katalog dengan ID ${id_katalog} tidak ditemukan`);
    }

    return {
      message:      'Katalog berhasil diperbarui!',
      id_katalog,
      id_stylist,
      nama_layanan
    };
  },

      deleteKatalog: async ({ id_katalog }) => {
    const result = await query(
      db,
      'DELETE FROM katalog WHERE id_katalog = ?',
      [id_katalog]
    );

    if (result.affectedRows === 0) {
      throw new Error(`Data katalog dengan ID ${id_katalog} tidak ditemukan`);
    }

    return {
      message:    'Data berhasil dihapus',
      id_katalog
    };
  }
};

    app.use('/graphql', graphqlHTTP({
  schema:    schema,
  rootValue: root,
  graphiql:  true 
}));

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server KicauSalon jalan di http://localhost:${PORT}/graphql`);
  console.log('Service Katalog berjalan dengan database katalog_db');
});
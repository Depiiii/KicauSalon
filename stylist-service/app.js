require('dotenv').config();

const express = require('express');
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const app = express();

const db = require('./db');


app.use(express.json());

// -------------------------------------------------------- STYLIST AREA --------------------------------------------------------

// ================= SCHEMA =================
const schema = buildSchema(`
    type Stylist {
        id_stylist: ID!
        nama: String
        status: String
        harga: Int
    }

    type Query {
        getAllStylist: [Stylist]
        getStylistById(id_stylist: ID!): Stylist
    }

    type Mutation {
        addStylist(
            id_stylist: ID!
            nama: String!
            status: String!
            harga: Int!
        ): Stylist

        updateStylist(
            id_stylist: ID!
            nama: String
            status: String
            harga: Int
        ): Stylist

        deleteStylist(
            id_stylist: ID!
        ): String
    }
`);

const root = {

// --- FITUR GET STYLIST ---
 getAllStylist: () => {
        return new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM Stylist",
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
    },


// --- FITUR TAMBAH STYLIST ---
addStylist: ({
        id_stylist,
        nama,
        status,
        harga
    }) => {
        return new Promise((resolve, reject) => {

            const sql =
                "INSERT INTO Stylist (id_stylist, nama, status) VALUES (?, ?, ?)";

            db.query(
                sql,
                [id_stylist, nama, status, harga],
                (err) => {
                    if (err) reject(err);

                    resolve({
                        id_stylist,
                        nama,
                        status,
                        harga
                    });
                }
            );
        });
    },

// --- FITUR HAPUS STYLIST ---
deleteStylist: ({ id_stylist }) => {
        return new Promise((resolve, reject) => {

            db.query(
                "DELETE FROM Stylist WHERE id_stylist = ?",
                [id_stylist],
                (err, result) => {

                    if (err) reject(err);

                    if (result.affectedRows === 0) {
                        resolve(
                            `Stylist dengan ID ${id_stylist} tidak ditemukan`
                        );
                    } else {
                        resolve(
                            `Stylist dengan ID ${id_stylist} berhasil dihapus`
                        );
                    }
                }
            );
        });
    },

// --- FITUR EDIT STYLIST ---
updateStylist: ({
        id_stylist,
        nama,
        status,
        harga
    }) => {
        return new Promise((resolve, reject) => {

            const sql = `
                UPDATE Stylist
                SET
                    nama = COALESCE(?, nama),
                    status = COALESCE(?, status),
                    harga = COALESCE(?, harga)
                WHERE id_stylist = ?
            `;

            db.query(
                sql,
                [nama, status, harga, id_stylist],
                (err) => {
                    if (err) reject(err);

                    db.query(
                        "SELECT * FROM Stylist WHERE id_stylist = ?",
                        [id_stylist],
                        (err2, results) => {
                            if (err2) reject(err2);

                            resolve(results[0]);
                        }
                    );
                }
            );
        });
    }
};

// ================= ENDPOINT GRAPHQL =================
app.use("/graphql", graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

// ================= RUN SERVER =================
app.listen(3002, () => {
    console.log(
        "GraphQL Server berjalan di http://localhost:3002/graphql"
    );
});
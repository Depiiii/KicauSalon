require('dotenv').config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLNonNull
} = require('graphql');
const app = express();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require("cors");
app.use(cors());


// Koneksi Database
const db = require('./db');
app.use(express.json());


// ================= TYPE =================

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id_user: { type: GraphQLInt },
        nama: { type: GraphQLString },
        email: { type: GraphQLString },
        no_telepon: { type: GraphQLString },
        role: { type: GraphQLString }
    })
});

const LoginType = new GraphQLObjectType({
    name: 'Login',
    fields: () => ({
        token: { type: GraphQLString },
        nama: { type: GraphQLString },
        role: { type: GraphQLString },
        id_user: { type: GraphQLInt }
    })
});

// ================= QUERY =================

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {

        users: {
            type: require('graphql').GraphQLList(UserType),

            async resolve() {
                const [rows] = await db.promise().query(
                    'SELECT * FROM users'
                );

                return rows;
            }
        },

        user: {
            type: UserType,

            args: {
                id_user: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },

            async resolve(parent, args) {

                const [rows] = await db.promise().query(
                    'SELECT * FROM users WHERE id_user = ?',
                    [args.id_user]
                );

                return rows[0];
            }
        }

    }
});

// ================= MUTATION =================

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {

        // REGISTER USER
        register: {
            type: UserType,

            args: {
                nama: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
                no_telepon: { type: GraphQLString }
            },

            async resolve(parent, args) {

                const [cekEmail] = await db.promise().query(
                    'SELECT * FROM users WHERE email = ?',
                    [args.email]
                );

                if (cekEmail.length > 0) {
                    throw new Error('Email sudah digunakan');
                }

                const hashedPassword =
                    await bcrypt.hash(args.password, 10);

                const [result] =
                    await db.promise().query(
                        `
                        INSERT INTO users
                        (nama,email,password,no_telepon,role)
                        VALUES (?,?,?,?,?)
                        `,
                        [
                            args.nama,
                            args.email,
                            hashedPassword,
                            args.no_telepon,
                            'user'
                        ]
                    );

                const [user] =
                    await db.promise().query(
                        'SELECT * FROM users WHERE id_user = ?',
                        [result.insertId]
                    );

                return user[0];
            }
        },

        // LOGIN
        login: {
            type: LoginType,

            args: {
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) }
            },

            async resolve(parent, args) {

                const [rows] =
                    await db.promise().query(
                        'SELECT * FROM users WHERE email = ?',
                        [args.email]
                    );

                if (rows.length === 0) {
                    throw new Error('Email tidak ditemukan');
                }

                const user = rows[0];

                const cocok =
                    await bcrypt.compare(
                        args.password,
                        user.password
                    );

                if (!cocok) {
                    throw new Error('Password salah');
                }

                const token = jwt.sign(
                    {
                        id_user: user.id_user,
                        role: user.role
                    },
                    'SECRETKEY123',
                    {
                        expiresIn: '1d'
                    }
                );

                return {
                    token: token,
                    nama: user.nama,
                    role: user.role,
                    id_user: user.id_user
                };
            }
        },
        updateUser: {
            type: UserType,

            args: {
                id_user: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                nama: {
                    type: GraphQLString
                },
                email: {
                    type: GraphQLString
                },
                password: {
                    type: GraphQLString
                },
                no_telepon: {
                    type: GraphQLString
                }
            },

            async resolve(parent, args) {

                const [userLama] = await db.promise().query(
                    'SELECT * FROM users WHERE id_user = ?',
                    [args.id_user]
                );

                if (userLama.length === 0) {
                    throw new Error('User tidak ditemukan');
                }

                let passwordBaru = userLama[0].password;

                if (args.password) {
                    passwordBaru = await bcrypt.hash(
                        args.password,
                        10
                    );
                }

                await db.promise().query(
                    `
            UPDATE users
            SET
                nama = ?,
                email = ?,
                password = ?,
                no_telepon = ?
            WHERE id_user = ?
            `,
                    [
                        args.nama || userLama[0].nama,
                        args.email || userLama[0].email,
                        passwordBaru,
                        args.no_telepon || userLama[0].no_telepon,
                        args.id_user
                    ]
                );
                const [cekEmail] = await db.promise().query(
                    'SELECT * FROM users WHERE email = ? AND id_user != ?',
                    [args.email, args.id_user]
                );

                if (cekEmail.length > 0) {
                    throw new Error('Email sudah digunakan');
                }
                const [userBaru] = await db.promise().query(
                    'SELECT * FROM users WHERE id_user = ?',
                    [args.id_user]
                );

                return userBaru[0];
            }
        }
    }
});

// ================= SCHEMA =================

const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});

// ================= GRAPHQL =================

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}));

// ================= SERVER =================

app.listen(3000, () => {
    console.log('Server berjalan');
    console.log('http://localhost:3000/graphql');
});
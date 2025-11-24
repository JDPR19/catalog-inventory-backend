const { Pool } = require('pg');
const { db } = require('./config');

const pool = new Pool({
    user: db.user,
    host: db.host,
    database: db.database,
    password: db.password,
    port: db.port
});

// TESTEANDO LA CONEXION //

console.log('Conectando a la base de datos:', db);

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error al Conectar a la Base de Datos:', err);
    } else {
        console.log('conexión Exitosa a PostgreSql:', res.rows[0].now);
    }
});

module.exports = pool;

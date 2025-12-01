const express = require('express'); // Force redeploy
const morgan = require('morgan');
const cors = require('cors');
const db = require('./src/db/db');
const path = require('path');
const fs = require('fs');

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Carpeta uploads creada');
}

// Rutas //
const autobusesRoutes = require('./src/routes/autobuses.routes');
const repuestosRoutes = require('./src/routes/repuestos.routes');
const authRoutes = require('./src/routes/auth.routes');

// configuracion de Cors //
const allowed = [
    "https://catalog-inventory-frontend.vercel.app",
    'http://localhost:5173',
    'http://localhost:5174',
    'https://catalog-inventory-frontend.vercel.app',
    'http://localhost:4000'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps o curl)
        if (!origin) return callback(null, true);

        // Permitir dominios específicos
        if (allowed.indexOf(origin) !== -1) {
            callback(null, true);
        }
        // Permitir todos los dominios de Vercel (preview deployments)
        else if (origin.endsWith('.vercel.app')) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
};

// inicializacion de express, cors, morgan //

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan('dev'));

// Servir archivos estáticos con CORS
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}, express.static(path.join(__dirname, 'uploads')));

// Rutas de la API //
app.use('/autobuses', autobusesRoutes);
app.use('/repuestos', repuestosRoutes);
app.use('/auth', authRoutes);

// Manejadores de errores globales //
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Ruta no Encontrada o es inexistente',
    });
});

app.use((err, req, res, next) => {
    console.error('Error Capturado:', err.stack);
    res.status(err.status || 500).json({
        message: 'Ocurrió un error interno en el servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno',
    });
});

// configuración de Puerto mas listado para su inicio //

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON PORT: ${PORT}`);
})

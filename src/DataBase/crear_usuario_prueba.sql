-- SQL para crear un usuario de prueba en la base de datos
-- Ejecuta este script en tu base de datos PostgreSQL

-- Primero, genera el hash de la contraseña en Node.js:
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('admin123', 10).then(hash => console.log(hash));

-- Luego inserta el usuario con el hash generado:
INSERT INTO usuarios (nombre, apellido, email, password)
VALUES (
    'Admin',
    'Yutong',
    'admin@yutong.com',
    '$2b$10$9ovqcMXGsSNBf8Ef0o5lrOeOsRAZQG.omoLke1az4pug2YCYYSuLa'
);

-- Credenciales para iniciar sesión:
-- Email: admin@yutong.com
-- Password: admin123

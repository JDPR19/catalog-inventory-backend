const pool = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
    const { nombre, apellido, email, password } = req.body;

    // Validation
    if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Name validation
    if (nombre.trim().length < 2) {
        return res.status(400).json({ message: 'El nombre debe tener al menos 2 caracteres' });
    }

    // Last name validation
    if (apellido.trim().length < 2) {
        return res.status(400).json({ message: 'El apellido debe tener al menos 2 caracteres' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'El correo electrónico no es válido' });
    }

    // Password validation
    if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ message: 'La contraseña debe contener al menos una letra mayúscula' });
    }
    if (!/[0-9]/.test(password)) {
        return res.status(400).json({ message: 'La contraseña debe contener al menos un número' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const response = await pool.query(`
            INSERT INTO usuarios (nombre, apellido, email, password)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nombre, apellido, email
        `, [nombre.trim(), apellido.trim(), email.toLowerCase().trim(), hashedPassword]);

        return res.status(201).json(response.rows[0]);
    } catch (error) {
        console.error('Error en registro:', error);
        if (error.code === '23505') {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }
        next(error);
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'El correo electrónico no es válido' });
    }

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email.toLowerCase().trim()]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1h' }
        );

        return res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                imagen: user.imagen
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    const { id } = req.params;
    const { nombre, apellido, email, password } = req.body;
    const imagen = req.file ? req.file.filename : undefined;

    console.log('--- UpdateUser Debug ---');
    console.log('Params ID:', id, 'Type:', typeof id);
    console.log('User from Token:', req.user);

    if (!req.user || !req.user.id) {
        console.log('Error: req.user or req.user.id is missing');
        return res.status(401).json({ message: 'Token inválido o sesión expirada' });
    }

    // Verificar que el usuario solo modifique su propia cuenta (o ser admin)
    // Convertir ambos a número para evitar problemas de tipos (string vs number)
    if (Number(id) !== Number(req.user.id)) {
        console.log(`Authorization failed: ${Number(id)} !== ${Number(req.user.id)}`);
        return res.status(403).json({ message: 'No tienes permiso para editar este usuario' });
    }

    try {
        // First, get the current user to check for old image
        const currentUserResult = await pool.query('SELECT imagen FROM usuarios WHERE id = $1', [id]);
        const currentUser = currentUserResult.rows[0];

        let query = 'UPDATE usuarios SET nombre = $1, apellido = $2, email = $3';
        let values = [nombre, apellido, email];
        let paramIndex = 4;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += `, password = $${paramIndex}`;
            values.push(hashedPassword);
            paramIndex++;
        }

        if (imagen) {
            query += `, imagen = $${paramIndex}`;
            values.push(imagen);
            paramIndex++;

            // Delete old image if it exists
            if (currentUser && currentUser.imagen) {
                const fs = require('fs');
                const path = require('path');
                const oldImagePath = path.join('uploads', currentUser.imagen);
                // Check if file exists before trying to unlink to avoid errors
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('Error deleting old image:', err);
                    });
                }
            }
        }

        query += ` WHERE id = $${paramIndex} RETURNING id, nombre, apellido, email, imagen`;
        values.push(id);

        const response = await pool.query(query, values);
        return res.json(response.rows[0]);
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        next(error);
    }
};

module.exports = {
    register,
    login,
    updateUser
};

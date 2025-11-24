const pool = require('../db/db');
const fs = require('fs').promises;
const path = require('path');

const getAllAutobuses = async (req, res, next) => {
    try {
        const response = await pool.query('SELECT * FROM autobuses Order BY modelo DESC');
        return res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener todos los datos solicitados', error);
        next(error);
    }
}

const getAutobusesById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const response = await pool.query('SELECT * FROM autobuses WHERE id = $1', [id]);
        if (response.rows.length === 0) {
            return res.status(404).json({ message: 'Autobus no encontrado o inexistente' });
        }
        return res.status(200).json(response.rows[0]);
    } catch (error) {
        console.error(`Error al obtener datos Solicitados para la id: ${id}`, error);
        next(error);
    }
}

const createAutobuses = async (req, res, next) => {
    const { marca, modelo, uso, descripcion, motor, puertas, asientos, transmision, combustible, neumaticos, direccion } = req.body;
    const imagen = req.file ? req.file.filename : null;

    // Validar campos requeridos
    if (!marca || !modelo) {
        // Si hay imagen, eliminarla porque el registro falló
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (err) {
                console.error('Error al eliminar imagen:', err);
            }
        }
        return res.status(400).json({ message: 'Marca y modelo son campos requeridos' });
    }

    try {
        const response = await pool.query(`
            INSERT INTO autobuses (marca, modelo, uso, descripcion, motor, puertas, asientos, transmision, combustible, neumaticos, direccion, imagen)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [marca, modelo, uso, descripcion, motor, puertas, asientos, transmision, combustible, neumaticos, direccion, imagen]);

        return res.status(201).json(response.rows[0]);
    } catch (error) {
        console.error('Error al Crear el registro', error);

        // Si hay error en la BD, eliminar la imagen que se subió
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
                console.log('Imagen eliminada debido a error en BD');
            } catch (err) {
                console.error('Error al eliminar imagen:', err);
            }
        }

        next(error);
    }
}

const editAutobuses = async (req, res, next) => {
    const { id } = req.params;
    const { marca, modelo, uso, descripcion, motor, puertas, asientos, transmision, combustible, neumaticos, direccion } = req.body;

    const imagen = req.file ? req.file.filename : undefined;

    // Validar campos requeridos
    if (!marca || !modelo) {
        // Si hay imagen nueva, eliminarla porque el registro falló
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (err) {
                console.error('Error al eliminar imagen:', err);
            }
        }
        return res.status(400).json({ message: 'Marca y modelo son campos requeridos' });
    }

    try {
        // Primero obtener la imagen antigua si existe
        const oldBus = await pool.query('SELECT imagen FROM autobuses WHERE id = $1', [id]);
        const oldImagen = oldBus.rows[0]?.imagen;

        let query = `
            UPDATE autobuses
            SET marca = $1,
                modelo = $2,
                uso = $3,
                descripcion = $4,
                motor = $5,
                puertas = $6,
                asientos = $7,
                transmision = $8,
                combustible = $9,
                neumaticos = $10,
                direccion = $11
        `;
        const values = [marca, modelo, uso, descripcion, motor, puertas, asientos, transmision, combustible, neumaticos, direccion];

        if (imagen) {
            query += `, imagen = $12 WHERE id = $13 RETURNING *`;
            values.push(imagen, id);
        } else {
            query += ` WHERE id = $12 RETURNING *`;
            values.push(id);
        }

        const response = await pool.query(query, values);

        // Si la actualización fue exitosa y hay nueva imagen, eliminar la antigua
        if (imagen && oldImagen && oldImagen !== imagen) {
            try {
                const oldImagePath = path.join('uploads', oldImagen);
                await fs.unlink(oldImagePath);
                console.log('Imagen antigua eliminada');
            } catch (err) {
                console.error('Error al eliminar imagen antigua:', err);
            }
        }

        return res.status(200).json(response.rows[0]);
    } catch (error) {
        console.error(`Error al editar el registro para la id:${id}`, error);

        // Si hay error en la BD, eliminar la nueva imagen que se subió
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
                console.log('Nueva imagen eliminada debido a error en BD');
            } catch (err) {
                console.error('Error al eliminar imagen:', err);
            }
        }

        next(error);
    }
}

const deleteAutobuses = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Primero obtener la imagen para eliminarla
        const bus = await pool.query('SELECT imagen FROM autobuses WHERE id = $1', [id]);
        const imagen = bus.rows[0]?.imagen;

        const response = await pool.query('DELETE FROM autobuses WHERE id = $1', [id]);
        if (response.rowCount === 0) {
            return res.status(404).json({ message: 'Autobus no encontrado o inexistente' });
        }

        // Eliminar la imagen del servidor si existe
        if (imagen) {
            try {
                const imagePath = path.join('uploads', imagen);
                await fs.unlink(imagePath);
                console.log('Imagen eliminada del servidor');
            } catch (err) {
                console.error('Error al eliminar imagen del servidor:', err);
            }
        }

        return res.status(200).json({ message: 'Autobus eliminado correctamente' });
    } catch (error) {
        console.error(`Error al eliminar el registro para la id: ${id}`, error);
        next(error);
    }
}



module.exports = {
    getAllAutobuses,
    getAutobusesById,
    createAutobuses,
    editAutobuses,
    deleteAutobuses,
}

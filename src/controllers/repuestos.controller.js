const pool = require('../db/db');

const getALLRepuestos = async (req, res, next) => {
    try {
        const response = await pool.query('SELECT * FROM repuestos Order BY nombre DESC');
        return res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener todos los datos solicitados', error);
        next(error);
    }
}

const getRepuestosById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const response = await pool.query('SELECT * FROM repuestos WHERE id = $1', [id]);
        if (response.rows.length === 0) {
            return res.status(404).json({ message: 'Repuesto no encontrado o inexistente' });
        }
        return res.status(200).json(response.rows[0]);
    } catch (error) {
        console.error(`Error al obtener datos Solicitados para la id: ${id}`, error);
        next(error);
    }
}

const createRepuestos = async (req, res, next) => {
    const { nombre, categoria, descripcion } = req.body;
    const imagen = req.file ? req.file.filename : null;

    try {
        // Check for duplicates
        const checkDuplicate = await pool.query('SELECT * FROM repuestos WHERE nombre = $1', [nombre]);
        if (checkDuplicate.rows.length > 0) {
            return res.status(409).json({ message: 'El repuesto ya existe' });
        }

        const response = await pool.query(`
            INSERT INTO repuestos (nombre, categoria, descripcion, imagen)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [nombre, categoria, descripcion, imagen]);
        return res.status(201).json(response.rows[0]);
    } catch (error) {
        console.error('Error al Crear el registro', error);
        next(error);
    }
}

const editRepuestos = async (req, res, next) => {
    const { id } = req.params;
    const { nombre, categoria, descripcion } = req.body;
    const imagen = req.file ? req.file.filename : undefined;

    try {
        let query = `
            UPDATE repuestos
            SET nombre = $1,
                categoria = $2,
                descripcion = $3
        `;
        const values = [nombre, categoria, descripcion];

        if (imagen) {
            query += `, imagen = $4 WHERE id = $5 RETURNING *`;
            values.push(imagen, id);
        } else {
            query += ` WHERE id = $4 RETURNING *`;
            values.push(id);
        }

        const response = await pool.query(query, values);
        return res.status(200).json(response.rows[0]);
    } catch (error) {
        console.error(`Error al editar el registro para la id:${id}`);
        next(error);
    }
}

const deleteRepuestos = async (req, res, next) => {
    const { id } = req.params;

    try {
        const response = await pool.query('DELETE FROM repuestos WHERE id = $1', [id]);
        if (response.rowCount === 0) {
            return res.status(404).json({ message: 'Repuesto no encontrado o inexistente' });
        }
        return res.status(200).json({ message: 'Repuesto eliminado correctamente' });
    } catch (error) {
        console.error(`Error al eliminar el registro para la id:${id}`);
        next(error);
    }
}

module.exports = {
    getALLRepuestos,
    getRepuestosById,
    createRepuestos,
    editRepuestos,
    deleteRepuestos,
}
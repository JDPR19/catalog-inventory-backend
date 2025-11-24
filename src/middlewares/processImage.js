const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const processImage = async (req, res, next) => {
    if (!req.file) return next();

    const filename = `${uuidv4()}.webp`;
    const outputPath = path.join('uploads', filename);

    try {
        await sharp(req.file.buffer)
            .webp({ quality: 80 })
            .toFile(outputPath);

        // Actualizar req.file para que el controlador tenga la info correcta
        req.file.filename = filename;
        req.file.path = outputPath;
        req.file.mimetype = 'image/webp';

        next();
    } catch (error) {
        console.error('Error processing image:', error);
        return res.status(500).json({ message: 'Error al procesar la imagen' });
    }
};

module.exports = processImage;

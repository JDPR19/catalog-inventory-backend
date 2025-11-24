const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado: Token no proporcionado' });
    }

    try {
        // El token suele venir como "Bearer <token>", así que quitamos "Bearer "
        const bearerToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

        const verified = jwt.verify(bearerToken, process.env.JWT_SECRET || 'secretkey');
        req.user = verified;
        console.log('Token verified, user:', req.user);
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = validateToken;

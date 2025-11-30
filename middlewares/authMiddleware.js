const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el token JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Token no proporcionado'
            });
        }

        const secretKey = process.env.SECRET_KEY;

        if (!secretKey) {
            return res.status(500).json({
                error: 'Error de configuración del servidor'
            });
        }

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    error: 'Token inválido o expirado'
                });
            }

            req.userId = decoded.userId;
            req.userEmail = decoded.email;
            req.userRol = decoded.rol;

            next();
        });
    } catch (error) {
        return res.status(401).json({
            error: 'Error al verificar el token'
        });
    }
};

/**
 * Middleware para verificar si el usuario es administrador
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const requireAdmin = (req, res, next) => {
    if (req.userRol !== 'admin') {
        return res.status(403).json({
            error: 'Acceso denegado. Se requieren permisos de administrador'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin
};


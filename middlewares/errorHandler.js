/**
 * Middleware de manejo de errores centralizado
 * @param {Object} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Errores de MySQL
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'Conflicto de integridad',
            message: 'Ya existe un registro con esos datos'
        });
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            error: 'Referencia inválida',
            message: 'El registro referenciado no existe'
        });
    }

    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            error: 'Error de conexión',
            message: 'No se pudo conectar a la base de datos'
        });
    }

    // Errores de validación
    if (err.message && err.message.includes('Datos inválidos')) {
        return res.status(400).json({
            error: 'Error de validación',
            message: err.message
        });
    }

    // Errores de autenticación
    if (err.message && err.message.includes('Credenciales')) {
        return res.status(401).json({
            error: 'Error de autenticación',
            message: err.message
        });
    }

    // Errores de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido',
            message: 'El token proporcionado no es válido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado',
            message: 'El token ha expirado'
        });
    }

    // Error genérico del servidor
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';

    res.status(statusCode).json({
        error: 'Error del servidor',
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;


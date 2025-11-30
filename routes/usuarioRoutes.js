const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// Obtener todos los usuarios
router.get('/', authenticateToken, userController.list);

// Obtener un usuario por ID
router.get('/:id', authenticateToken, userController.getById);

// Crear un nuevo usuario
router.post('/', authenticateToken, userController.create);

// Actualizar un usuario
router.put('/:id', authenticateToken, userController.update);

// Actualizar parcialmente un usuario
router.patch('/:id', authenticateToken, userController.partialUpdate);

// Eliminar un usuario
router.delete('/:id', authenticateToken, userController.remove);

module.exports = router;


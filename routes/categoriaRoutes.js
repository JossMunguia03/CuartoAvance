const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const categoryController = require('../controllers/categoryController');

// Obtener todas las categorías
router.get('/', categoryController.list);

// Buscar categorías por término
router.get('/search', categoryController.search);

// Obtener una categoría por ID
router.get('/:id', categoryController.getById);

// Obtener frases de una categoría
router.get('/:id/frases', categoryController.getFrases);

// Obtener estadísticas de una categoría
router.get('/:id/estadisticas', categoryController.getStats);

// Crear una nueva categoría (Protegida)
router.post('/', authenticateToken, categoryController.create);

// Actualizar una categoría (Protegida)
router.put('/:id', authenticateToken, categoryController.update);

// Actualizar parcialmente una categoría (Protegida)
router.patch('/:id', authenticateToken, categoryController.partialUpdate);

// Eliminar una categoría (Protegida)
router.delete('/:id', authenticateToken, categoryController.remove);

module.exports = router;

